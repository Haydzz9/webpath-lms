// Demo-mode data layer: everything lives in this browser's localStorage.
// It mirrors api.supabase.js so the app can be tried before Supabase is set
// up. It is NOT secure (passwords are stored in plain text) and is not meant
// for real classes.
import { tracks } from '../content/index.js'

const KEY = 'webpath-demo-db'
const load = () => {
  try {
    return { users: [], session: null, progress: [], quiz: [], projects: [], certs: [], ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { users: [], session: null, progress: [], quiz: [], projects: [], certs: [] }
  }
}
const save = (db) => localStorage.setItem(KEY, JSON.stringify(db))
const id = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2))
const now = () => new Date().toISOString()

export function makeLocalApi() {
  const listeners = new Set()
  const me = (db) => db.users.find((u) => u.id === db.session)
  const need = (db) => {
    const u = me(db)
    if (!u) throw new Error('Please sign in.')
    return u
  }
  const notify = () => {
    const u = me(load())
    listeners.forEach((cb) => cb(u ? { id: u.id, email: u.email } : null))
  }

  return {
    mode: 'demo',

    async currentUser() {
      const u = me(load())
      return u ? { id: u.id, email: u.email } : null
    },
    onAuth(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    async signUp({ email, password, fullName, studentNo, section, demoInstructor }) {
      const db = load()
      if (db.users.some((u) => u.email === email)) throw new Error('That email is already registered.')
      const user = {
        id: id(), email, password, full_name: fullName, student_no: studentNo, section,
        role: demoInstructor ? 'instructor' : 'student', created_at: now(),
      }
      db.users.push(user)
      db.session = user.id
      save(db)
      notify()
      return { needsConfirm: false }
    },
    async signIn(email, password) {
      const db = load()
      const u = db.users.find((x) => x.email === email && x.password === password)
      if (!u) throw new Error('Invalid login credentials')
      db.session = u.id
      save(db)
      notify()
    },
    async signOut() {
      const db = load()
      db.session = null
      save(db)
      notify()
    },

    async myData() {
      const db = load()
      const u = need(db)
      const { password: _pw, ...profile } = u
      const mine = (rows) => rows.filter((r) => r.user_id === u.id)
      return { profile, progress: mine(db.progress), quiz: mine(db.quiz), projects: mine(db.projects), certs: mine(db.certs) }
    },
    async saveProgress(trackId, itemId, code, completed) {
      const db = load()
      const u = need(db)
      let row = db.progress.find((r) => r.user_id === u.id && r.item_id === itemId)
      if (!row) db.progress.push((row = { user_id: u.id, item_id: itemId, track_id: trackId, completed: false }))
      row.code = code
      row.updated_at = now()
      if (completed) Object.assign(row, { completed: true, completed_at: now() })
      save(db)
    },
    async addQuizAttempt(trackId, score, total, passed) {
      const db = load()
      db.quiz.push({ id: id(), user_id: need(db).id, track_id: trackId, score, total, passed, created_at: now() })
      save(db)
    },
    async submitProject(trackId, url, notes) {
      const db = load()
      const u = need(db)
      let row = db.projects.find((r) => r.user_id === u.id && r.track_id === trackId)
      if (row?.status === 'approved') throw new Error('This project is already approved.')
      if (!row) db.projects.push((row = { user_id: u.id, track_id: trackId, feedback: '' }))
      Object.assign(row, { url, notes, status: 'pending', submitted_at: now() })
      save(db)
    },
    async claimCertificate(trackId) {
      const db = load()
      const u = need(db)
      const track = tracks.find((t) => t.id === trackId)
      const done = db.progress.filter((r) => r.user_id === u.id && r.track_id === trackId && r.completed).length
      if (done < track.challenges.length) throw new Error('Finish all challenges first.')
      if (!db.quiz.some((r) => r.user_id === u.id && r.track_id === trackId && r.passed)) throw new Error('Pass the quiz first.')
      if (!db.projects.some((r) => r.user_id === u.id && r.track_id === trackId && r.status === 'approved'))
        throw new Error('Your project has not been approved yet.')
      let cert = db.certs.find((c) => c.user_id === u.id && c.track_id === trackId)
      if (!cert) db.certs.push((cert = { id: id(), user_id: u.id, track_id: trackId, full_name: u.full_name, issued_at: now() }))
      save(db)
      return cert
    },
    async getCertificate(certId) {
      return load().certs.find((c) => c.id === certId) || null
    },

    async classData() {
      const db = load()
      if (need(db).role !== 'instructor') throw new Error('Instructors only.')
      const counts = {}
      db.progress.filter((r) => r.completed).forEach((r) => {
        const k = r.user_id + '|' + r.track_id
        counts[k] = (counts[k] || 0) + 1
      })
      return {
        students: db.users.filter((u) => u.role === 'student').map(({ password: _pw, ...u }) => u),
        counts: Object.entries(counts).map(([k, done]) => ({ user_id: k.split('|')[0], track_id: k.split('|')[1], done })),
        quiz: db.quiz.filter((q) => q.passed),
        projects: db.projects,
        certs: db.certs,
      }
    },
    async reviewProject(userId, trackId, status, feedback) {
      const db = load()
      const u = need(db)
      if (u.role !== 'instructor') throw new Error('Instructors only.')
      const row = db.projects.find((r) => r.user_id === userId && r.track_id === trackId)
      Object.assign(row, { status, feedback, reviewed_by: u.id, reviewed_at: now() })
      save(db)
    },
  }
}
