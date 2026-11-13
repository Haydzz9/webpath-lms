// Runtime for the HTML, CSS, JavaScript and Node.js tracks.
import { AsyncFunction, assert, grade, job, output, tick } from './harness.js'
import { makeRequire, request } from './node-shims.js'

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
const css = (el, prop) => (el ? getComputedStyle(el)[prop] : undefined)

function allRules(list, acc = [], media = null) {
  for (const r of list) {
    if (r.cssRules && r.conditionText !== undefined) allRules(r.cssRules, acc, r.conditionText)
    else if (r.selectorText) acc.push({ sel: r.selectorText, style: r.style, media })
  }
  return acc
}
function rules() {
  return [...document.styleSheets].flatMap((s) => {
    try {
      return allRules(s.cssRules)
    } catch {
      return []
    }
  })
}
const same = (a, b) => a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim()
/** Style declared for an exact selector outside media queries, e.g. rule('.btn:hover'). */
const rule = (sel) =>
  rules().find((r) => !r.media && r.sel.split(',').some((s) => same(s, sel)))?.style
/** Style declared for a selector inside a media query whose condition contains `cond`. */
const mediaRule = (cond, sel) =>
  rules().find(
    (r) =>
      r.media &&
      r.media.replace(/\s+/g, '').includes(cond.replace(/\s+/g, '')) &&
      r.sel.split(',').some((s) => same(s, sel)),
  )?.style

async function main() {
  if (job.type === 'html' || job.type === 'css') {
    if (document.readyState !== 'complete') await new Promise((r) => addEventListener('load', r))
    const names = ['document', '$', '$$', 'css', 'rule', 'mediaRule', 'assert']
    const args = [document, $, $$, css, rule, mediaRule, assert]
    return grade(async (test) => (test ? new AsyncFunction(...names, `return (${test})`)(...args) : null))
  }

  const stage = document.getElementById('stage')
  return grade(async (test) => {
    stage.innerHTML = job.html || ''
    const scope = { document, $, $$, assert, tick, output, wait: tick }
    if (job.type === 'node') {
      const module = { exports: {} }
      Object.assign(scope, {
        module,
        exports: module.exports,
        require: makeRequire({ ...(job.data?.files || {}) }),
        request: (method, url, body) => request(module.exports, method, url, body),
      })
    }
    const body = `${job.prelude || ''}\n${job.code}\n;${test ? `return (${test});` : ''}`
    return new AsyncFunction(...Object.keys(scope), body)(...Object.values(scope))
  })
}

main()
