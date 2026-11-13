const students = [
  { _id: 1, name: 'Ana', course: 'BSCS', year: 3, grade: 92, skills: ['html', 'css'] },
  { _id: 2, name: 'Ben', course: 'BSIT', year: 2, grade: 81, skills: ['html'] },
  { _id: 3, name: 'Cara', course: 'BSCS', year: 1, grade: 74, skills: [] },
  { _id: 4, name: 'Dan', course: 'BSIS', year: 3, grade: 88, skills: ['sql', 'html'] },
  { _id: 5, name: 'Ella', course: 'BSIT', year: 1, grade: 69, skills: ['css'] },
  { _id: 6, name: 'Franz', course: 'BSCS', year: 2, grade: 85, skills: ['js', 'react'] },
  { _id: 7, name: 'Gina', course: 'BSIS', year: 2, grade: 95, skills: ['sql'] },
  { _id: 8, name: 'Hugo', course: 'BSCS', year: 3, grade: 79, skills: ['js'] },
]
const data = { collections: { students } }
const table = `<p>The <code>students</code> collection has 8 documents shaped like this:</p>
<pre>{ _id: 1, name: "Ana", course: "BSCS", year: 3,
  grade: 92, skills: ["html", "css"] }</pre>`

export default {
  id: 'mongodb',
  title: 'MongoDB',
  tagline: 'Store documents instead of rows: CRUD queries, operators and aggregation.',
  color: '#00684a',
  type: 'mongo',
  note: 'These challenges run on an in-browser MongoDB look-alike that understands mongosh syntax. The same queries work unchanged in MongoDB Atlas.',
  challenges: [
    {
      id: 'mongo-01',
      title: 'Finding documents',
      body: `<p>MongoDB stores JSON-like <em>documents</em> in <em>collections</em>. <code>db.students.find({ course: "BSCS" })</code> returns every document whose <code>course</code> equals <code>"BSCS"</code>; <code>findOne</code> returns just the first match.</p>${table}
<p>Set <code>bscs</code> to all BSCS students, <code>thirdYearBscs</code> to BSCS students in year 3 (two conditions in one filter), and <code>gina</code> to the single document whose name is Gina.</p>`,
      data,
      seed: `const bscs = db.students.find({ })\n\nconst thirdYearBscs = db.students.find({ })\n\nconst gina = null\n`,
      tests: [
        { text: 'bscs holds the 4 BSCS students', test: `arr(bscs).length === 4 && arr(bscs).every(s => s.course === 'BSCS')` },
        { text: 'thirdYearBscs holds Ana and Hugo', test: `arr(thirdYearBscs).map(s => s.name).sort().join() === 'Ana,Hugo'` },
        { text: 'gina is one document (from findOne), not a list', test: `gina !== null && !Array.isArray(gina) && typeof gina.toArray !== 'function' && gina.name === 'Gina'` },
      ],
    },
    {
      id: 'mongo-02',
      title: 'Operators, projection, sort and limit',
      body: `<p>Comparison operators go inside the filter: <code>{ grade: { $gte: 85 } }</code>. Others include <code>$gt</code>, <code>$lt</code>, <code>$lte</code>, <code>$ne</code> and <code>$in</code>. The second argument of <code>find</code> is a <em>projection</em> choosing which fields come back, and the cursor can be chained with <code>.sort()</code> and <code>.limit()</code>.</p>${table}
<p>Set <code>honors</code> to students with a grade of 85 or higher, returning only <code>name</code> and <code>grade</code> (no <code>_id</code>), highest grade first. Set <code>topTwo</code> to the two highest-graded students among BSIT and BSIS (use <code>$in</code>).</p>`,
      data,
      seed: `const honors = db.students.find({ }, { })\n\nconst topTwo = db.students.find({ })\n`,
      tests: [
        { text: 'honors contains the 4 students with grade 85 or higher', test: `arr(honors).length === 4 && arr(honors).every(s => s.grade >= 85)` },
        { text: 'honors is sorted from highest to lowest grade', test: `arr(honors).map(s => s.name).join() === 'Gina,Ana,Dan,Franz'` },
        { text: 'honors documents have only name and grade', test: `arr(honors).length > 0 && arr(honors).every(s => Object.keys(s).sort().join() === 'grade,name')` },
        { text: 'topTwo holds exactly two students, both BSIT or BSIS', test: `arr(topTwo).length === 2 && arr(topTwo).every(s => ['BSIT', 'BSIS'].includes(s.course))` },
        { text: 'topTwo is Gina then Dan', test: `arr(topTwo).map(s => s.name).join() === 'Gina,Dan'` },
      ],
    },
    {
      id: 'mongo-03',
      title: 'Inserting documents',
      body: `<p><code>insertOne(doc)</code> adds one document and <code>insertMany([docs])</code> adds several. MongoDB creates the <code>_id</code> for you when you leave it out. There is no fixed schema, so documents in one collection may have different fields.</p>${table}
<p>Insert a student named <b>Liza</b> (BSIT, year 1, grade 88, skills <code>["html"]</code>) with <code>insertOne</code>. Then use one <code>insertMany</code> to add <b>Marco</b> (BSCS, year 2, grade 77) and <b>Nina</b> (BSIS, year 1, grade 91). Finally set <code>total</code> to the number of documents using <code>countDocuments</code>.</p>`,
      data,
      seed: `db.students.insertOne({ })\n\n// insertMany here\n\nconst total = 0\n`,
      tests: [
        { text: 'Liza exists with course BSIT, year 1 and grade 88', test: `(s => s && s.course === 'BSIT' && s.year === 1 && s.grade === 88)(db.students.findOne({ name: 'Liza' }))` },
        { text: "Liza's skills is the array [\"html\"]", test: `(s => s && Array.isArray(s.skills) && s.skills.join() === 'html')(db.students.findOne({ name: 'Liza' }))` },
        { text: 'Marco and Nina were added with the right course and grade', test: `db.students.countDocuments({ name: 'Marco', course: 'BSCS', year: 2, grade: 77 }) === 1 && db.students.countDocuments({ name: 'Nina', course: 'BSIS', year: 1, grade: 91 }) === 1` },
        { text: 'Every new document received an _id', test: `db.students.find({ name: { $in: ['Liza', 'Marco', 'Nina'] } }).toArray().every(s => s._id !== undefined)` },
        { text: 'total is 11 and came from countDocuments', test: `total === 11 && db.students.countDocuments() === 11` },
      ],
    },
    {
      id: 'mongo-04',
      title: 'Updating documents',
      body: `<p><code>updateOne(filter, update)</code> changes the first match; <code>updateMany</code> changes all matches. The update uses operators: <code>$set</code> assigns a field, <code>$inc</code> adds to a number, <code>$push</code> appends to an array. Without an operator you would replace the whole document.</p>${table}
<p>Do three updates: (1) set Cara's <code>year</code> to 2, (2) add 5 points to the grade of every BSIT student, and (3) push the skill <code>"mongodb"</code> onto Franz's skills.</p>`,
      data,
      seed: `db.students.updateOne({ name: 'Cara' }, { })\n\n// two more updates\n`,
      tests: [
        { text: "Cara's year is now 2 and her other fields are intact", test: `(s => s.year === 2 && s.course === 'BSCS' && s.grade === 74)(db.students.findOne({ name: 'Cara' }))` },
        { text: 'Both BSIT students gained 5 points (Ben 86, Ella 74)', test: `db.students.findOne({ name: 'Ben' }).grade === 86 && db.students.findOne({ name: 'Ella' }).grade === 74` },
        { text: 'No other course had its grades changed', test: `db.students.findOne({ name: 'Ana' }).grade === 92 && db.students.findOne({ name: 'Gina' }).grade === 95` },
        { text: `Franz's skills are now ["js", "react", "mongodb"]`, test: `db.students.findOne({ name: 'Franz' }).skills.join() === 'js,react,mongodb'` },
        { text: 'There are still 8 documents', test: `db.students.countDocuments() === 8` },
      ],
    },
    {
      id: 'mongo-05',
      title: 'Logical operators and deleting',
      body: `<p><code>$or</code> takes an array of conditions and matches a document that satisfies any of them; <code>$and</code> needs all. Array fields can be queried directly: <code>{ skills: "html" }</code> matches documents whose array contains <code>"html"</code>. <code>deleteOne</code> and <code>deleteMany</code> remove documents using the same kind of filter.</p>${table}
<p>First set <code>picked</code> to the <b>names only</b> of students who are in BSIS <em>or</em> have a grade above 90 (project just <code>name</code>). Set <code>webbies</code> to the number of students whose skills include <code>"html"</code>. Then delete every student whose grade is below 75, and set <code>removed</code> to how many were deleted (the result's <code>deletedCount</code>).</p>`,
      data,
      seed: `const picked = db.students.find({ })\n\nconst webbies = 0\n\nconst removed = 0\n`,
      tests: [
        { text: 'picked holds Ana, Dan and Gina', test: `arr(picked).map(s => s.name).sort().join() === 'Ana,Dan,Gina'` },
        { text: 'picked documents contain only the name', test: `arr(picked).length > 0 && arr(picked).every(s => Object.keys(s).join() === 'name')` },
        { text: 'webbies is 3', test: `webbies === 3` },
        { text: 'Students with a grade below 75 are gone (Cara and Ella)', test: `db.students.countDocuments({ grade: { $lt: 75 } }) === 0 && db.students.countDocuments() === 6` },
        { text: 'removed is 2, taken from deletedCount', test: `removed === 2` },
      ],
    },
    {
      id: 'mongo-06',
      title: 'The aggregation pipeline',
      body: `<p><code>aggregate</code> passes documents through a list of stages. <code>$match</code> filters, <code>$group</code> combines documents that share an <code>_id</code> value and computes things like <code>{ $avg: "$grade" }</code> or <code>{ $sum: 1 }</code>, and <code>$sort</code> orders the output.</p>${table}
<p>Set <code>report</code> to an aggregation that: keeps only students in year 2 or 3, groups them by course, computes <code>average</code> (the mean grade) and <code>count</code> (how many students) per course, and sorts by <code>average</code> from highest to lowest.</p>`,
      data,
      seed: `const report = db.students.aggregate([\n  { $match: { } },\n  // $group and $sort stages\n])\n`,
      tests: [
        { text: 'report has one document per course (3)', test: `arr(report).length === 3` },
        { text: 'Each document has _id (the course), average and count', test: `arr(report).length > 0 && arr(report).every(r => typeof r._id === 'string' && typeof r.average === 'number' && typeof r.count === 'number')` },
        { text: 'First-year students were filtered out (counts are 2, 3 and 1)', test: `(m => m.BSIS === 2 && m.BSCS === 3 && m.BSIT === 1)(Object.fromEntries(arr(report).map(r => [r._id, r.count])))` },
        { text: 'BSIS averages 91.5 and BSIT 81', test: `(m => m.BSIS === 91.5 && m.BSIT === 81)(Object.fromEntries(arr(report).map(r => [r._id, r.average])))` },
        { text: 'The result is sorted by average, highest first', test: `arr(report).map(r => r._id).join() === 'BSIS,BSCS,BSIT'` },
      ],
    },
  ],
  quiz: [
    { q: 'In MongoDB, what is the equivalent of a row in a relational table?', a: ['A document', 'A collection', 'A database', 'A field'] },
    { q: 'What does the filter { grade: { $gte: 75 } } match?', a: ['Grades of 75 or higher', 'Grades of 75 or lower', 'Grades higher than 75', 'Grades exactly at 75'] },
    { q: 'What happens to the other fields when you update with { $set: { year: 2 } }?', a: ['They stay exactly as they were', 'They are removed from the doc', 'They are all reset to be null', 'They are copied to a new doc'] },
    { q: 'What does the projection { name: 1, _id: 0 } return for each document?', a: ['Only the name field', 'Only the _id field', 'All except the name', 'The name and the _id'] },
    { q: 'Which aggregation stage combines documents that share a value and computes totals?', a: ['$group', '$match', '$project', '$sort'] },
    { q: 'What does MongoDB do when you insert a document without an _id?', a: ['It generates a unique _id for it', 'It rejects it with an error code', 'It copies the previous _id to it', 'It leaves the _id field as null'] },
    { q: 'Which statement about a MongoDB collection is true?', a: ['Its documents may have different fields', 'Its documents must share the same fields', 'Its documents must be created by a table', 'Its documents may hold only text values'] },
    { q: 'Which method removes every document that matches a filter?', a: ['deleteMany', 'deleteOne', 'dropIndex', 'removeAll'] },
  ],
  project: {
    title: 'MERN-Ready Data API',
    brief: 'Connect an Express API to MongoDB Atlas with Mongoose and store real data for a resource of your choice.',
    requirements: [
      'MongoDB Atlas cluster with the connection string kept in a .env file (never committed)',
      'A Mongoose schema with at least five fields, required fields and one custom validator',
      'CRUD endpoints that read and write the Atlas collection',
      'One endpoint that filters, sorts and paginates using query-string parameters',
      'One endpoint backed by an aggregation pipeline (for example a summary per category)',
      'Seed script that loads at least 15 sample documents; README with endpoints and sample responses',
    ],
  },
}
