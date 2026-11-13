export default {
  'mongo-01': `const bscs = db.students.find({ course: 'BSCS' })
const thirdYearBscs = db.students.find({ course: 'BSCS', year: 3 })
const gina = db.students.findOne({ name: 'Gina' })`,
  'mongo-02': `const honors = db.students.find({ grade: { $gte: 85 } }, { name: 1, grade: 1, _id: 0 }).sort({ grade: -1 })
const topTwo = db.students.find({ course: { $in: ['BSIT', 'BSIS'] } }).sort({ grade: -1 }).limit(2)`,
  'mongo-03': `db.students.insertOne({ name: 'Liza', course: 'BSIT', year: 1, grade: 88, skills: ['html'] })
db.students.insertMany([{ name: 'Marco', course: 'BSCS', year: 2, grade: 77 }, { name: 'Nina', course: 'BSIS', year: 1, grade: 91 }])
const total = db.students.countDocuments()`,
  'mongo-04': `db.students.updateOne({ name: 'Cara' }, { $set: { year: 2 } })
db.students.updateMany({ course: 'BSIT' }, { $inc: { grade: 5 } })
db.students.updateOne({ name: 'Franz' }, { $push: { skills: 'mongodb' } })`,
  'mongo-05': `const picked = db.students.find({ $or: [{ course: 'BSIS' }, { grade: { $gt: 90 } }] }, { name: 1, _id: 0 })
const webbies = db.students.countDocuments({ skills: 'html' })
const removed = db.students.deleteMany({ grade: { $lt: 75 } }).deletedCount`,
  'mongo-06': `const report = db.students.aggregate([
  { $match: { year: { $in: [2, 3] } } },
  { $group: { _id: '$course', average: { $avg: '$grade' }, count: { $sum: 1 } } },
  { $sort: { average: -1 } },
])`,
}
