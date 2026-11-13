// Data layer backed by Supabase (Auth + PostgreSQL). Row Level Security in
// supabase/schema.sql is what actually protects the data; this file only asks.
import { createClient } from '@supabase/supabase-js'

export function makeSupabaseApi(url, key) {
  const sb = createClient(url, key)
  const ok = ({ data, error }) => {
    if (error) throw new Error(error.message)
    return data
  }
  const uid = async () => (await sb.auth.getUser()).data.user?.id

  return {
    mode: 'supabase',

    async currentUser() {
      const { data } = await sb.auth.getSession()
      return data.session?.user ? { id: data.session.user.id, email: data.session.user.email } : null
    },
    onAuth(cb) {
      const { data } = sb.auth.onAuthStateChange((_e, session) =>
        cb(session?.user ? { id: session.user.id, email: session.user.email } : null),
      )
      return () => data.subscription.unsubscribe()
    },
    async signUp({ email, password, fullName, studentNo, section }) {
      const data = ok(
        await sb.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, student_no: studentNo, section },
            emailRedirectTo: window.location.origin + window.location.pathname,
          },
        }),
      )
      return { needsConfirm: !data.session }
    },
    async signIn(email, password) {
      ok(await sb.auth.signInWithPassword({ email, password }))
    },
    async signOut() {
      await sb.auth.signOut()
    },

    async myData() {
      const id = await uid()
      const [profile, progress, quiz, projects, certs] = await Promise.all([
        sb.from('profiles').select('*').eq('id', id).single(),
        sb.from('progress').select('item_id, track_id, code, completed, updated_at').eq('user_id', id),
        sb.from('quiz_attempts').select('*').eq('user_id', id).order('created_at'),
        sb.from('project_submissions').select('*').eq('user_id', id),
        sb.from('certificates').select('*').eq('user_id', id),
      ])
      return { profile: ok(profile), progress: ok(progress), quiz: ok(quiz), projects: ok(projects), certs: ok(certs) }
    },
    async saveProgress(trackId, itemId, code, completed) {
      const row = { user_id: await uid(), item_id: itemId, track_id: trackId, code, updated_at: new Date().toISOString() }
      // Never un-complete a challenge when a later draft is saved.
      if (completed) Object.assign(row, { completed: true, completed_at: new Date().toISOString() })
      ok(await sb.from('progress').upsert(row, { onConflict: 'user_id,item_id' }))
    },
    async addQuizAttempt(trackId, score, total, passed) {
      ok(await sb.from('quiz_attempts').insert({ user_id: await uid(), track_id: trackId, score, total, passed }))
    },
    async submitProject(trackId, url, notes) {
      ok(
        await sb
          .from('project_submissions')
          .upsert({ user_id: await uid(), track_id: trackId, url, notes }, { onConflict: 'user_id,track_id' }),
      )
    },
    async claimCertificate(trackId) {
      return ok(await sb.rpc('claim_certificate', { p_track: trackId }))
    },
    async getCertificate(id) {
      const rows = ok(await sb.rpc('verify_certificate', { p_id: id }))
      return rows?.[0] || null
    },

    // ---- instructor
    async classData() {
      const [students, counts, quiz, projects, certs] = await Promise.all([
        sb.from('profiles').select('*').eq('role', 'student').order('full_name').limit(2000),
        sb.rpc('class_progress'),
        sb.from('quiz_attempts').select('user_id, track_id, score, total, passed').eq('passed', true).limit(5000),
        sb.from('project_submissions').select('*').order('submitted_at', { ascending: false }).limit(5000),
        sb.from('certificates').select('id, user_id, track_id, issued_at').limit(5000),
      ])
      return { students: ok(students), counts: ok(counts), quiz: ok(quiz), projects: ok(projects), certs: ok(certs) }
    },
    async reviewProject(userId, trackId, status, feedback) {
      ok(
        await sb
          .from('project_submissions')
          .update({ status, feedback })
          .eq('user_id', userId)
          .eq('track_id', trackId),
      )
    },
  }
}
