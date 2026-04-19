import { Router, Request, Response } from "express"
import { getAllSessions, getSessionById, deleteSession } from "../db/database"

const router = Router()

// GET /sessions - returns all past sessions for the sidebar
router.get("/", (_req: Request, res: Response) => {
  try {
    const sessions = getAllSessions()
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" })
  }
})

// GET /sessions/:id - returns one session with full review
router.get("/:id", (req: Request, res: Response) => {
  try {
    const session = getSessionById(req.params.id)
    if (!session) {
      res.status(404).json({ error: "Session not found" })
      return
    }
    res.json(session)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch session" })
  }
})

// DELETE /sessions/:id - delete a session from history
router.delete("/:id", (req: Request, res: Response) => {
  try {
    deleteSession(req.params.id)
    res.json({ message: "Session deleted" })
  } catch (err) {
    res.status(500).json({ error: "Failed to delete session" })
  }
})

export default router
