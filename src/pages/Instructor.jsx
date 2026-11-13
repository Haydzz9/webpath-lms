import { useEffect, useMemo, useState } from 'react'
import { tracks } from '../content/index.js'
import { api } from '../lib/api.js'
import { isWebUrl } from './Project.jsx'

export default function Instructor() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('students')
  const [section, setSection] = useState('All')
  const [search, setSearch] = useState('')

  const load = () => api.classData().then(setData).catch((e) => setError(e.message))
  useEffect(() => {
    load()
  }, [])

  const view = useMemo(() => {
    if (!data) return null
    const key = (u, t) => `${u}|${t}`
    const done = Object.fromEntries(data.counts.map((c) => [key(c.user_id, c.track_id), Number(c.done)]))
    const quiz = new Set(data.quiz.map((q) => key(q.user_id, q.track_id)))
    const proj = Object.fromEntries(data.projects.map((p) => [key(p.user_id, p.track_id), p]))
    const cert = new Set(data.certs.map((c) => key(c.user_id, c.track_id)))
    const names = Object.fromEntries(data.students.map((s) => [s.id, s]))
    const rows = data.students.map((s) => ({
      ...s,
      cells: tracks.map((t) => ({
        track: t,
        done: done[key(s.id, t.id)] || 0,
        quiz: quiz.has(key(s.id, t.id)),
        project: proj[key(s.id, t.id)]?.status || '',
        cert: cert.has(key(s.id, t.id)),
      })),
    }))
    return { rows, names, sections: ['All', ...new Set(data.students.map((s) => s.section).filter(Boolean))] }
  }, [data])

  if (error) return <p className="center error">{error}</p>
  if (!view) return <p className="center muted">Loading class data…</p>

  const rows = view.rows.filter(
    (r) => (section === 'All' || r.section === section) && `${r.full_name} ${r.student_no} ${r.email}`.toLowerCase().includes(search.toLowerCase()),
  )
  const pending = data.projects.filter((p) => p.status === 'pending')

  function exportCsv() {
    const head = ['Name', 'Student No', 'Section', 'Email', ...tracks.flatMap((t) => [`${t.title} challenges`, `${t.title} quiz`, `${t.title} project`, `${t.title} certificate`])]
    const lines = rows.map((r) => [r.full_name, r.student_no, r.section, r.email, ...r.cells.flatMap((c) => [`${c.done}/${c.track.challenges.length}`, c.quiz ? 'passed' : '', c.project, c.cert ? 'yes' : ''])])
    const csv = [head, ...lines].map((l) => l.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'webpath-class-progress.csv'
    a.click()
  }

  return (
    <div>
      <h1>Instructor dashboard</h1>
      <div className="tabs">
        <button className={tab === 'students' ? 'on' : ''} onClick={() => setTab('students')}>Students ({data.students.length})</button>
        <button className={tab === 'reviews' ? 'on' : ''} onClick={() => setTab('reviews')}>Project reviews ({pending.length} pending)</button>
      </div>

      {tab === 'students' && (
        <>
          <div className="filters">
            <select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Section">
              {view.sections.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Search name, number or email" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="grow" />
            <button className="btn ghost small" onClick={exportCsv}>Export CSV</button>
          </div>
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Section</th>
                  {tracks.map((t) => <th key={t.id}>{t.title}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.full_name || '(no name)'}</strong><br /><span className="muted small">{r.student_no} {r.email}</span></td>
                    <td>{r.section}</td>
                    {r.cells.map((c) => (
                      <td key={c.track.id} className={c.cert ? 'cell certified' : 'cell'}>
                        <span className="num">{c.done}/{c.track.challenges.length}</span>
                        <span className="flags">
                          <span className={c.quiz ? 'flag on' : 'flag'} title="Quiz passed">Q</span>
                          <span className={c.project === 'approved' ? 'flag on' : c.project ? 'flag wait' : 'flag'} title={`Project ${c.project || 'not submitted'}`}>P</span>
                          <span className={c.cert ? 'flag on' : 'flag'} title="Certificate issued">C</span>
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={2 + tracks.length} className="muted">No students match.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="muted small">Each cell shows challenges completed, then Q = quiz passed, P = project (amber while awaiting review), C = certificate issued.</p>
        </>
      )}

      {tab === 'reviews' && (
        <div className="reviews">
          {data.projects.length === 0 && <p className="muted">No project submissions yet.</p>}
          {[...pending, ...data.projects.filter((p) => p.status !== 'pending')].map((p) => (
            <Review key={p.user_id + p.track_id} p={p} student={view.names[p.user_id]} onDone={load} />
          ))}
        </div>
      )}
    </div>
  )
}

function Review({ p, student, onDone }) {
  const track = tracks.find((t) => t.id === p.track_id)
  const [feedback, setFeedback] = useState(p.feedback || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function decide(status) {
    setBusy(true)
    setError('')
    try {
      await api.reviewProject(p.user_id, p.track_id, status, feedback.trim())
      await onDone()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className={`card review ${p.status}`}>
      <div className="review-head">
        <div>
          <strong>{student?.full_name || 'Unknown student'}</strong> <span className="muted">· {student?.section}</span>
          <p className="muted small">{track?.title}: {track?.project.title} · submitted {new Date(p.submitted_at).toLocaleString()}</p>
        </div>
        <span className={`pill ${p.status}`}>{p.status.replace('_', ' ')}</span>
      </div>
      {/* Student input is shown as text; the link opens only if it is a normal web address. */}
      <p>
        {isWebUrl(p.url) ? <a href={p.url} target="_blank" rel="noopener noreferrer">{p.url}</a> : <code>{p.url}</code>}
      </p>
      {p.notes && <p className="notes">{p.notes}</p>}
      <details>
        <summary>Requirements checklist</summary>
        <ul className="reqs">{track?.project.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
      </details>
      <label htmlFor={`fb-${p.user_id}-${p.track_id}`}>Feedback to the student</label>
      <textarea id={`fb-${p.user_id}-${p.track_id}`} rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button className="btn small" disabled={busy || p.status === 'approved'} onClick={() => decide('approved')}>Approve</button>
        <button className="btn ghost small" disabled={busy} onClick={() => decide('needs_revision')}>Request revision</button>
      </div>
    </div>
  )
}
