import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import CodeEditor from "./components/CodeEditor"
import ReviewPanel from "./components/ReviewPanel"
import SessionSidebar from "./components/SessionSidebar"
import StatusIndicator from "./components/StatusIndicator"
import { useWebSocket } from "./hooks/useWebSocket"
import { FullSession, ReviewResult } from "./types"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

const DEFAULT_CODE = `// paste your code here or start typing
function calculateTotal(items) {
  let total = 0
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price
  }
  return total
}

const password = "admin123"
const apiKey = "sk-abc123secretkey"

module.exports = { calculateTotal }
`

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState("javascript")
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  // past review loaded from sidebar (separate from live ws review)
  const [pastReview, setPastReview] = useState<ReviewResult | null>(null)

  const {
    sessionId,
    isReviewing,
    review: liveReview,
    streamingChunks,
    error,
    requestReview,
    reset,
  } = useWebSocket()

  // live review takes priority over past review
  const activeReview = liveReview || pastReview

  // when user clicks review button - clear past and start fresh
  const handleReview = useCallback(() => {
    if (!code.trim()) return
    setPastReview(null)
    reset()
    requestReview(code, language)
  }, [code, language, requestReview, reset])

  // when user clicks a past session in sidebar
  const handleSelectSession = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/sessions/${id}`)
      if (!res.ok) return

      const data: FullSession = await res.json()

      // load old code and language into editor
      setCode(data.code)
      setLanguage(data.language)
      setActiveSessionId(id)

      // clear live review state and show past review
      reset()
      setPastReview(data.review)
    } catch {
      console.error("Failed to load session")
    }
  }, [reset])

  // prefer live session id, fallback to sidebar selection
  const currentId = sessionId || activeSessionId

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-sm">
            🔍
          </div>
          <span className="font-semibold text-slate-100">AI Code Review Bot</span>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            Powered by Gemini
          </span>
        </div>

        {currentId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-slate-600 font-mono"
          >
            Session: {currentId.slice(0, 8)}...
          </motion.div>
        )}
      </motion.header>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* col 1 - history sidebar */}
        <SessionSidebar
          onSelectSession={handleSelectSession}
          currentSessionId={currentId}
        />

        {/* col 2 - monaco editor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 border-r border-slate-800 flex flex-col overflow-hidden"
        >
          <CodeEditor
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            onReview={handleReview}
            isReviewing={isReviewing}
          />
        </motion.div>

        {/* col 3 - review panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-80 flex flex-col overflow-hidden bg-slate-950"
        >
          <div className="px-3 pt-3">
            <AnimatePresence>
              {isReviewing && (
                <StatusIndicator
                  isReviewing={isReviewing}
                  streamingChunks={streamingChunks}
                />
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-3 mt-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-hidden">
            <ReviewPanel review={activeReview} isReviewing={isReviewing} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
