import Database from 'better-sqlite3'

const db = new Database('database.sqlite')

// 初始化数据库
db.exec(`
  CREATE TABLE IF NOT EXISTS pageviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

export default db