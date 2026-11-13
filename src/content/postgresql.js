const setup = `
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  course TEXT NOT NULL,
  year INT NOT NULL,
  grade NUMERIC(5,2)
);
INSERT INTO students (name, course, year, grade) VALUES
  ('Ana', 'BSCS', 3, 92), ('Ben', 'BSIT', 2, 81), ('Cara', 'BSCS', 1, 74),
  ('Dan', 'BSIS', 3, 88), ('Ella', 'BSIT', 1, 69), ('Franz', 'BSCS', 2, 85),
  ('Gina', 'BSIS', 2, 95), ('Hugo', 'BSCS', 3, 79);
CREATE TABLE subjects (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  units INT NOT NULL
);
INSERT INTO subjects VALUES
  ('CSAE104', 'Web Programming', 3), ('CSPC103', 'Object-Oriented Programming', 3), ('CSCC104', 'Data Structures', 3);
CREATE TABLE enrollments (
  student_id INT REFERENCES students(id),
  subject_code TEXT REFERENCES subjects(code),
  final_grade NUMERIC(5,2),
  PRIMARY KEY (student_id, subject_code)
);
INSERT INTO enrollments VALUES
  (1, 'CSAE104', 94), (1, 'CSPC103', 90), (2, 'CSAE104', 80), (4, 'CSAE104', 87),
  (4, 'CSCC104', 89), (6, 'CSPC103', 84), (7, 'CSAE104', 96), (8, 'CSCC104', 78);
`
const schema = `<p>The database has three tables:</p>
<pre>students(id, name, course, year, grade)
subjects(code, title, units)
enrollments(student_id, subject_code, final_grade)</pre>`

export default {
  id: 'postgresql',
  title: 'PostgreSQL',
  tagline: 'Query relational data with SQL: tables, constraints, joins, grouping and subqueries.',
  color: '#336791',
  type: 'sql',
  note: 'These challenges run on a real PostgreSQL engine inside your browser. The first run takes a few seconds to load it. The same SQL works unchanged in Supabase.',
  challenges: [
    {
      id: 'pg-01',
      title: 'SELECT, WHERE and ORDER BY',
      body: `<p><code>SELECT</code> chooses columns, <code>FROM</code> names the table, <code>WHERE</code> filters rows and <code>ORDER BY</code> sorts them. Text values go in single quotes.</p>${schema}
<p>Write one query that returns the <code>name</code> and <code>grade</code> of every BSCS student with a grade of 75 or higher, highest grade first.</p>`,
      setup,
      seed: `SELECT \nFROM students\n`,
      tests: [
        { text: 'The result has exactly two columns: name, grade', test: `cols.join() === 'name,grade'` },
        { text: 'It returns the 3 BSCS students with grade 75 or higher', test: `rows.length === 3 && rows.map(r => r.name).sort().join() === 'Ana,Franz,Hugo'` },
        { text: 'Rows are sorted from highest to lowest grade', test: `rows.map(r => r.name).join() === 'Ana,Franz,Hugo'` },
      ],
    },
    {
      id: 'pg-02',
      title: 'CREATE TABLE with constraints',
      body: `<p>A table definition lists columns, their types and their <em>constraints</em>, the rules PostgreSQL enforces on every row: <code>PRIMARY KEY</code>, <code>NOT NULL</code>, <code>UNIQUE</code>, <code>CHECK (...)</code>, <code>DEFAULT</code> and <code>REFERENCES other_table(column)</code> for a foreign key.</p>${schema}
<p>Create a table named <code>projects</code> with:</p>
<ul><li><code>id</code> – auto-numbered primary key (<code>SERIAL</code>)</li><li><code>title</code> – text, required, unique</li><li><code>student_id</code> – integer, required, foreign key to <code>students(id)</code></li><li><code>score</code> – integer that must be between 0 and 100</li><li><code>submitted_on</code> – date that defaults to today (<code>CURRENT_DATE</code>)</li></ul>`,
      setup,
      seed: `CREATE TABLE projects (\n\n);\n`,
      tests: [
        { text: 'The projects table has the five columns', test: `(await q("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' ORDER BY column_name")).map(r => r.column_name).join() === 'id,score,student_id,submitted_on,title'` },
        { text: 'A valid row can be inserted, and id and submitted_on fill in by themselves', test: `(r => r.length === 1 && r[0].id === 1 && r[0].submitted_on !== null)(await q("INSERT INTO projects (title, student_id, score) VALUES ('Portfolio', 1, 95) RETURNING id, submitted_on"))` },
        { text: 'title is required (NOT NULL)', test: `Number((await q("SELECT COUNT(*) AS n FROM information_schema.columns WHERE table_name = 'projects'"))[0].n) === 5 && await fails("INSERT INTO projects (title, student_id, score) VALUES (NULL, 1, 90)")` },
        { text: 'title is UNIQUE', test: `(await q("INSERT INTO projects (title, student_id, score) VALUES ('Dup', 1, 90) RETURNING id")).length === 1 && await fails("INSERT INTO projects (title, student_id, score) VALUES ('Dup', 2, 80)")` },
        { text: 'student_id must refer to an existing student (foreign key)', test: `Number((await q("SELECT COUNT(*) AS n FROM information_schema.columns WHERE table_name = 'projects'"))[0].n) === 5 && await fails("INSERT INTO projects (title, student_id, score) VALUES ('Ghost', 999, 90)")` },
        { text: 'score outside 0–100 is rejected (CHECK)', test: `Number((await q("SELECT COUNT(*) AS n FROM information_schema.columns WHERE table_name = 'projects'"))[0].n) === 5 && await fails("INSERT INTO projects (title, student_id, score) VALUES ('High', 1, 101)") && await fails("INSERT INTO projects (title, student_id, score) VALUES ('Low', 1, -1)")` },
      ],
    },
    {
      id: 'pg-03',
      title: 'INSERT, UPDATE and DELETE',
      body: `<p><code>INSERT INTO … VALUES</code> adds rows, <code>UPDATE … SET … WHERE</code> changes them and <code>DELETE FROM … WHERE</code> removes them. An <code>UPDATE</code> or <code>DELETE</code> without <code>WHERE</code> hits <b>every</b> row, so always write the condition first.</p>${schema}
<p>Write three statements, each ending with a semicolon: (1) insert a student named Liza, BSIT, year 1, grade 88; (2) add 3 points to the grade of every BSIS student; (3) delete the students whose grade is below 70.</p>`,
      setup,
      seed: `INSERT INTO students (name, course, year, grade)\nVALUES ();\n\n`,
      tests: [
        { text: 'Liza was inserted with course BSIT, year 1 and grade 88', test: `(r => r.length === 1 && r[0].course === 'BSIT' && r[0].year === 1 && Number(r[0].grade) === 88)(await q("SELECT * FROM students WHERE name = 'Liza'"))` },
        { text: 'BSIS grades went up by 3 (Dan 91, Gina 98)', test: `(r => Number(r[0].grade) === 91 && Number(r[1].grade) === 98)(await q("SELECT grade FROM students WHERE course = 'BSIS' ORDER BY name"))` },
        { text: 'Grades in other courses did not change', test: `Number((await q("SELECT grade FROM students WHERE name = 'Ana'"))[0].grade) === 92` },
        { text: 'The student with a grade below 70 (Ella) was deleted', test: `(await q("SELECT 1 FROM students WHERE grade < 70")).length === 0` },
        { text: 'Nobody else was deleted: 8 students remain', test: `Number((await q("SELECT COUNT(*) AS n FROM students"))[0].n) === 8` },
      ],
    },
    {
      id: 'pg-04',
      title: 'Joining tables',
      body: `<p>Relational data is split across tables and put back together with <code>JOIN … ON</code>, matching a foreign key to the key it refers to. Table aliases (<code>students s</code>) keep the query short.</p>${schema}
<p>List everyone enrolled in Web Programming (subject code <code>CSAE104</code>). Return three columns named <code>name</code> (the student), <code>title</code> (the subject) and <code>final_grade</code>, sorted by final grade from highest to lowest. You need all three tables.</p>`,
      setup,
      seed: `SELECT s.name\nFROM enrollments e\nJOIN students s ON \n`,
      tests: [
        { text: 'The columns are name, title, final_grade', test: `cols.join() === 'name,title,final_grade'` },
        { text: 'It returns the 4 students enrolled in CSAE104', test: `rows.length === 4 && rows.map(r => r.name).sort().join() === 'Ana,Ben,Dan,Gina'` },
        { text: 'Every row shows the title "Web Programming"', test: `rows.length > 0 && rows.every(r => r.title === 'Web Programming')` },
        { text: 'Rows are sorted by final_grade, highest first', test: `rows.map(r => r.name).join() === 'Gina,Ana,Dan,Ben'` },
      ],
    },
    {
      id: 'pg-05',
      title: 'GROUP BY and aggregate functions',
      body: `<p>Aggregate functions (<code>COUNT</code>, <code>AVG</code>, <code>SUM</code>, <code>MIN</code>, <code>MAX</code>) collapse many rows into one value. <code>GROUP BY</code> does that once per group, and <code>HAVING</code> filters the groups afterwards (<code>WHERE</code> filters rows before grouping).</p>${schema}
<p>For each course, return <code>course</code>, the number of students as <code>total</code>, and the average grade rounded to 2 decimals as <code>avg_grade</code>. Keep only the courses whose average is 80 or higher (use <code>HAVING</code>), and sort by <code>avg_grade</code> from highest to lowest.</p>`,
      setup,
      seed: `SELECT course\nFROM students\nGROUP BY course\n`,
      tests: [
        { text: 'The columns are course, total, avg_grade', test: `cols.join() === 'course,total,avg_grade'` },
        { text: 'BSIT (average 75) is filtered out by HAVING', test: `rows.length === 2 && rows.every(r => r.course !== 'BSIT')` },
        { text: 'BSIS has total 2 and avg_grade 91.50', test: `(r => r && Number(r.total) === 2 && Number(r.avg_grade) === 91.5)(rows.find(r => r.course === 'BSIS'))` },
        { text: 'BSCS has total 4 and avg_grade 82.50', test: `(r => r && Number(r.total) === 4 && Number(r.avg_grade) === 82.5)(rows.find(r => r.course === 'BSCS'))` },
        { text: 'Rows are sorted by avg_grade, highest first', test: `rows.map(r => r.course).join() === 'BSIS,BSCS'` },
      ],
    },
    {
      id: 'pg-06',
      title: 'LEFT JOIN and subqueries',
      body: `<p>An inner <code>JOIN</code> drops rows that have no match. A <code>LEFT JOIN</code> keeps every row from the left table and fills the missing side with <code>NULL</code>, which is how you find things that are <em>absent</em>. A subquery is a query in parentheses used inside another one, for example <code>WHERE grade &gt; (SELECT AVG(grade) FROM students)</code>.</p>${schema}
<p>Return <code>name</code> and <code>subjects</code> (how many subjects each student is enrolled in, including students with zero) for the students whose grade is above the overall average grade. Sort by <code>subjects</code> from most to fewest, then by name.</p>`,
      setup,
      seed: `SELECT s.name\nFROM students s\nLEFT JOIN enrollments e ON \n`,
      tests: [
        { text: 'The columns are name, subjects', test: `cols.join() === 'name,subjects'` },
        { text: 'Only students above the average grade (82.875) are returned', test: `rows.length === 4 && rows.map(r => r.name).sort().join() === 'Ana,Dan,Franz,Gina'` },
        { text: 'Ana and Dan have 2 subjects; Franz and Gina have 1', test: `(m => Number(m.Ana) === 2 && Number(m.Dan) === 2 && Number(m.Franz) === 1 && Number(m.Gina) === 1)(Object.fromEntries(rows.map(r => [r.name, r.subjects])))` },
        { text: 'Sorted by subjects (most first), then by name', test: `rows.map(r => r.name).join() === 'Ana,Dan,Franz,Gina'` },
        { text: 'The query uses a LEFT JOIN and a subquery', test: `/left\\s+(outer\\s+)?join/i.test(sql) && /\\(\\s*select/i.test(sql)` },
      ],
    },
  ],
  quiz: [
    { q: 'Which clause filters rows before they are grouped?', a: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'] },
    { q: 'What does a PRIMARY KEY constraint guarantee?', a: ['Each value is unique and not null', 'Each value is unique but may be null', 'Each value is indexed but may repeat', 'Each value refers to another table'] },
    { q: 'What does a foreign key do?', a: ['Requires a matching row in another table', 'Requires a unique value in the same table', 'Creates a copy of a row in another table', 'Speeds up every query on the same table'] },
    { q: 'What does a LEFT JOIN return that an inner JOIN does not?', a: ['Left-table rows that have no match', 'Right-table rows that have no match', 'Only the rows that have no match', 'Duplicate rows from both tables'] },
    { q: 'What happens when you run UPDATE students SET grade = 0 with no WHERE clause?', a: ['Every row in the table is updated', 'Only the first row found is updated', 'No rows are updated, with an error', 'Only rows with null grades update'] },
    { q: 'Which function returns the number of rows in each group?', a: ['COUNT(*)', 'SUM(*)', 'TOTAL(*)', 'ROWS(*)'] },
    { q: 'Which clause filters groups after aggregation, as in "courses with more than 5 students"?', a: ['HAVING', 'WHERE', 'GROUP BY', 'DISTINCT'] },
    { q: 'How does a relational database differ from MongoDB in how it stores data?', a: ['Rows in tables with a fixed schema', 'Documents with a flexible schema', 'Key-value pairs with no schema', 'Files in folders with no schema'] },
  ],
  project: {
    title: 'PERN Enrollment Database',
    brief: 'Design a normalized PostgreSQL database on Supabase and expose it through an Express API using the pg library and raw SQL.',
    requirements: [
      'At least four related tables with primary keys, foreign keys, NOT NULL, UNIQUE and CHECK constraints',
      'An ER diagram and the full schema as a .sql file that runs cleanly on an empty database',
      'Seed data: at least 10 rows in each main table',
      'Express endpoints using parameterized queries ($1, $2) only; no string concatenation',
      'One endpoint using a JOIN across three tables and one using GROUP BY with an aggregate',
      'Database URL kept in .env; README listing endpoints with sample responses',
    ],
  },
}
