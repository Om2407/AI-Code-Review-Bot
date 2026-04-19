import { motion } from "framer-motion"

interface ScoreRingProps {
  score: number
}

// color changes based on score range
function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e" // green
  if (score >= 60) return "#f59e0b" // yellow
  return "#ef4444" // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Great"
  if (score >= 60) return "Average"
  return "Needs Work"
}

export default function ScoreRing({ score }: ScoreRingProps) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* background ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          {/* animated score ring */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        {/* score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>

      <motion.span
        className="text-sm font-medium"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {getScoreLabel(score)}
      </motion.span>
    </div>
  )
}
