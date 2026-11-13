import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { trackById } from '../content/index.js'
import { api } from '../lib/api.js'
import { useStore } from '../lib/store.jsx'

export const isWebUrl = (u) => /^https?:\/\/[^\s]+\.[^\s]+$/i.test(u || '')

export default function Project() {
  const { trackId } = useParams()
  const track = trackById[trackId]
  const { status, refresh } = useStore()
  const sub = track ? status(track).project : null
  const [url, setUrl] = useState(sub?.url || '')
  const [notes, setNotes] = useState(sub?.notes || '')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  if (!track) return <Navigate to="/learn" replace />
  const approved = sub?.status === 'approved'

  async function submit(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    if (!isWebUrl(url.trim())) return setError('Enter a full link starting with https://')
    try {
      await api.submitProject(track.id, url.trim(), notes.trim())
      await refresh()
      setMsg('Submitted. Your instructor will review it.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="narrow" style={{ '--c': track.color }}>
      <p className="crumbs"><Link to="/learn">My learning</Link> / <Link to={`/learn/${track.id}`}>{track.title}</Link> / Project</p>
      <h1>{track.project.title}</h1>
      <p className="lead">{track.project.brief}</p>
      <h2>Requirements</h2>
      <ul className="reqs">{track.project.requirements.map((r) => <li key={r}>{r}</li>)}</ul>

      {sub && (
        <div className={`card status ${sub.status}`}>
          <strong>Status: {sub.status.replace('_', ' ')}</strong>
          {sub.feedback && <p><b>Instructor feedback:</b> {sub.feedback}</p>}
          {approved && <p>Approved. Go back to the track page to claim your certificate.</p>}
        </div>
      )}

      {!approved && (
        <form onSubmit={submit} className="card">
          <h2>{sub ? 'Resubmit' : 'Submit your project'}</h2>
          <label htmlFor="url">Link to your work (GitHub repository or live site)</label>
          <input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/you/project" required />
          <label htmlFor="notes">Notes for your instructor (optional)</label>
          <textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
          {error && <p className="error" role="alert">{error}</p>}
          {msg && <p className="notice">{msg}</p>}
          <button className="btn">{sub ? 'Resubmit for review' : 'Submit for review'}</button>
        </form>
      )}
    </div>
  )
}
