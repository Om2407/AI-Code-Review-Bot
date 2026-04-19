import express from "express"
import cors from "cors"
import { createServer } from "http"
import { WebSocketServer } from "ws"
import dotenv from "dotenv"
import { initDB } from "./db/database"
import sessionsRouter from "./routes/sessions"
import { handleWebSocketConnection } from "./ws/handler"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// REST routes for session history
app.use("/sessions", sessionsRouter)

app.get("/health", (_req, res) => {
  res.json({ status: "Backend is running" })
})

// create http server so we can attach websocket to same port
const server = createServer(app)

// websocket server - this is where the magic happens
const wss = new WebSocketServer({ server })

wss.on("connection", (ws) => {
  handleWebSocketConnection(ws)
})

// init db tables then start server
initDB()

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`WebSocket ready on ws://localhost:${PORT}`)
})
