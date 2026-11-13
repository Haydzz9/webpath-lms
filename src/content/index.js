import html from './html.js'
import css from './css.js'
import javascript from './javascript.js'
import react from './react.js'
import node from './node.js'
import mongodb from './mongodb.js'
import postgresql from './postgresql.js'

// The order here is the order students see, matching the course flow.
export const tracks = [html, css, javascript, react, node, mongodb, postgresql].map((t) => ({
  ...t,
  challenges: t.challenges.map((c) => ({ type: t.type, ...c })),
}))

export const trackById = Object.fromEntries(tracks.map((t) => [t.id, t]))
