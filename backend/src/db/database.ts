import Database from "better-sqlite3"
import path from "path"

// store db file in backend root
const DB_PATH = path.join(process.cwd(), "reviews.db")

const db = new Database(DB_PATH)

// run once on startup to create tables if they don't exist
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      review_json TEXT NOT NULL,
      score INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `)
  console.log("Database ready ✓")
}

// save a new session when review starts
export function saveSession(id: string, language: string, code: string) {
  const stmt = db.prepare(
    "INSERT INTO sessions (id, language, code) VALUES (?, ?, ?)"
  )
  stmt.run(id, language, code)
}

// save the completed review once streaming is done
export function saveReview(sessionId: string, review: object, score: number) {
  const stmt = db.prepare(
    "INSERT INTO reviews (session_id, review_json, score) VALUES (?, ?, ?)"
  )
  stmt.run(sessionId, JSON.stringify(review), score)
}

// get all sessions for the sidebar history
export function getAllSessions() {
  return db
    .prepare(
      `SELECT s.id, s.language, s.created_at, r.score
       FROM sessions s
       LEFT JOIN reviews r ON s.id = r.session_id
       ORDER BY s.created_at DESC`
    )
    .all()
}

// get one full session with its review
export function getSessionById(id: string) {
  const session = db
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .get(id)

  if (!session) return null

  const review = db
    .prepare("SELECT review_json FROM reviews WHERE session_id = ?")
    .get(id) as { review_json: string } | undefined

  return {
    ...session,
    review: review ? JSON.parse(review.review_json) : null,
  }
}

// delete a session and its review
export function deleteSession(id: string) {
  db.prepare("DELETE FROM reviews WHERE session_id = ?").run(id)
  db.prepare("DELETE FROM sessions WHERE id = ?").run(id)
}

export default db
