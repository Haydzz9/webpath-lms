import { Link } from 'react-router-dom'
import { config } from '../config.js'
import { tracks } from '../content/index.js'

export default function Landing() {
  const total = tracks.reduce((n, t) => n + t.challenges.length, 0)
  return (
    <div className="landing">
      <section className="hero">
        <p className="eyebrow">{config.course}</p>
        <h1>Learn to build for the web by building.</h1>
        <p className="lead">
          Seven languages, {total} hands-on coding challenges checked instantly in your browser, and a
          certificate for every language you master. Sign up with your school email and pick up where you
          left off, on any computer.
        </p>
        <div className="row">
          <Link to="/signup" className="btn big">Create your account</Link>
          <Link to="/login" className="btn ghost big">I already have one</Link>
        </div>
      </section>

      <section>
        <h2>The path</h2>
        <ol className="path">
          {tracks.map((t, i) => (
            <li key={t.id} style={{ '--c': t.color }}>
              <span className="step">{i + 1}</span>
              <div>
                <h3>{t.title}</h3>
                <p>{t.tagline}</p>
                <p className="muted small">{t.challenges.length} challenges · {t.quiz.length}-item quiz · 1 project · certificate</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="how">
        <h2>How you earn each certificate</h2>
        <div className="grid3">
          <div className="card"><h3>1 · Solve the challenges</h3><p>Write real code in the editor. Tests run as you go and tell you exactly what is still missing.</p></div>
          <div className="card"><h3>2 · Pass the quiz</h3><p>A short multiple-choice quiz on the concepts. Score {config.quizPassPercent}% or better; you may retake it.</p></div>
          <div className="card"><h3>3 · Build the project</h3><p>Submit a project link. Once your instructor approves it, your certificate is issued.</p></div>
        </div>
      </section>
    </div>
  )
}
