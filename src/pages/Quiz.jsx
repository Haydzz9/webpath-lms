import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { config } from '../config.js'
import { trackById } from '../content/index.js'
import { api } from '../lib/api.js'
import { useStore } from '../lib/store.jsx'

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Quiz() {
  const { trackId } = useParams()
  const track = trackById[trackId]
  const { status, refresh } = useStore()
  const [round, setRound] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // In the content files the first choice is the correct one; both the
  // questions and their choices are reshuffled on every attempt.
  const questions = useMemo(
    () => (track ? shuffle(track.quiz.map((q, n) => ({ n, q: q.q, choices: shuffle(q.a.map((text, i) => ({ text, correct: i === 0 }))) }))) : []),
    [track, round],
  )
  if (!track) return <Navigate to="/learn" replace />
  if (!status(track).allDone) return <Navigate to={`/learn/${track.id}`} replace />

  const answered = Object.keys(answers).length
  async function submit(e) {
    e.preventDefault()
    const wrong = questions.filter((q) => !q.choices[answers[q.n]]?.correct).map((q) => q.n)
    const score = questions.length - wrong.length
    const passed = (score / questions.length) * 100 >= config.quizPassPercent
    setResult({ score, passed, wrong })
    try {
      await api.addQuizAttempt(track.id, score, questions.length, passed)
      await refresh()
    } catch (err) {
      setError(`Your score could not be saved: ${err.message}`)
    }
    scrollTo(0, 0)
  }
  function retry() {
    setAnswers({})
    setResult(null)
    setRound(round + 1)
  }

  return (
    <div className="quiz" style={{ '--c': track.color }}>
      <p className="crumbs"><Link to="/learn">My learning</Link> / <Link to={`/learn/${track.id}`}>{track.title}</Link> / Quiz</p>
      <h1>{track.title} quiz</h1>
      {result ? (
        <div className={result.passed ? 'card result ok' : 'card result bad'}>
          <h2>{result.score} / {questions.length} · {result.passed ? 'Passed' : 'Not yet'}</h2>
          <p>
            {result.passed
              ? 'Well done. Next step: the certification project.'
              : `You need ${config.quizPassPercent}% to pass. The questions you missed are marked below; review those topics and try again.`}
          </p>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <Link className="btn" to={`/learn/${track.id}`}>Back to {track.title}</Link>
            <button className="btn ghost" onClick={retry}>Try again</button>
          </div>
        </div>
      ) : (
        <p className="muted">{questions.length} questions · {config.quizPassPercent}% to pass · you may retake it; questions are reshuffled each time.</p>
      )}

      <form onSubmit={submit}>
        {questions.map((q, i) => (
          <fieldset key={q.n} className={result ? (result.wrong.includes(q.n) ? 'card q missed' : 'card q got') : 'card q'} disabled={!!result}>
            <legend>{i + 1}. {q.q} {result && <span className="pill">{result.wrong.includes(q.n) ? 'Missed' : 'Correct'}</span>}</legend>
            {q.choices.map((c, ci) => (
              <label key={ci} className="choice">
                <input type="radio" name={`q${q.n}`} checked={answers[q.n] === ci} onChange={() => setAnswers({ ...answers, [q.n]: ci })} />
                <span>{c.text}</span>
              </label>
            ))}
          </fieldset>
        ))}
        {!result && (
          <button className="btn big" disabled={answered < questions.length}>
            {answered < questions.length ? `Answer all questions (${answered}/${questions.length})` : 'Submit answers'}
          </button>
        )}
      </form>
    </div>
  )
}
