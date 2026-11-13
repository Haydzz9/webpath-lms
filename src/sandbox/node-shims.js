// Small in-browser stand-ins for the Node.js modules the Node track uses.
// They behave like the real ones for everything the challenges ask for.

class EventEmitter {
  constructor() {
    this._l = {}
  }
  on(name, fn) {
    ;(this._l[name] ||= []).push(fn)
    return this
  }
  addListener(name, fn) {
    return this.on(name, fn)
  }
  once(name, fn) {
    const wrap = (...a) => {
      this.off(name, wrap)
      fn(...a)
    }
    return this.on(name, wrap)
  }
  off(name, fn) {
    this._l[name] = (this._l[name] || []).filter((f) => f !== fn)
    return this
  }
  removeListener(name, fn) {
    return this.off(name, fn)
  }
  emit(name, ...args) {
    const list = [...(this._l[name] || [])]
    list.forEach((f) => f(...args))
    return list.length > 0
  }
  listenerCount(name) {
    return (this._l[name] || []).length
  }
}
EventEmitter.EventEmitter = EventEmitter

function makeFs(files) {
  const norm = (p) => String(p).replace(/^\.\//, '')
  const read = (p) => {
    const key = norm(p)
    if (!(key in files)) {
      const e = new Error(`ENOENT: no such file or directory, open '${p}'`)
      e.code = 'ENOENT'
      throw e
    }
    return files[key]
  }
  const fs = {
    readFileSync: (p) => read(p),
    writeFileSync: (p, data) => void (files[norm(p)] = String(data)),
    appendFileSync: (p, data) => void (files[norm(p)] = (files[norm(p)] || '') + data),
    existsSync: (p) => norm(p) in files,
    readdirSync: () => Object.keys(files),
    readFile(p, enc, cb) {
      if (typeof enc === 'function') cb = enc
      setTimeout(() => {
        try {
          cb(null, read(p))
        } catch (e) {
          cb(e)
        }
      }, 0)
    },
    writeFile(p, data, cb) {
      setTimeout(() => {
        fs.writeFileSync(p, data)
        cb && cb(null)
      }, 0)
    },
    promises: {
      readFile: async (p) => read(p),
      writeFile: async (p, data) => fs.writeFileSync(p, data),
    },
  }
  return fs
}

const path = {
  join: (...parts) => parts.join('/').replace(/\/+/g, '/').replace(/\/\.\//g, '/'),
  basename: (p, ext) => {
    const b = String(p).split('/').pop()
    return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b
  },
  extname: (p) => {
    const b = String(p).split('/').pop()
    const i = b.lastIndexOf('.')
    return i > 0 ? b.slice(i) : ''
  },
  dirname: (p) => String(p).split('/').slice(0, -1).join('/') || '.',
}

const http = {
  createServer(handler) {
    return { _handler: handler, listen(_p, cb) { typeof cb === 'function' && cb(); return this }, close() {} }
  },
}

function matchPath(pattern, pathname) {
  const a = pattern.split('/').filter(Boolean)
  const b = pathname.split('/').filter(Boolean)
  if (a.length !== b.length) return null
  const params = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i])
    else if (a[i] !== b[i]) return null
  }
  return params
}

function express() {
  const stack = []
  const app = (req, res) => app._handler(req, res)
  app._handler = (req, res) => {
    let i = 0
    const next = (err) => {
      if (err) return res.status(500).json({ error: String(err.message || err) })
      const layer = stack[i++]
      if (!layer) return res.status(404).send(`Cannot ${req.method} ${req.path}`)
      if (layer.method && layer.method !== req.method) return next()
      if (layer.path) {
        const params = matchPath(layer.path, req.path)
        if (!params) return next()
        req.params = params
      }
      try {
        const r = layer.fn(req, res, next)
        if (r && typeof r.catch === 'function') r.catch(next)
      } catch (e) {
        next(e)
      }
    }
    next()
  }
  app.use = (a, b) => {
    const fn = typeof a === 'function' ? a : b
    stack.push({ fn })
    return app
  }
  for (const m of ['get', 'post', 'put', 'patch', 'delete']) {
    app[m] = (p, ...fns) => {
      fns.forEach((fn) => stack.push({ method: m.toUpperCase(), path: p, fn }))
      return app
    }
  }
  app.listen = (_p, cb) => {
    typeof cb === 'function' && cb()
    return { close() {} }
  }
  return app
}
express.json = () => (_req, _res, next) => next()
express.urlencoded = () => (_req, _res, next) => next()

/** Sends a fake request to an http server or express app and resolves with the response. */
export function request(target, method, url, body) {
  return new Promise((resolve, reject) => {
    const handler = target && (target._handler || (typeof target === 'function' ? target : null))
    if (!handler) return reject(new Error('module.exports is not a server or an express app'))
    const u = new URL(url, 'http://localhost')
    const req = {
      method: method.toUpperCase(),
      url,
      path: u.pathname,
      query: Object.fromEntries(u.searchParams),
      params: {},
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? {} : body,
    }
    const headers = {}
    let done = false
    const finish = (payload) => {
      if (done) return
      done = true
      let parsed = payload
      if (typeof payload === 'string') {
        try {
          parsed = JSON.parse(payload)
        } catch {
          /* plain text */
        }
      }
      resolve({ status: res.statusCode, headers, body: parsed, text: typeof payload === 'string' ? payload : JSON.stringify(payload) })
    }
    const res = {
      statusCode: 200,
      setHeader: (k, v) => void (headers[k.toLowerCase()] = v),
      set: (k, v) => (res.setHeader(k, v), res),
      writeHead(code, h = {}) {
        res.statusCode = code
        Object.entries(h).forEach(([k, v]) => res.setHeader(k, v))
        return res
      },
      status: (code) => ((res.statusCode = code), res),
      sendStatus: (code) => (res.status(code), finish('')),
      write: (chunk) => void (res._buf = (res._buf || '') + chunk),
      end: (chunk = '') => finish((res._buf || '') + chunk),
      send: (x) => finish(x),
      json: (x) => (res.setHeader('Content-Type', 'application/json'), finish(JSON.parse(JSON.stringify(x)))),
    }
    setTimeout(() => reject(new Error(`No response was sent for ${req.method} ${url}`)), 1500)
    handler(req, res)
  })
}

export function makeRequire(files) {
  const mods = { events: EventEmitter, fs: makeFs(files), path, http, express }
  return (name) => {
    const key = String(name).replace(/^node:/, '')
    if (key === 'fs/promises') return mods.fs.promises
    if (!(key in mods)) throw new Error(`Cannot find module '${name}' (available here: ${Object.keys(mods).join(', ')})`)
    return mods[key]
  }
}
