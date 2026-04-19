import Editor from "@monaco-editor/react"
import { motion } from "framer-motion"

// supported languages for the dropdown
const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
]

interface CodeEditorProps {
  code: string
  language: string
  onCodeChange: (value: string) => void
  onLanguageChange: (lang: string) => void
  onReview: () => void
  isReviewing: boolean
}

export default function CodeEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onReview,
  isReviewing,
}: CodeEditorProps) {
  const selectedLang = LANGUAGES.find((l) => l.value === language)

  return (
    <div className="flex flex-col h-full">
      {/* toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {/* language selector */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-slate-800 text-slate-300 text-sm px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* detected language badge */}
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
            {selectedLang?.label || language}
          </span>
        </div>

        {/* review button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReview}
          disabled={isReviewing || !code.trim()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {isReviewing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Reviewing...
            </>
          ) : (
            <>▶ Review Code</>
          )}
        </motion.button>
      </div>

      {/* monaco editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => onCodeChange(val || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            lineNumbers: "on",
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  )
}
