import { Link } from 'react-router-dom'
import { tracks } from '../content/index.js'
import { useStore } from '../lib/store.jsx'

export function Bar({ value, color }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

export default function Dashboard() {
  const { profile, status, resume, certs } = useStore()
  const first = tracks[0]
  const target = resume || { track: first, challenge: status(first).next }
  return (
    <div>
      <div className="welcome">
        <div>
          <h1>Hi, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
          <p className="muted">
            {certs.length} of {tracks.length} certificates earned
            {profile?.section ? ` · ${profile.section}` : ''}
          </p>
        </div>
        {target.challenge && (
          <Link className="btn big" to={`/learn/${target.track.id}/${target.challenge.id}`}>
            {resume ? 'Continue' : 'Start'}: {target.challenge.title}
          </Link>
        )}
      </div>

      <div className="tracks">
        {tracks.map((t, i) => {
          const s = status(t)
          return (
            <Link key={t.id} to={`/learn/${t.id}`} className="card track" style={{ '--c': t.color }}>
              <div className="track-head">
                <span className="step">{i + 1}</span>
                <h2>{t.title}</h2>
                {s.cert && <span className="pill gold">Certified</span>}
              </div>
              <p>{t.tagline}</p>
              <Bar value={s.percent} color={t.color} />
              <p className="muted small">
                {s.done}/{s.total} challenges · quiz {s.quizPassed ? 'passed' : 'not passed'} · project{' '}
                {s.project ? s.project.status.replace('_', ' ') : 'not submitted'}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
