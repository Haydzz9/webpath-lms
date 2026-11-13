const STUDENTS = `const students = [
  { id: 1, name: 'Ana', course: 'BSCS' },
  { id: 2, name: 'Ben', course: 'BSIT' },
  { id: 3, name: 'Cara', course: 'BSCS' },
]`

export default {
  id: 'node',
  title: 'Node.js',
  tagline: 'Run JavaScript on the server: modules, files, events, HTTP and Express APIs.',
  color: '#3c873a',
  type: 'node',
  note: 'These challenges run in a simulated Node.js inside your browser. require() works for fs, path, events, http and express.',
  challenges: [
    {
      id: 'node-01',
      title: 'Modules and exports',
      body: `<p>In Node.js every file is a module. Whatever you assign to <code>module.exports</code> is what another file gets when it calls <code>require('./yourFile')</code>.</p>
<p>Write a small math module. Export an object with three functions: <code>add(a, b)</code>, <code>isEven(n)</code> and <code>average(numbers)</code> (which returns 0 for an empty array).</p>`,
      seed: `function add(a, b) {\n\n}\n\n// write isEven and average, then export all three\nmodule.exports = { }\n`,
      tests: [
        { text: 'module.exports has add, isEven and average functions', test: `['add', 'isEven', 'average'].every(k => typeof module.exports[k] === 'function')` },
        { text: 'add(2, 3) returns 5', test: `module.exports.add(2, 3) === 5` },
        { text: 'isEven(4) is true and isEven(7) is false', test: `module.exports.isEven(4) === true && module.exports.isEven(7) === false` },
        { text: 'average([80, 90, 100]) returns 90', test: `module.exports.average([80, 90, 100]) === 90` },
        { text: 'average([]) returns 0', test: `module.exports.average([]) === 0` },
      ],
    },
    {
      id: 'node-02',
      title: 'Reading and writing files with fs',
      body: `<p>The built-in <code>fs</code> module reads and writes files. <code>fs.readFileSync(path, 'utf8')</code> returns the file's text; <code>fs.writeFileSync(path, text)</code> saves text.</p>
<p>A file named <code>grades.txt</code> exists with one grade per line (<code>90</code>, <code>85</code>, <code>78</code>, <code>92</code>). Export:</p>
<ul><li><code>countLines(path)</code> – how many lines the file has</li><li><code>averageGrade(path)</code> – the average of the numbers in it</li><li><code>saveReport(inPath, outPath)</code> – writes <code>Average: 86.25</code> (the real average) to <code>outPath</code></li><li><code>safeRead(path)</code> – the file's text, or <code>null</code> if the file does not exist (no crash)</li></ul>`,
      data: { files: { 'grades.txt': '90\n85\n78\n92' } },
      seed: `const fs = require('fs')\n\nfunction countLines(path) {\n\n}\n\nmodule.exports = { countLines }\n`,
      tests: [
        { text: 'countLines("grades.txt") returns 4', test: `module.exports.countLines('grades.txt') === 4` },
        { text: 'averageGrade("grades.txt") returns 86.25', test: `module.exports.averageGrade('grades.txt') === 86.25` },
        { text: 'saveReport writes "Average: 86.25" to the output file', test: `(module.exports.saveReport('grades.txt', 'report.txt'), require('fs').readFileSync('report.txt', 'utf8') === 'Average: 86.25')` },
        { text: 'safeRead returns the text of an existing file', test: `module.exports.safeRead('grades.txt') === '90\\n85\\n78\\n92'` },
        { text: 'safeRead("missing.txt") returns null instead of crashing', test: `module.exports.safeRead('missing.txt') === null` },
      ],
    },
    {
      id: 'node-03',
      title: 'Events with EventEmitter',
      body: `<p>Much of Node.js is event-driven. An <code>EventEmitter</code> lets one part of a program announce that something happened (<code>emit</code>) and other parts react to it (<code>on</code>).</p>
<p>Create an emitter called <code>registrar</code> and an array called <code>enrolled</code>. When a <code>"enroll"</code> event is emitted with a name, add the name to the array (ignore duplicates). When a <code>"drop"</code> event is emitted with a name, remove it. Export both as <code>{ registrar, enrolled }</code>.</p>`,
      seed: `const EventEmitter = require('events')\n\nconst registrar = new EventEmitter()\nconst enrolled = []\n\n// add your listeners here\n\nmodule.exports = { registrar, enrolled }\n`,
      tests: [
        { text: 'registrar has a listener for "enroll" and for "drop"', test: `module.exports.registrar.listenerCount('enroll') >= 1 && module.exports.registrar.listenerCount('drop') >= 1` },
        { text: 'Emitting "enroll" adds names to enrolled', test: `(m => (m.registrar.emit('enroll', 'Ana'), m.registrar.emit('enroll', 'Ben'), m.enrolled.join() === 'Ana,Ben'))(module.exports)` },
        { text: 'Enrolling the same name twice keeps one copy', test: `(m => (m.registrar.emit('enroll', 'Ana'), m.registrar.emit('enroll', 'Ana'), m.enrolled.length === 1))(module.exports)` },
        { text: 'Emitting "drop" removes that name only', test: `(m => (m.registrar.emit('enroll', 'Ana'), m.registrar.emit('enroll', 'Ben'), m.registrar.emit('drop', 'Ana'), m.enrolled.join() === 'Ben'))(module.exports)` },
        { text: 'The exported array itself is updated (not replaced by a new one)', test: `(m => { const ref = m.enrolled; m.registrar.emit('enroll', 'Cara'); m.registrar.emit('drop', 'Cara'); m.registrar.emit('enroll', 'Dan'); return ref === m.enrolled && ref.join() === 'Dan' })(module.exports)` },
      ],
    },
    {
      id: 'node-04',
      title: 'A web server with the http module',
      body: `<p><code>http.createServer</code> takes a function that runs for every request. <code>req.method</code> and <code>req.url</code> say what was asked; you answer with <code>res.writeHead(status, headers)</code> and <code>res.end(body)</code>.</p>
<p>Create a server and export it. It must answer:</p>
<ul><li><code>GET /hello</code> → status 200, header <code>Content-Type: application/json</code>, body <code>{"message":"Hello, Node!"}</code></li><li><code>GET /time</code> → status 200, JSON with a <code>year</code> property holding the current year as a number</li><li>anything else → status 404, JSON body <code>{"error":"Not found"}</code></li></ul>`,
      seed: `const http = require('http')\n\nconst server = http.createServer((req, res) => {\n\n})\n\nmodule.exports = server\n`,
      tests: [
        { text: 'GET /hello responds with status 200', test: `(await request('GET', '/hello')).status === 200` },
        { text: 'GET /hello sends Content-Type: application/json', test: `/application\\/json/.test((await request('GET', '/hello')).headers['content-type'] || '')` },
        { text: 'GET /hello body is {"message":"Hello, Node!"}', test: `(await request('GET', '/hello')).body.message === 'Hello, Node!'` },
        { text: 'GET /time returns the current year as a number', test: `(await request('GET', '/time')).body.year === new Date().getFullYear()` },
        { text: 'An unknown path responds with status 404', test: `(await request('GET', '/nope')).status === 404` },
        { text: 'The 404 body is {"error":"Not found"}', test: `(await request('GET', '/nope')).body.error === 'Not found'` },
        { text: 'POST /hello is also 404 (only GET is handled)', test: `(await request('POST', '/hello')).status === 404` },
      ],
    },
    {
      id: 'node-05',
      title: 'Express routes and parameters',
      body: `<p>Express makes routing short: <code>app.get(path, handler)</code>. A segment like <code>:id</code> is a route parameter, available as <code>req.params.id</code> (always a string). Query strings such as <code>?course=BSCS</code> arrive in <code>req.query</code>. <code>res.json()</code> sends JSON and <code>res.status()</code> sets the status code.</p>
<p>Using the <code>students</code> array provided, add:</p>
<ul><li><code>GET /api/students</code> → all students; with <code>?course=BSCS</code>, only that course</li><li><code>GET /api/students/:id</code> → that one student, or status 404 with <code>{ "error": "Student not found" }</code></li></ul>`,
      seed: `const express = require('express')\nconst app = express()\n\n${STUDENTS}\n\n// add your routes here\n\nmodule.exports = app\n`,
      tests: [
        { text: 'GET /api/students responds 200 with all three students', test: `(r => r.status === 200 && Array.isArray(r.body) && r.body.length === 3)(await request('GET', '/api/students'))` },
        { text: 'GET /api/students?course=BSCS returns only the BSCS students', test: `(r => r.body.length === 2 && r.body.every(s => s.course === 'BSCS'))(await request('GET', '/api/students?course=BSCS'))` },
        { text: 'GET /api/students/2 returns Ben', test: `(r => r.status === 200 && r.body.name === 'Ben' && r.body.id === 2)(await request('GET', '/api/students/2'))` },
        { text: 'GET /api/students/99 responds with status 404', test: `(await request('GET', '/api/students/99')).status === 404` },
        { text: 'The 404 body is { "error": "Student not found" }', test: `(await request('GET', '/api/students/99')).body.error === 'Student not found'` },
      ],
    },
    {
      id: 'node-06',
      title: 'A complete REST API',
      body: `<p>A REST API maps the four data operations to HTTP methods: <code>GET</code> reads, <code>POST</code> creates (status 201), <code>PUT</code> updates and <code>DELETE</code> removes. <code>express.json()</code> middleware parses the request body into <code>req.body</code>. Always validate input and answer with the right status code.</p>
<p>Starting from the same <code>students</code> array, add:</p>
<ul><li><code>POST /api/students</code> → needs <code>name</code> and <code>course</code> in the body. Missing either: status 400 with <code>{ "error": "name and course are required" }</code>. Otherwise add the student with the next id and respond 201 with the new student.</li><li><code>PUT /api/students/:id</code> → update name and/or course; respond with the updated student, or 404.</li><li><code>DELETE /api/students/:id</code> → remove it and respond with status 204 and no body, or 404.</li><li><code>GET /api/students</code> → the current list.</li></ul>`,
      seed: `const express = require('express')\nconst app = express()\napp.use(express.json())\n\n${STUDENTS.replace('const', 'let')}\n\napp.get('/api/students', (req, res) => {\n  res.json(students)\n})\n\n// add POST, PUT and DELETE here\n\nmodule.exports = app\n`,
      tests: [
        { text: 'POST with name and course responds 201 with the new student, id 4', test: `(r => r.status === 201 && r.body.id === 4 && r.body.name === 'Dan' && r.body.course === 'BSIS')(await request('POST', '/api/students', { name: 'Dan', course: 'BSIS' }))` },
        { text: 'The new student then appears in GET /api/students', test: `(await request('POST', '/api/students', { name: 'Dan', course: 'BSIS' }), (await request('GET', '/api/students')).body.length === 4)` },
        { text: 'POST without a course responds 400 with the error message', test: `(r => r.status === 400 && r.body.error === 'name and course are required')(await request('POST', '/api/students', { name: 'Dan' }))` },
        { text: 'A rejected POST does not add anything', test: `(await request('POST', '/api/students', { course: 'BSIS' }), (await request('GET', '/api/students')).body.length === 3)` },
        { text: 'PUT /api/students/1 updates and returns the student', test: `(r => r.status === 200 && r.body.id === 1 && r.body.course === 'BSIT' && r.body.name === 'Ana')(await request('PUT', '/api/students/1', { course: 'BSIT' }))` },
        { text: 'PUT on a missing id responds 404', test: `(await request('PUT', '/api/students/99', { course: 'BSIT' })).status === 404` },
        { text: 'DELETE /api/students/2 responds 204 and removes Ben', test: `(await request('DELETE', '/api/students/2')).status === 204 && (await request('GET', '/api/students')).body.every(s => s.name !== 'Ben')` },
        { text: 'DELETE on a missing id responds 404', test: `(await request('DELETE', '/api/students/99')).status === 404` },
      ],
    },
  ],
  quiz: [
    { q: 'What does require("./math") return?', a: ['Whatever that file assigned to module.exports', 'Whatever that file printed with console.log', 'A string with the full text of the math file', 'A promise that resolves when the file loads'] },
    { q: 'Which HTTP status code means a resource was created successfully?', a: ['201', '200', '204', '301'] },
    { q: 'In Express, where do you read the value of :id for the route /users/:id?', a: ['req.params.id', 'req.query.id', 'req.body.id', 'req.route.id'] },
    { q: 'What does the express.json() middleware do?', a: ['Parses a JSON request body into req.body', 'Sends every response to the client as JSON', 'Loads the package.json file into req.body', 'Checks that each route returns valid JSON'] },
    { q: 'Which file lists the packages a Node.js project depends on?', a: ['package.json', 'index.html', 'server.js', 'node.config'] },
    { q: 'Which HTTP method is conventionally used to remove a resource?', a: ['DELETE', 'REMOVE', 'PATCH', 'POST'] },
    { q: 'Why is Node.js able to handle many requests at once on a single thread?', a: ['It uses non-blocking, event-driven I/O', 'It starts a new thread for each request', 'It compiles JavaScript to machine code', 'It keeps all of its data inside memory'] },
    { q: 'Which status code should an API send when the request body fails validation?', a: ['400', '404', '500', '302'] },
  ],
  project: {
    title: 'Notes REST API',
    brief: 'Build and deploy an Express REST API for notes (or another resource you choose), tested with Postman or Thunder Client.',
    requirements: [
      'Express app split into routes and controllers, started with an npm script',
      'Full CRUD: GET all, GET one, POST, PUT and DELETE with correct status codes',
      'Input validation with clear JSON error messages (400) and a 404 handler',
      'At least one custom middleware (for example a request logger)',
      'Configuration such as the port read from environment variables with dotenv',
      'README with setup steps and a table of every endpoint; Postman collection or screenshots included',
    ],
  },
}
