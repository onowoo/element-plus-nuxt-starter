import db from '../db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const course = query.course as string

  if (!course) {
    return { rank: [], error: '缺少课程参数' }
  }
  // 只查当天
  const today = new Date().toISOString().slice(0, 10)
  const stmt = db.prepare(
    'SELECT name, score FROM students WHERE course = ? AND DATE(created_at) = ? ORDER BY score DESC, created_at ASC'
  )
  const rank = stmt.all(course, today)
  // 添加序号
  const rankWithIndex = rank.map((item, idx) => ({
    index: idx + 1,
    ...item as {
      name: string
      score: number
    }
  }))
  return { rank: rankWithIndex }
})