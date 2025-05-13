import db from '../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, score, course } = body
  const today = new Date().toISOString().slice(0, 10)

  // 查询当天是否有同名同课程记录
  const exist = db.prepare(
    'SELECT * FROM students WHERE name=? AND course=? AND DATE(created_at)=?'
  ).get(name, course, today) as { id: number, score: number } | undefined

  if (exist) {
    if (score > exist.score) {
      db.prepare(
        'UPDATE students SET score=?, created_at=CURRENT_TIMESTAMP WHERE id=?'
      ).run(score, exist.id)
    }
    // 如果分数不高于原分数，不做任何操作
  } else {
    db.prepare(
      'INSERT INTO students (name, score, course) VALUES (?, ?, ?)'
    ).run(name, score, course)
  }

  return { success: true }
})