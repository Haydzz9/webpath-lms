// Content check. For every challenge it runs, in a real browser:
//   1. the reference solution  -> every test must pass
//   2. the untouched seed code -> at least one test must fail
// and it lints the quizzes (4 distinct choices of similar length).
// Run it after editing anything in src/content:  npm run verify
import { existsSync } from 'node:fs'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { tracks } from '../src/content/index.js'

const solutions = {}
for (const t of tracks) Object.assign(solutions, (await import(`../solutions/${t.id}.js`)).default)

let problems = 0
const bad = (msg) => (problems++, console.log('  ✗ ' + msg))

for (const t of tracks) {
  t.quiz.forEach((q, i) => {
    const len = q.a.map((c) => c.length)
    if (q.a.length !== 4 || new Set(q.a).size !== 4) bad(`${t.id} quiz ${i + 1}: needs 4 distinct choices`)
    const others = len.slice(1)
    if (len[0] > Math.max(...others) + 3 || len[0] < Math.min(...others) - 3)
      bad(`${t.id} quiz ${i + 1}: correct answer length ${len[0]} stands out from ${others.join('/')}`)
    if (Math.max(...len) - Math.min(...len) > 12) bad(`${t.id} quiz ${i + 1}: choice lengths vary too much (${len.join('/')})`)
  })
}

const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' })
await server.listen()
const chrome = '/usr/bin/google-chrome'
const browser = await chromium.launch(existsSync(chrome) ? { executablePath: chrome } : {})
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('  page error:', e.message))
await page.goto('http://localhost:5199/')
await page.waitForFunction(() => window.__webpath)

const run = (trackId, id, code) =>
  page.evaluate(
    async ([trackId, id, code]) => {
      const c = window.__webpath.tracks.find((t) => t.id === trackId).challenges.find((x) => x.id === id)
      return window.__webpath.run(c, code, null)
    },
    [trackId, id, code],
  )

for (const t of tracks) {
  console.log(`\n${t.title}`)
  for (const c of t.challenges) {
    const sol = solutions[c.id]
    if (!sol) {
      bad(`${c.id}: no reference solution`)
      continue
    }
    const good = await run(t.id, c.id, sol)
    const failed = good.results.filter((r) => !r.pass)
    const seed = await run(t.id, c.id, c.seed)
    const seedPasses = !seed.error && seed.results.every((r) => r.pass)
    if (good.error) bad(`${c.id}: solution error: ${good.error}`)
    failed.forEach((r) => bad(`${c.id}: solution fails "${r.text}" ${r.error || ''}`))
    if (seedPasses) bad(`${c.id}: the starting code already passes every test`)
    if (!good.error && !failed.length && !seedPasses)
      console.log(`  ✓ ${c.id}  ${c.tests.length} tests (seed passes ${seed.results.filter((r) => r.pass).length})`)
  }
}

await browser.close()
await server.close()
console.log(problems ? `\n${problems} problem(s) found.` : '\nAll challenges and quizzes check out.')
process.exit(problems ? 1 : 0)
