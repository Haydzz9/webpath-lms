// PostgreSQL track grader. SQL is not JavaScript, so it does not need the
// iframe: it runs on PGlite, a real PostgreSQL compiled to WebAssembly,
// loaded only when a student opens a SQL challenge.
let dbPromise = null
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

async function getDb() {
  dbPromise ||= import('@electric-sql/pglite').then(({ PGlite }) => PGlite.create())
  return dbPromise
}

function format(rows, fields) {
  if (!fields?.length) return null
  const cols = fields.map((f) => f.name)
  const cell = (v) => (v === null ? 'NULL' : v instanceof Date ? v.toISOString().slice(0, 10) : String(v))
  const table = [cols, ...rows.slice(0, 50).map((r) => cols.map((c) => cell(r[c])))]
  const w = cols.map((_, i) => Math.max(...table.map((r) => r[i].length)))
  const line = (r) => r.map((v, i) => v.padEnd(w[i])).join(' | ')
  return [line(table[0]), w.map((n) => '-'.repeat(n)).join('-+-'), ...table.slice(1).map(line), `(${rows.length} row${rows.length === 1 ? '' : 's'})`].join('\n')
}

let queue = Promise.resolve()

export function runSql(challenge, code) {
  // One run at a time: every run rebuilds the public schema from scratch.
  const job = queue.then(() => run(challenge, code))
  queue = job.catch(() => {})
  return job
}

async function run(challenge, code) {
  const out = { results: [], logs: [], error: null }
  let rows = []
  let cols = []
  let db
  try {
    db = await getDb()
    await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;')
    if (challenge.setup) await db.exec(challenge.setup)
  } catch (err) {
    return { ...out, error: `Could not start PostgreSQL: ${err.message}`, results: challenge.tests.map((t) => ({ text: t.text, pass: false })) }
  }
  try {
    const all = await db.exec(code)
    const last = [...all].reverse().find((r) => r.fields?.length) || all[all.length - 1]
    rows = last?.rows || []
    cols = (last?.fields || []).map((f) => f.name)
    const shown = format(rows, last?.fields)
    out.logs.push(shown || 'Statement ran successfully.')
  } catch (err) {
    out.error = `ERROR: ${err.message}`
  }
  const q = async (sql, params) => (await db.query(sql, params)).rows
  /** true when the statement fails, e.g. to prove a constraint works */
  const fails = async (sql) => {
    try {
      await db.query(sql)
      return false
    } catch {
      return true
    }
  }
  for (const t of challenge.tests) {
    if (out.error) {
      out.results.push({ text: t.text, pass: false })
      continue
    }
    try {
      const value = await new AsyncFunction('rows', 'cols', 'q', 'fails', 'sql', `return (${t.test})`)(rows, cols, q, fails, code)
      out.results.push({ text: t.text, pass: !!value })
    } catch (err) {
      out.results.push({ text: t.text, pass: false, error: err.message })
    }
  }
  return out
}
