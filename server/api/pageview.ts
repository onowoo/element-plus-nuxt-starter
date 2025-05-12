import db from '../db'

const startAt = Date.now()
let count = 0

export default defineEventHandler(() => {
  // 记录每次访问
  db.prepare('INSERT INTO pageviews DEFAULT VALUES').run()
  
  // 获取总访问量
// 由于对象类型为 unknown，需要进行类型断言
const result = db.prepare('SELECT COUNT(*) as count FROM pageviews').get();
const totalViews = (result as { count: number }).count;
  
  return {
    pageview: count++,
    startAt,
    totalViews
  }
})
