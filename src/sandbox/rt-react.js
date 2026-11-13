// Runtime for the React track: compiles JSX with Babel and renders with React 18.
import * as Babel from '@babel/standalone'
import React from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { AsyncFunction, assert, grade, job, tick } from './harness.js'

const hooks = ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useReducer', 'useContext', 'createContext', 'Fragment']

function compile(src) {
  return Babel.transform(src, {
    presets: [['react', { runtime: 'classic' }]],
    parserOpts: { allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true },
  }).code
}

const stage = document.getElementById('stage')
let roots = []

function freshBox() {
  const box = document.createElement('div')
  stage.appendChild(box)
  return box
}

async function runOnce(test) {
  roots.forEach((r) => r.unmount())
  roots = []
  stage.innerHTML = ''
  let box = null

  const helpers = {
    React,
    assert,
    tick,
    document,
    /** Renders an element and returns its container. */
    render(element) {
      box = freshBox()
      const root = createRoot(box)
      roots.push(root)
      flushSync(() => root.render(element))
      return box
    },
    $: (sel) => (box || stage).querySelector(sel),
    $$: (sel) => [...(box || stage).querySelectorAll(sel)],
    async click(el) {
      assert(el, 'The element to click was not found')
      el.click()
      await tick(20)
    },
    async type(el, value) {
      assert(el, 'The input to type into was not found')
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      await tick(20)
    },
  }
  hooks.forEach((h) => (helpers[h] = React[h]))

  const tail = test
    ? `return (${test});`
    : `return typeof App === 'undefined' ? null : App;`
  const code = compile(`${job.code}\n;${tail}`)
  const value = await new AsyncFunction(...Object.keys(helpers), code)(...Object.values(helpers))
  if (!test && value) helpers.render(React.createElement(value))
  return value
}

// Grade, then leave the student's <App /> on screen as the preview.
grade(runOnce).then(() => runOnce(null).catch(() => {}))
