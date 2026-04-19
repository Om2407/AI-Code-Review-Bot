import { motion } from "framer-motion"

interface StatusIndicatorProps {
  isReviewing: boolean
  streamingChunks: string
}

export default function StatusIndicator({
  isReviewing,
  streamingChunks,
}: StatusIndicatorProps) {
  if (!isReviewing) return null

  // show how many chars streamed so user sees activity
  const charsReceived = streamingChunks.length

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"
    >
      {/* animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <span className="text-sm text-slate-300">
        Reviewing your code
        {charsReceived > 0 && (
          <span className="text-slate-500 ml-2">({charsReceived} chars received)</span>
        )}
      </span>
    </motion.div>
  )
}
