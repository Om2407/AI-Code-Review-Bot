import { WebSocket } from "ws"
import { v4 as uuidv4 } from "uuid"
import { saveSession, saveReview } from "../db/database"
import {
  IncomingReviewMessage,
  OutgoingMessage,
  ReviewResult,
} from "../types/index"

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000"

function sendMessage(ws: WebSocket, message: OutgoingMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

export async function handleWebSocketConnection(ws: WebSocket) {
  const sessionId = uuidv4()
  let sessionSaved = false

  console.log(`New session: ${sessionId}`)

  sendMessage(ws, { type: "session_assigned", sessionId })

  ws.on("message", async (rawData) => {
    const raw = rawData.toString()
    console.log(`[${sessionId.slice(0, 8)}] Message received:`, raw.slice(0, 100))

    let parsed: IncomingReviewMessage

    try {
      parsed = JSON.parse(raw)
    } catch {
      sendMessage(ws, { type: "error", message: "Invalid message format" })
      return
    }

    if (parsed.type !== "review_request") {
      sendMessage(ws, { type: "error", message: "Unknown message type" })
      return
    }

    const { code, language } = parsed
    console.log(`[${sessionId.slice(0, 8)}] Review request for: ${language}`)

    if (!sessionSaved) {
      try {
        saveSession(sessionId, language, code)
        sessionSaved = true
      } catch (err) {
        console.error("Failed to save session:", err)
      }
    }

    let response: Response

    try {
      response = await fetch(`${AI_SERVICE_URL}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      })
      console.log(`[${sessionId.slice(0, 8)}] AI response: ${response.status}`)
    } catch (err) {
      console.error("AI service error:", err)
      sendMessage(ws, {
        type: "error",
        message: "AI service is unavailable, please try again later",
      })
      return
    }

    if (!response.ok || !response.body) {
      sendMessage(ws, { type: "error", message: "AI service returned an error" })
      return
    }

    let fullResponse = ""

    try {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        console.log(`[${sessionId.slice(0, 8)}] Chunk:`, text.slice(0, 80))

        const lines = text.split("\n")
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()

          if (data === "[DONE]") {
            try {
              const review: ReviewResult = JSON.parse(fullResponse)
              saveReview(sessionId, review, review.score)
              sendMessage(ws, { type: "review_done", review })
              console.log(`[${sessionId.slice(0, 8)}] Done! Score: ${review.score}`)
            } catch (e) {
              console.error("Parse failed:", fullResponse.slice(0, 200))
              sendMessage(ws, { type: "error", message: "Failed to parse review response" })
            }
            return
          }

          if (data) {
            fullResponse += data
            sendMessage(ws, { type: "review_chunk", chunk: data })
          }
        }
      }
    } catch (err) {
      console.error("Stream error:", err)
      sendMessage(ws, { type: "error", message: "Connection interrupted" })
    }
  })

  ws.on("close", () => console.log(`Session closed: ${sessionId}`))
  ws.on("error", (err) => console.error(`WS error:`, err.message))
}