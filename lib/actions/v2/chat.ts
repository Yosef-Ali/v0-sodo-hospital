/**
 * Chat Server Actions
 * Secure server-side actions for OpenAI ChatKit integration
 */

"use server"

import { getOpenAIService } from "@/lib/openai/service"
import { getSessionManager, generateSessionId, extractPageContext } from "@/lib/openai/session-manager"
import { SessionContext, ChatResponse, AIMessage } from "@/lib/openai/types"

/**
 * Initialize a chat session
 */
export async function initializeChatSession(
  userId?: string,
  userName?: string,
  userEmail?: string,
  userRole?: string,
  currentPage: string = "/"
): Promise<{ sessionId: string; threadId: string }> {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
      console.warn("OpenAI API key not configured. Running in demo mode.")
      const sessionId = generateSessionId()
      return { sessionId, threadId: "demo-thread" }
    }

    const sessionManager = getSessionManager()
    const openAIService = getOpenAIService()

    // Generate session ID
    const sessionId = generateSessionId()

    // Extract page context
    const pageContext = extractPageContext(currentPage)

    // Create session context
    const context: SessionContext = {
      userId,
      userName,
      userEmail,
      userRole,
      currentPage,
      pageContext,
      sessionId,
      timestamp: new Date(),
    }

    // Create OpenAI thread
    const threadId = await openAIService.createThread(context)

    // Initialize session
    sessionManager.createSession(sessionId, context, threadId)

    return { sessionId, threadId }
  } catch (error) {
    console.error("Error initializing chat session:", error)
    throw new Error("Failed to initialize chat session")
  }
}

/**
 * Send a message to the AI
 */
export async function sendChatMessage(
  sessionId: string,
  message: string,
  currentPage?: string
): Promise<ChatResponse> {
  try {
    // Demo mode response if OpenAI is not configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
      const demoResponses = [
        "Thank you for your message! This is a demo mode response since OpenAI is not configured. To enable full AI capabilities, please add your OPENAI_API_KEY to the .env.local file.",
        "I'm currently running in demo mode. The full AI-powered chat requires an OpenAI API key to be configured.",
        "Demo mode is active. For intelligent responses, please configure the OpenAI integration by following the setup guide in OPENAI_CHATKIT_SETUP.md.",
      ]

      const response: ChatResponse = {
        message: {
          id: `demo_${Date.now()}`,
          role: "assistant",
          content: demoResponses[Math.floor(Math.random() * demoResponses.length)],
          timestamp: new Date(),
          intent: "general_inquiry",
          confidence: 1,
          agentType: "generalSupport",
        },
        status: "success",
      }

      return response
    }

    const sessionManager = getSessionManager()
    const openAIService = getOpenAIService()

    // Get or create session
    let session = sessionManager.getSession(sessionId)
    if (!session) {
      // Create new session if not found
      const pageContext = extractPageContext(currentPage || "/")
      const context: SessionContext = {
        currentPage: currentPage || "/",
        pageContext,
        sessionId,
        timestamp: new Date(),
      }
      const threadId = await openAIService.createThread(context)
      session = sessionManager.createSession(sessionId, context, threadId)
    }

    // Update context if page changed
    if (currentPage && currentPage !== session.context.currentPage) {
      const pageContext = extractPageContext(currentPage)
      sessionManager.updateContext(sessionId, {
        currentPage,
        pageContext,
      })
      session = sessionManager.getSession(sessionId)!
    }

    // Get enriched context with copilot state
    const enrichedContext = sessionManager.getEnrichedContext(sessionId)!

    // Process message through OpenAI
    const response = await openAIService.processMessage(
      message,
      enrichedContext,
      session.threadId
    )

    // Update conversation summary for future context
    if (response.status === "success") {
      const summary = `User asked: "${message.substring(0, 100)}...". AI responded with ${response.message.intent || "general"} intent.`
      sessionManager.updateConversationSummary(sessionId, summary)
    }

    return response
  } catch (error) {
    console.error("Error sending chat message:", error)
    return {
      message: {
        id: `error_${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error processing your message. Please try again.",
        timestamp: new Date(),
      },
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Approve a tool action
 */
export async function approveToolAction(
  sessionId: string,
  threadId: string,
  runId: string,
  toolCallId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const openAIService = getOpenAIService()
    await openAIService.submitToolApproval(threadId, runId, toolCallId, true)

    return {
      success: true,
      message: "Action approved and executed successfully",
    }
  } catch (error) {
    console.error("Error approving tool action:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to approve action",
    }
  }
}

/**
 * Reject a tool action
 */
export async function rejectToolAction(
  sessionId: string,
  threadId: string,
  runId: string,
  toolCallId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const openAIService = getOpenAIService()
    await openAIService.submitToolApproval(threadId, runId, toolCallId, false)

    return {
      success: true,
      message: "Action rejected successfully",
    }
  } catch (error) {
    console.error("Error rejecting tool action:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reject action",
    }
  }
}

/**
 * Update copilot state from user actions
 */
export async function updateCopilotContext(
  sessionId: string,
  updates: {
    recentDocumentId?: string
    recentTaskId?: string
    searchQuery?: string
    filters?: Record<string, any>
  }
): Promise<{ success: boolean }> {
  try {
    const sessionManager = getSessionManager()

    if (updates.recentDocumentId) {
      sessionManager.addRecentDocument(sessionId, updates.recentDocumentId)
    }

    if (updates.recentTaskId) {
      sessionManager.addRecentTask(sessionId, updates.recentTaskId)
    }

    if (updates.searchQuery) {
      sessionManager.addRecentSearch(sessionId, updates.searchQuery)
    }

    if (updates.filters) {
      sessionManager.updateFilters(sessionId, updates.filters)
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating copilot context:", error)
    return { success: false }
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(): Promise<{
  activeSessions: number
}> {
  try {
    const sessionManager = getSessionManager()
    return {
      activeSessions: sessionManager.getActiveSessionsCount(),
    }
  } catch (error) {
    console.error("Error getting session stats:", error)
    return { activeSessions: 0 }
  }
}

/**
 * End a chat session
 */
export async function endChatSession(sessionId: string): Promise<{ success: boolean }> {
  try {
    const sessionManager = getSessionManager()
    sessionManager.deleteSession(sessionId)
    return { success: true }
  } catch (error) {
    console.error("Error ending chat session:", error)
    return { success: false }
  }
}
