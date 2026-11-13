// Runtime for the MongoDB track: an in-memory `db` that speaks mongosh syntax,
// powered by the mingo query engine.
import { Aggregator, find, updateMany, updateOne } from 'mingo'
import { AsyncFunction, assert, grade, job } from './harness.js'

let nextId = 1000
const clone = (x) => JSON.parse(JSON.stringify(x))

class Cursor {
  constructor(make) {
    this._make = make
    this._ops = []
  }
  sort(s) { this._ops.push(['sort', s]); return this }
  limit(n) { this._ops.push(['limit', n]); return this }
  skip(n) { this._ops.push(['skip', n]); return this }
  toArray() {
    let c = this._make()
    // Like MongoDB: sort first, then skip, then limit, whatever the call order.
    for (const name of ['sort', 'skip', 'limit']) {
      const op = this._ops.filter((o) => o[0] === name).pop()
      if (op) c = c[name](op[1])
    }
    return clone(c.all())
  }
  count() { return this.toArray().length }
  forEach(fn) { this.toArray().forEach(fn) }
  map(fn) { return this.toArray().map(fn) }
  [Symbol.iterator]() { return this.toArray()[Symbol.iterator]() }
}

class Collection {
  constructor(docs) {
    this.docs = docs
  }
  find(query = {}, projection) {
    return new Cursor(() => find(this.docs, query, projection || {}))
  }
  findOne(query = {}, projection) {
    return this.find(query, projection).limit(1).toArray()[0] ?? null
  }
  countDocuments(query = {}) {
    return find(this.docs, query).all().length
  }
  distinct(field, query = {}) {
    return [...new Set(find(this.docs, query).all().map((d) => d[field]))]
  }
  insertOne(doc) {
    assert(doc && typeof doc === 'object' && !Array.isArray(doc), 'insertOne() needs one document object')
    const d = { _id: doc._id ?? nextId++, ...clone(doc) }
    this.docs.push(d)
    return { acknowledged: true, insertedId: d._id }
  }
  insertMany(list) {
    assert(Array.isArray(list), 'insertMany() needs an array of documents')
    return { acknowledged: true, insertedIds: list.map((d) => this.insertOne(d).insertedId) }
  }
  updateOne(query, update) {
    return { acknowledged: true, ...updateOne(this.docs, query, update) }
  }
  updateMany(query, update) {
    return { acknowledged: true, ...updateMany(this.docs, query, update) }
  }
  _delete(query, one) {
    const hit = find(this.docs, query).all()
    const gone = new Set((one ? hit.slice(0, 1) : hit).map((d) => d._id))
    const before = this.docs.length
    this.docs.splice(0, before, ...this.docs.filter((d) => !gone.has(d._id)))
    return { acknowledged: true, deletedCount: before - this.docs.length }
  }
  deleteOne(query = {}) { return this._delete(query, true) }
  deleteMany(query = {}) { return this._delete(query, false) }
  aggregate(pipeline) {
    assert(Array.isArray(pipeline), 'aggregate() needs an array of stages')
    const docs = this.docs
    return new Cursor(() => {
      const out = new Aggregator(pipeline).run(clone(docs))
      const wrap = (arr) => ({
        all: () => arr,
        sort: () => wrap(arr),
        skip: (n) => wrap(arr.slice(n)),
        limit: (n) => wrap(arr.slice(0, n)),
      })
      return wrap(out)
    })
  }
}

function makeDb(data) {
  const cols = {}
  for (const [name, docs] of Object.entries(clone(data || {}))) cols[name] = new Collection(docs)
  return new Proxy(cols, {
    get(target, name) {
      if (typeof name !== 'string') return undefined
      if (name === 'getCollection') return (n) => (target[n] ||= new Collection([]))
      return (target[name] ||= new Collection([]))
    },
  })
}

/** Turns a cursor, array or single document into a plain array for the tests. */
const arr = (x) => (x == null ? [] : typeof x.toArray === 'function' ? x.toArray() : Array.isArray(x) ? x : [x])

grade(async (test) => {
  const db = makeDb(job.data?.collections)
  const body = `${job.code}\n;${test ? `return (${test});` : ''}`
  return new AsyncFunction('db', 'arr', 'assert', body)(db, arr, assert)
})
