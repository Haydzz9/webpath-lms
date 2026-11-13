import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' + HashRouter means the built site works on GitHub Pages, Vercel
// or Netlify without any rewrite rules.
export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  build: { chunkSizeWarningLimit: 4000 },
})
