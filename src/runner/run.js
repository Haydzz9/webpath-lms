// Parent-side grader. Builds a sandboxed iframe (no same-origin access, so
// student code cannot touch the app or the login session), runs the tests
// inside it and resolves with { results, logs, error }.
import { runSql } from './sql.js'

const BUNDLE = { html: 'base', css: 'base', js: 'base', node: 'base', react: 'react', mongo: 'mongo' }
const cache = {}
let seq = 0

function lib(name) {
  cache[name] ||= fetch(`${import.meta.env.BASE_URL}sandbox/${name}.js`).then((r) => {
    if (!r.ok) throw new Error(`Could not load the ${name} runtime`)
    return r.text()
  })
  return cache[name]
}

const inline = (js) => js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--')

/** frame: an <iframe> element to reuse (visible preview), or null for a hidden one. */
export async function runChallenge(challenge, code, frame) {
  const type = challenge.type
  if (type === 'sql') return runSql(challenge, code)

  const runtime = await lib(BUNDLE[type])
  const id = ++seq
  const job = {
    id,
    type,
    code,
    prelude: challenge.prelude || '',
    html: challenge.html || '',
    data: challenge.data || null,
    tests: challenge.tests,
  }
  const scripts =
    `<script>window.__JOB__=${JSON.stringify(job).replace(/</g, '\\u003c')}</script>` +
    `<script>${inline(runtime)}</script>`
  const isPage = type === 'html' || type === 'css'
  const doc = isPage
    ? `${code}\n${scripts}`
    : `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:12px}</style></head><body><div id="stage"></div>${scripts}</body></html>`

  let iframe = frame
  let temp = false
  if (!iframe) {
    temp = true
    iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:absolute;width:800px;height:600px;left:-9999px;top:0;border:0'
    document.body.appendChild(iframe)
  }
  iframe.setAttribute('sandbox', 'allow-scripts allow-forms')

  return new Promise((resolve) => {
    const done = (payload) => {
      clearTimeout(timer)
      removeEventListener('message', onMsg)
      if (temp) iframe.remove()
      resolve(payload)
    }
    const onMsg = (e) => {
      if (e.source !== iframe.contentWindow || !e.data?.webpath || e.data.id !== id) return
      done(e.data)
    }
    const timer = setTimeout(() => {
      if (temp) iframe.remove()
      else iframe.srcdoc = ''
      done({
        results: challenge.tests.map((t) => ({ text: t.text, pass: false })),
        logs: [],
        error: isPage
          ? 'The tests could not run. Check for an unclosed tag such as <style>, <script> or <textarea>.'
          : 'Your code took too long to finish. Check for an infinite loop.',
      })
    }, 10000)
    addEventListener('message', onMsg)
    iframe.srcdoc = doc
  })
}
