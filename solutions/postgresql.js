export default {
  'pg-01': `SELECT name, grade FROM students WHERE course = 'BSCS' AND grade >= 75 ORDER BY grade DESC;`,
  'pg-02': `CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  student_id INT NOT NULL REFERENCES students(id),
  score INT CHECK (score BETWEEN 0 AND 100),
  submitted_on DATE DEFAULT CURRENT_DATE
);`,
  'pg-03': `INSERT INTO students (name, course, year, grade) VALUES ('Liza', 'BSIT', 1, 88);
UPDATE students SET grade = grade + 3 WHERE course = 'BSIS';
DELETE FROM students WHERE grade < 70;`,
  'pg-04': `SELECT s.name, sub.title, e.final_grade FROM enrollments e
JOIN students s ON s.id = e.student_id JOIN subjects sub ON sub.code = e.subject_code
WHERE sub.code = 'CSAE104' ORDER BY e.final_grade DESC;`,
  'pg-05': `SELECT course, COUNT(*) AS total, ROUND(AVG(grade), 2) AS avg_grade FROM students
GROUP BY course HAVING AVG(grade) >= 80 ORDER BY avg_grade DESC;`,
  'pg-06': `SELECT s.name, COUNT(e.subject_code) AS subjects FROM students s
LEFT JOIN enrollments e ON e.student_id = s.id
WHERE s.grade > (SELECT AVG(grade) FROM students)
GROUP BY s.id, s.name ORDER BY subjects DESC, s.name;`,
}
