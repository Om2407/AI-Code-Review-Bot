import { motion, AnimatePresence } from "framer-motion"
import { ReviewResult } from "../types"
import ScoreRing from "./ScoreRing"

interface ReviewPanelProps {
  review: ReviewResult | null
  isReviewing: boolean
}

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

// card animation - staggers in one by one
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
}

export default function ReviewPanel({ review, isReviewing }: ReviewPanelProps) {
  if (!review && !isReviewing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
        <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">Paste code and click Review</p>
      </div>
    )
  }

  if (isReviewing && !review) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {/* skeleton loaders while streaming */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-slate-800 p-4 animate-pulse">
            <div className="h-3 bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-2 bg-slate-700 rounded w-full mb-2" />
            <div className="h-2 bg-slate-700 rounded w-4/5" />
          </div>
        ))}
      </div>
    )
  }

  if (!review) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4 p-4 overflow-y-auto h-full"
      >
        {/* score ring at top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center py-4"
        >
          <ScoreRing score={review.score} />
        </motion.div>

        {/* summary */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-lg bg-slate-800 border border-slate-700 p-4"
        >
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{review.summary}</p>
        </motion.div>

        {/* bugs section */}
        {review.bugs.length > 0 && (
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-lg bg-slate-800 border border-slate-700 p-4"
          >
            <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              🐛 Bugs <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs">{review.bugs.length}</span>
            </h3>
            <div className="flex flex-col gap-2">
              {review.bugs.map((bug, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Line {bug.line}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${severityColors[bug.severity]}`}>
                      {bug.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{bug.issue}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* style section */}
        {review.style.length > 0 && (
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-lg bg-slate-800 border border-slate-700 p-4"
          >
            <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              🎨 Style <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">{review.style.length}</span>
            </h3>
            <div className="flex flex-col gap-2">
              {review.style.map((s, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">Line {s.line}</span>
                  <p className="text-sm text-slate-300">{s.issue}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* security section */}
        {review.security.length > 0 && (
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-lg bg-slate-800 border border-red-900/30 p-4"
          >
            <h3 className="text-sm font-semibold text-red-300 mb-3 flex items-center gap-2">
              🔒 Security <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs">{review.security.length}</span>
            </h3>
            <div className="flex flex-col gap-2">
              {review.security.map((sec, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Line {sec.line}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${severityColors[sec.severity]}`}>
                      {sec.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{sec.issue}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* all clear message */}
        {review.bugs.length === 0 && review.style.length === 0 && review.security.length === 0 && (
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-center"
          >
            <p className="text-green-400 text-sm">✅ No issues found! Clean code.</p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
