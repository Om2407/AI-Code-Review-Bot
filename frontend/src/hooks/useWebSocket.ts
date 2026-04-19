import { useRef, useState, useCallback } from "react"
import { WSMessage, ReviewResult } from "../types"

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001"

interface UseWebSocketReturn {
  sessionId: string | null
  isConnected: boolean
  isReviewing: boolean
  review: ReviewResult | null
  streamingChunks: string
  error: string | null
  requestReview: (code: string, language: string) => void
  reset: () => void
}

export function useWebSocket(): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [review, setReview] = useState<ReviewResult | null>(null)
  const [streamingChunks, setStreamingChunks] = useState("")
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setReview(null)
    setStreamingChunks("")
    setError(null)
    setIsReviewing(false)
  }, [])

  const requestReview = useCallback((code: string, language: string) => {
    reset()
    setIsReviewing(true)

    // close old connection
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      // don't send yet — wait for session_assigned
    }

    ws.onmessage = (event) => {
      let msg: WSMessage
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }

      switch (msg.type) {
        case "session_assigned":
          setSessionId(msg.sessionId)
          // NOW send the review request after session is ready
          ws.send(JSON.stringify({
            type: "review_request",
            code,
            language,
          }))
          break

        case "review_chunk":
          setStreamingChunks((prev) => prev + msg.chunk)
          break

        case "review_done":
          setReview(msg.review)
          setIsReviewing(false)
          setStreamingChunks("")
          break

        case "error":
          setError(msg.message)
          setIsReviewing(false)
          break
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    ws.onerror = () => {
      setError("Connection failed. Make sure backend is running.")
      setIsReviewing(false)
    }
  }, [reset])

  return {
    sessionId,
    isConnected,
    isReviewing,
    review,
    streamingChunks,
    error,
    requestReview,
    reset,
  }
}