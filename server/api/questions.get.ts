import fs from 'fs'
import path from 'path'

export default defineEventHandler(async () => {
  const dataDir = 'https://api.xunun.cn/'
  const filePath = path.join(dataDir, 'questions.json')
  const data = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(data)
})