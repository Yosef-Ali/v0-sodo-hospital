/**
 * OpenAI ChatKit Integration Types
 * Defines types for AI-powered customer support with context-aware sessions
 */

import { Message as BaseMessage } from "@/lib/chat-context"

export type AgentType =
  | "classification"
  | "general_support"
  | "document_support"
  | "technical_support"
  | "workflow_support"

export type IntentCategory =
  | "document_query"
  | "technical_issue"
  | "workflow_help"
  | "general_inquiry"
  | "navigation"
  | "unknown"

export interface SessionContext {
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
  currentPage: string
  pageContext?: Record<string, any>
  sessionId: string
  threadId?: string
  timestamp: Date
}

export interface CopilotState {
  recentDocuments?: string[]
  recentTasks?: string[]
  recentSearches?: string[]
  currentFilters?: Record<string, any>
  userPreferences?: Record<string, any>
  conversationSummary?: string
}

export interface ToolApproval {
  id: string
  toolName: string
  toolDescription: string
  parameters: Record<string, any>
  reasoning: string
  riskLevel: "low" | "medium" | "high"
  requiresConfirmation: boolean
  status: "pending" | "approved" | "rejected"
  timestamp: Date
}

export interface AIMessage extends BaseMessage {
  threadId?: string
  runId?: string
  agentType?: AgentType
  intent?: IntentCategory
  confidence?: number
  requiresApproval?: boolean
  approvalId?: string
  contextUsed?: Partial<SessionContext>
  tokensUsed?: number
}

export interface GuardrailResult {
  passed: boolean
  flagged: boolean
  reason?: string
  category?: "jailbreak" | "inappropriate" | "off_topic" | "sensitive"
  confidence: number
}

export interface ClassificationResult {
  intent: IntentCategory
  confidence: number
  suggestedAgent: AgentType
  reasoning: string
  requiresHumanReview: boolean
}

export type ChatErrorCode =
  | "guardrail_blocked"
  | "thread_creation_failed"
  | "add_message_failed"
  | "assistant_run_failed"
  | "openai_unavailable"
  | "unknown"

export interface OpenAIServiceConfig {
  apiKey: string
  assistantIds: {
    classification: string
    generalSupport: string
    documentSupport: string
    technicalSupport: string
  }
  model?: string
  classificationModel?: string
  temperature?: number
  maxTokens?: number
  enableHumanInLoop?: boolean
  enableGuardrails?: boolean
}

export interface StreamChunk {
  type: "text" | "widget" | "status" | "tool_call" | "error"
  content: string
  delta?: string
  widget?: any
  toolCall?: {
    id: string
    name: string
    arguments: Record<string, any>
  }
}

export interface ChatResponse {
  message: AIMessage
  requiresApproval?: ToolApproval
  suggestions?: string[]
  status: "success" | "error" | "pending_approval"
  error?: string
  errorCode?: ChatErrorCode
}
