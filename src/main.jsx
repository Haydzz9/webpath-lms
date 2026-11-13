import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './lib/store.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <StoreProvider>
      <App />
    </StoreProvider>
  </HashRouter>,
)

// Development only: lets `npm run verify` drive the grader from a test browser.
if (import.meta.env.DEV) {
  Promise.all([import('./runner/run.js'), import('./content/index.js')]).then(([r, c]) => {
    window.__webpath = { run: r.runChallenge, tracks: c.tracks }
  })
}
