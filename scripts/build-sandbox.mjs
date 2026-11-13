// Bundles the code that runs inside the grading iframe into single files
// (public/sandbox/*.js). The app fetches them as text and inlines them into
// the sandboxed iframe, so student code never runs in the app's own origin.
import { build } from 'esbuild'

await build({
  entryPoints: {
    base: 'src/sandbox/rt-base.js',
    react: 'src/sandbox/rt-react.js',
    mongo: 'src/sandbox/rt-mongo.js',
  },
  outdir: 'public/sandbox',
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'warning',
})
console.log('sandbox runtimes built')
