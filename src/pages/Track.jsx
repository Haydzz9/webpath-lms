import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { config } from '../config.js'
import { trackById } from '../content/index.js'
import { api } from '../lib/api.js'
import { useStore } from '../lib/store.jsx'
import { Bar } from './Dashboard.jsx'

const Tick = ({ on }) => <span className={on ? 'tick on' : 'tick'} aria-label={on ? 'done' : 'not done'}>{on ? '✓' : ''}</span>

export default function Track() {
  const { trackId } = useParams()
  const track = trackById[trackId]
  const { status, byItem, refresh } = useStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!track) return <Navigate to="/learn" replace />
  const s = status(track)

  async function claim() {
    setBusy(true)
    setError('')
    try {
      const cert = await api.claimCertificate(track.id)
      await refresh()
      navigate(`/certificate/${cert.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ '--c': track.color }}>
      <p className="crumbs"><Link to="/learn">My learning</Link> / {track.title}</p>
      <h1>{track.title}</h1>
      <p className="lead">{track.tagline}</p>
      <Bar value={s.percent} color={track.color} />
      {track.note && <p className="muted small">{track.note}</p>}

      <h2>1 · Challenges <span className="muted">({s.done}/{s.total})</span></h2>
      <ul className="steps">
        {track.challenges.map((c, i) => (
          <li key={c.id}>
            <Link to={`/learn/${track.id}/${c.id}`}>
              <Tick on={byItem[c.id]?.completed} />
              <span>{i + 1}. {c.title}</span>
              {!byItem[c.id]?.completed && byItem[c.id]?.code ? <span className="pill">in progress</span> : null}
            </Link>
          </li>
        ))}
      </ul>

      <h2>2 · Quiz</h2>
      <div className="card rowcard">
        <Tick on={s.quizPassed} />
        <div className="grow">
          <strong>{track.title} concepts quiz</strong>
          <p className="muted small">
            {track.quiz.length} questions · pass at {config.quizPassPercent}%
            {s.attempts.length ? ` · best score ${s.best}/${track.quiz.length} in ${s.attempts.length} attempt${s.attempts.length > 1 ? 's' : ''}` : ''}
          </p>
        </div>
        {s.allDone ? (
          <Link className="btn" to={`/learn/${track.id}/quiz`}>{s.quizPassed ? 'Retake' : 'Take the quiz'}</Link>
        ) : (
          <span className="muted small">Unlocks after all challenges</span>
        )}
      </div>

      <h2>3 · Certification project</h2>
      <div className="card rowcard">
        <Tick on={s.project?.status === 'approved'} />
        <div className="grow">
          <strong>{track.project.title}</strong>
          <p className="muted small">
            {s.project ? `Status: ${s.project.status.replace('_', ' ')}` : 'Not submitted yet'}
          </p>
        </div>
        <Link className="btn" to={`/learn/${track.id}/project`}>{s.project ? 'View submission' : 'Open project'}</Link>
      </div>

      <h2>4 · Certificate</h2>
      <div className="card rowcard">
        <Tick on={!!s.cert} />
        <div className="grow">
          <strong>{track.title} Certificate of Mastery</strong>
          <p className="muted small">
            {s.cert
              ? `Issued ${new Date(s.cert.issued_at).toLocaleDateString()}`
              : 'Requires all challenges, a passed quiz and an approved project.'}
          </p>
          {error && <p className="error">{error}</p>}
        </div>
        {s.cert ? (
          <Link className="btn" to={`/certificate/${s.cert.id}`}>View certificate</Link>
        ) : (
          <button className="btn" disabled={!s.canClaim || busy} onClick={claim}>Claim certificate</button>
        )}
      </div>
    </div>
  )
}
