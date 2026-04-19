// shared types between frontend components

export interface BugIssue {
  line: number
  issue: string
  severity: "high" | "medium" | "low"
}

export interface StyleIssue {
  line: number
  issue: string
}

export interface SecurityIssue {
  line: number
  issue: string
  severity: "critical" | "high" | "medium"
}

export interface ReviewResult {
  bugs: BugIssue[]
  style: StyleIssue[]
  security: SecurityIssue[]
  summary: string
  score: number
}

// websocket message types from backend
export type WSMessage =
  | { type: "session_assigned"; sessionId: string }
  | { type: "review_chunk"; chunk: string }
  | { type: "review_done"; review: ReviewResult }
  | { type: "error"; message: string }

export interface SessionSummary {
  id: string
  language: string
  created_at: string
  score: number | null
}

export interface FullSession {
  id: string
  language: string
  code: string
  created_at: string
  review: ReviewResult | null
}
