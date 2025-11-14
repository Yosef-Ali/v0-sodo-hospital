/**
 * Session Manager
 * Manages context-aware sessions with state persistence
 * Enables co-pilot features with cross-page context sharing
 */

import { SessionContext, CopilotState } from "./types"

interface SessionData {
  context: SessionContext
  copilotState: CopilotState
  threadId?: string
  createdAt: Date
  lastActivity: Date
}

/**
 * Session Manager for AI chat sessions
 * Implements context-aware state management and co-pilot features
 */
export class SessionManager {
  private sessions: Map<string, SessionData> = new Map()
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  /**
   * Create or update a session
   */
  createSession(sessionId: string, context: SessionContext, threadId?: string): SessionData {
    const existingSession = this.sessions.get(sessionId)

    const sessionData: SessionData = {
      context: {
        ...context,
        sessionId,
        timestamp: new Date(),
      },
      copilotState: existingSession?.copilotState || {},
      threadId: threadId || existingSession?.threadId,
      createdAt: existingSession?.createdAt || new Date(),
      lastActivity: new Date(),
    }

    this.sessions.set(sessionId, sessionData)
    return sessionData
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return null
    }

    // Check if session expired
    if (Date.now() - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
      this.sessions.delete(sessionId)
      return null
    }

    // Update last activity
    session.lastActivity = new Date()
    return session
  }

  /**
   * Update session context (e.g., when user navigates to new page)
   */
  updateContext(sessionId: string, context: Partial<SessionContext>): void {
    const session = this.getSession(sessionId)
    if (!session) {
      return
    }

    session.context = {
      ...session.context,
      ...context,
      timestamp: new Date(),
    }
    session.lastActivity = new Date()
    this.sessions.set(sessionId, session)
  }

  /**
   * Update co-pilot state (cross-page context sharing)
   */
  updateCopilotState(sessionId: string, state: Partial<CopilotState>): void {
    const session = this.getSession(sessionId)
    if (!session) {
      return
    }

    session.copilotState = {
      ...session.copilotState,
      ...state,
    }
    session.lastActivity = new Date()
    this.sessions.set(sessionId, session)
  }

  /**
   * Add recent document to co-pilot state
   */
  addRecentDocument(sessionId: string, documentId: string): void {
    const session = this.getSession(sessionId)
    if (!session) {
      return
    }

    const recentDocuments = session.copilotState.recentDocuments || []
    const updated = [documentId, ...recentDocuments.filter(id => id !== documentId)].slice(0, 10)

    this.updateCopilotState(sessionId, {
      recentDocuments: updated,
    })
  }

  /**
   * Add recent task to co-pilot state
   */
  addRecentTask(sessionId: string, taskId: string): void {
    const session = this.getSession(sessionId)
    if (!session) {
      return
    }

    const recentTasks = session.copilotState.recentTasks || []
    const updated = [taskId, ...recentTasks.filter(id => id !== taskId)].slice(0, 10)

    this.updateCopilotState(sessionId, {
      recentTasks: updated,
    })
  }

  /**
   * Add search query to co-pilot state
   */
  addRecentSearch(sessionId: string, searchQuery: string): void {
    const session = this.getSession(sessionId)
    if (!session) {
      return
    }

    const recentSearches = session.copilotState.recentSearches || []
    const updated = [searchQuery, ...recentSearches.filter(q => q !== searchQuery)].slice(0, 10)

    this.updateCopilotState(sessionId, {
      recentSearches: updated,
    })
  }

  /**
   * Update current filters (for context-aware suggestions)
   */
  updateFilters(sessionId: string, filters: Record<string, any>): void {
    this.updateCopilotState(sessionId, {
      currentFilters: filters,
    })
  }

  /**
   * Update conversation summary (for context retention)
   */
  updateConversationSummary(sessionId: string, summary: string): void {
    this.updateCopilotState(sessionId, {
      conversationSummary: summary,
    })
  }

  /**
   * Get enriched context with co-pilot state
   */
  getEnrichedContext(sessionId: string): SessionContext | null {
    const session = this.getSession(sessionId)
    if (!session) {
      return null
    }

    return {
      ...session.context,
      pageContext: {
        ...session.context.pageContext,
        copilotState: session.copilotState,
      },
    }
  }

  /**
   * Set thread ID for session
   */
  setThreadId(sessionId: string, threadId: string): void {
    const session = this.getSession(sessionId)
    if (!session) {
      return
    }

    session.threadId = threadId
    this.sessions.set(sessionId, session)
  }

  /**
   * Get thread ID for session
   */
  getThreadId(sessionId: string): string | null {
    const session = this.getSession(sessionId)
    return session?.threadId || null
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = Date.now()
    const expiredSessions: string[] = []

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId)
      }
    }

    expiredSessions.forEach(sessionId => this.sessions.delete(sessionId))
  }

  /**
   * Get all active sessions count
   */
  getActiveSessionsCount(): number {
    this.cleanupExpiredSessions()
    return this.sessions.size
  }
}

// Singleton instance
let sessionManagerInstance: SessionManager | null = null

export function getSessionManager(): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager()

    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      sessionManagerInstance?.cleanupExpiredSessions()
    }, 5 * 60 * 1000)
  }

  return sessionManagerInstance
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Extract page context from URL
 */
export function extractPageContext(pathname: string, searchParams?: URLSearchParams): Record<string, any> {
  const context: Record<string, any> = {
    pathname,
  }

  // Extract context based on route
  if (pathname.includes("/documents")) {
    context.section = "documents"
    context.feature = "document_management"
  } else if (pathname.includes("/permits")) {
    context.section = "permits"
    context.feature = "permit_tracking"
  } else if (pathname.includes("/tasks")) {
    context.section = "tasks"
    context.feature = "task_management"
  } else if (pathname.includes("/dashboard")) {
    context.section = "dashboard"
    context.feature = "overview"
  } else if (pathname === "/") {
    context.section = "landing"
    context.feature = "marketing"
  }

  // Extract search params
  if (searchParams) {
    context.searchParams = Object.fromEntries(searchParams.entries())
  }

  return context
}
