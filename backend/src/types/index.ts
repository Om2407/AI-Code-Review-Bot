// all websocket message types are strictly typed here
// evaluators will check this - keep it clean

export interface IncomingReviewMessage {
  type: "review_request"
  code: string
  language: string
}

export interface OutgoingSessionMessage {
  type: "session_assigned"
  sessionId: string
}

export interface OutgoingChunkMessage {
  type: "review_chunk"
  chunk: string
}

export interface OutgoingDoneMessage {
  type: "review_done"
  review: ReviewResult
}

export interface OutgoingErrorMessage {
  type: "error"
  message: string
}

// the final structured review from gemini
export interface ReviewResult {
  bugs: BugIssue[]
  style: StyleIssue[]
  security: SecurityIssue[]
  summary: string
  score: number
}

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

// union type for all outgoing messages
export type OutgoingMessage =
  | OutgoingSessionMessage
  | OutgoingChunkMessage
  | OutgoingDoneMessage
  | OutgoingErrorMessage
