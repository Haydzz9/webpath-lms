import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { PostgreSQL, sql } from '@codemirror/lang-sql'
import CodeMirror from '@uiw/react-codemirror'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { trackById } from '../content/index.js'
import { useStore } from '../lib/store.jsx'
import { runChallenge } from '../runner/run.js'

const LANG = {
  html: () => html(),
  css: () => html(),
  js: () => javascript(),
  node: () => javascript(),
  mongo: () => javascript(),
  react: () => javascript({ jsx: true }),
  sql: () => sql({ dialect: PostgreSQL }),
}
const VISUAL = ['html', 'css', 'react']

export default function Challenge() {
  const { trackId, challengeId } = useParams()
  const track = trackById[trackId]
  const index = track ? track.challenges.findIndex((c) => c.id === challengeId) : -1
  if (index < 0) return <Navigate to={track ? `/learn/${trackId}` : '/learn'} replace />
  // key = remount with fresh state whenever the challenge changes
  return <Workspace key={challengeId} track={track} index={index} />
}

function Workspace({ track, index }) {
  const challenge = track.challenges[index]
  const next = track.challenges[index + 1]
  const { byItem, saveProgress } = useStore()
  const saved = byItem[challenge.id]
  const [code, setCode] = useState(saved?.code || challenge.seed)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [saveState, setSaveState] = useState('')
  const frame = useRef(null)
  const latest = useRef(code)
  const runId = useRef(0)
  const visual = VISUAL.includes(challenge.type)
  const extensions = useMemo(() => [LANG[challenge.type]()], [challenge.type])
  const completed = !!saved?.completed

  const run = useCallback(
    async (quiet) => {
      const mine = ++runId.current
      if (!quiet) setRunning(true)
      const src = latest.current
      let res
      try {
        res = await runChallenge(challenge, src, visual ? frame.current : null)
      } catch (e) {
        res = { results: challenge.tests.map((t) => ({ text: t.text, pass: false })), logs: [], error: e.message }
      }
      if (mine !== runId.current) return
      setResult(res)
      setRunning(false)
      if (!res.error && res.results.every((r) => r.pass)) {
        try {
          await saveProgress(track.id, challenge.id, src, true)
          setSaveState('Saved')
        } catch (e) {
          setSaveState(`Not saved: ${e.message}`)
        }
      }
    },
    [challenge, track.id, visual, saveProgress],
  )

  // First paint: show the preview / current test state.
  useEffect(() => {
    if (visual) run(true)
  }, [])

  // Autosave the draft, and live-run page challenges, shortly after typing stops.
  const timer = useRef()
  function onChange(value) {
    setCode(value)
    latest.current = value
    setSaveState('')
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      if (challenge.type === 'html' || challenge.type === 'css') run(true)
      try {
        await saveProgress(track.id, challenge.id, value, false)
        setSaveState('Draft saved')
      } catch (e) {
        setSaveState(`Not saved: ${e.message}`)
      }
    }, 900)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        run(false)
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [run])

  function reset() {
    if (!confirm('Replace your code with the starting code?')) return
    onChange(challenge.seed)
  }

  const passed = result ? result.results.filter((r) => r.pass).length : 0
  const allPass = result && !result.error && passed === challenge.tests.length

  return (
    <div className="workspace" style={{ '--c': track.color }}>
      <section className="pane instructions">
        <p className="crumbs">
          <Link to="/learn">My learning</Link> / <Link to={`/learn/${track.id}`}>{track.title}</Link> / {index + 1} of {track.challenges.length}
        </p>
        <h1>{challenge.title} {completed && <span className="pill gold">Completed</span>}</h1>
        <div className="prose" dangerouslySetInnerHTML={{ __html: challenge.body }} />

        <h2>Tests <span className="muted">{result ? `${passed}/${challenge.tests.length} passing` : ''}</span></h2>
        <ul className="tests">
          {challenge.tests.map((t, i) => {
            const r = result?.results[i]
            return (
              <li key={i} className={r ? (r.pass ? 'pass' : 'fail') : ''}>
                <span className="mark">{r ? (r.pass ? '✓' : '✗') : '○'}</span>
                <div>
                  {t.text}
                  {r?.error && <code className="why">{r.error}</code>}
                </div>
              </li>
            )
          })}
        </ul>
        {allPass && (
          <div className="success">
            <strong>All tests pass.</strong>{' '}
            {next ? (
              <Link className="btn small" to={`/learn/${track.id}/${next.id}`}>Next challenge →</Link>
            ) : (
              <Link className="btn small" to={`/learn/${track.id}`}>Back to {track.title}: take the quiz →</Link>
            )}
          </div>
        )}
      </section>

      <section className="pane editor">
        <div className="toolbar">
          <button className="btn small" onClick={() => run(false)} disabled={running}>
            {running ? 'Running…' : 'Run tests'}
          </button>
          <span className="muted small">Ctrl + Enter</span>
          <span className="grow" />
          <span className="muted small" aria-live="polite">{saveState}</span>
          <button className="btn ghost small" onClick={reset}>Reset code</button>
        </div>
        <CodeMirror
          value={code}
          onChange={onChange}
          extensions={extensions}
          theme="dark"
          height="100%"
          className="cm"
          basicSetup={{ tabSize: 2 }}
        />
        {result?.error && <pre className="console err">{result.error}</pre>}
        {visual && (
          <div className="preview">
            <div className="preview-label">Preview</div>
            <iframe ref={frame} title="Preview" />
          </div>
        )}
        {(!visual || result?.logs?.length > 0) && (
          <pre className="console">
            {result?.logs?.length ? result.logs.join('\n') : visual ? '' : 'Output from console.log (or your query result) appears here after you run the tests.'}
          </pre>
        )}
      </section>
    </div>
  )
}
