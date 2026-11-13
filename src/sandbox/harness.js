// Runs inside the sandboxed iframe. The parent page puts the job in
// window.__JOB__ = { id, type, code, prelude, html, data, tests: [{ text, test }] }
// and waits for one postMessage with the results.

export const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

const job = window.__JOB__
let logs = []

function show(v) {
  if (typeof v === 'string') return v
  if (v instanceof Error) return v.message
  if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`
  try {
    const s = JSON.stringify(v, null, 1)
    return s === undefined ? String(v) : s.replace(/\n\s*/g, ' ')
  } catch {
    return String(v)
  }
}

for (const level of ['log', 'info', 'warn', 'error']) {
  const real = console[level].bind(console)
  console[level] = (...args) => {
    logs.push(args.map(show).join(' '))
    real(...args)
  }
}

export function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed')
  return true
}

export const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms))

function clean(err) {
  const msg = err && err.message ? err.message : String(err)
  return `${err && err.name && err.name !== 'Error' ? err.name + ': ' : ''}${msg}`
}

/**
 * runOnce(testExpr | null) must run the student's code in a fresh state and,
 * when testExpr is given, return the value of that expression.
 */
export async function grade(runOnce) {
  const out = { id: job.id, results: [], logs: [], error: null }
  try {
    logs = []
    await runOnce(null)
    await tick(10)
  } catch (err) {
    out.error = clean(err)
  }
  out.logs = logs.slice(0, 200)

  for (const t of job.tests) {
    if (out.error) {
      out.results.push({ text: t.text, pass: false })
      continue
    }
    try {
      logs = []
      const value = await Promise.race([
        runOnce(t.test),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Test took too long')), 4000)),
      ])
      out.results.push({ text: t.text, pass: !!value })
    } catch (err) {
      out.results.push({ text: t.text, pass: false, error: clean(err) })
    }
  }
  parent.postMessage({ webpath: true, ...out }, '*')
}

export { job }
export const output = () => logs
