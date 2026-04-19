import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SessionSummary } from "../types"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

interface SessionSidebarProps {
  onSelectSession: (id: string) => void
  currentSessionId: string | null
}

// language emoji map - makes sidebar look nicer
const langEmoji: Record<string, string> = {
  javascript: "🟨",
  typescript: "🔷",
  python: "🐍",
  java: "☕",
  go: "🐹",
  rust: "🦀",
  cpp: "⚙️",
  c: "⚙️",
  default: "📄",
}

function getLangEmoji(lang: string): string {
  return langEmoji[lang.toLowerCase()] || langEmoji.default
}

export default function SessionSidebar({ onSelectSession, currentSessionId }: SessionSidebarProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>([])

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/sessions`)
      const data = await res.json()
      setSessions(data)
    } catch {
      console.error("Failed to fetch sessions")
    }
  }

  useEffect(() => {
    fetchSessions()
    // refresh every 5 seconds to pick up new sessions
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await fetch(`${API_URL}/sessions/${id}`, { method: "DELETE" })
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      console.error("Failed to delete session")
    }
  }

  return (
    <div className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="px-4 py-4 border-b border-slate-800">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          History
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {sessions.length === 0 ? (
            <p className="text-xs text-slate-600 px-4 py-6 text-center">
              No reviews yet
            </p>
          ) : (
            sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => onSelectSession(session.id)}
                className={`group flex items-center justify-between px-3 py-3 cursor-pointer border-b border-slate-800/50 hover:bg-slate-800 transition-colors ${
                  currentSessionId === session.id ? "bg-slate-800" : ""
                }`}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm text-slate-300 truncate">
                    {getLangEmoji(session.language)} {session.language}
                  </span>
                  <span className="text-xs text-slate-600">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                  {session.score !== null && (
                    <span
                      className={`text-xs font-medium ${
                        session.score >= 80
                          ? "text-green-400"
                          : session.score >= 60
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      Score: {session.score}
                    </span>
                  )}
                </div>

                {/* delete button - shows on hover */}
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all ml-2 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
