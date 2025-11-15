/**
 * Chat Server Actions
 * Secure server-side actions for OpenAI ChatKit integration
 */

"use server"

import { getOpenAIService } from "@/lib/openai/service"
import { getSessionManager, generateSessionId, extractPageContext } from "@/lib/openai/session-manager"
import { SessionContext, ChatResponse, AIMessage } from "@/lib/openai/types"

/**
 * Smart demo response function that returns widgets based on user queries
 */
function getDemoResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase()

  // Simulate verified ticket first (when user enters a ticket-like pattern)
  const ticketPattern = /[A-Z]{3}-\d{4}-\d{4}/
  const ticketMatch = message.toUpperCase().match(ticketPattern)

  if (ticketMatch) {
    const ticketNumber = ticketMatch[0]  // Extract just the ticket number (e.g., "WRK-2025-0001")

    const showUploadGuide =
      lowerMessage.includes("upload") ||
      lowerMessage.includes("document") ||
      lowerMessage.includes("missing")

    const showTimeline =
      lowerMessage.includes("timeline") ||
      lowerMessage.includes("how long") ||
      lowerMessage.includes("process")

    const widgets: any[] = [
      {
        type: "permit-status",
        data: {
          ticketNumber: ticketNumber,
          personName: "John Smith",
          status: "processing",
          type: "Work Permit Application",
          submittedDate: "Jan 15, 2025",
          lastUpdated: "Jan 18, 2025",
          currentStage: "Document Review - Medical Clearance",
          nextAction: "Please upload your health insurance certificate",
          estimatedCompletion: "Jan 25, 2025",
          notes: "Your passport and employment contract have been verified. Awaiting medical documents.",
          documentLinks: [
            {
              name: "Application Receipt.pdf",
              url: "#"
            },
            {
              name: "Requirements Checklist.pdf",
              url: "#"
            }
          ]
        }
      },
    ]

    if (showTimeline) {
      widgets.push({
        type: "process-timeline",
        data: {
          estimatedTotal: "10-14 days",
          stages: [
            {
              name: "Application Submission",
              status: "completed",
              date: "Jan 15, 2025",
              description: "Application received and validated",
              duration: "1 day"
            },
            {
              name: "Document Verification",
              status: "completed",
              date: "Jan 17, 2025",
              description: "Passport and employment contract verified",
              duration: "2 days"
            },
            {
              name: "Medical Review",
              status: "current",
              description: "Health certificate under review",
              duration: "2-3 days"
            },
            {
              name: "Background Check",
              status: "pending",
              description: "Security and criminal record verification",
              duration: "3-5 days"
            },
            {
              name: "Final Approval",
              status: "pending",
              description: "Management approval and permit issuance",
              duration: "2 days"
            },
            {
              name: "Permit Ready",
              status: "pending",
              description: "Permit available for collection or delivery",
              duration: "1 day"
            }
          ]
        }
      })
    }

    if (showUploadGuide) {
      widgets.push({
        type: "upload-guide",
        data: {
          documentType: "Health Insurance Certificate",
          ticketNumber: ticketNumber,
          currentStep: 1,
          requirements: [
            "Valid health insurance certificate (PDF or JPG)",
            "Certificate must be in English or Amharic",
            "File size under 5MB",
            "Must be dated within last 3 months"
          ],
          steps: [
            {
              title: "Prepare your document",
              description: "Scan or photograph your health certificate clearly",
              completed: true
            },
            {
              title: "Choose file to upload",
              description: "Click the button below to select your file",
              action: {
                label: "Select File"
              }
            },
            {
              title: "Verify upload",
              description: "Review the document preview before submitting",
              completed: false
            },
            {
              title: "Submit",
              description: "Confirm and submit your document for review",
              completed: false
            }
          ],
          tips: [
            "Ensure all text in the document is clearly readable",
            "Remove any passwords from PDF files before uploading",
            "You can upload multiple files if needed",
            "Processing typically takes 1-2 business days"
          ]
        }
      })
    }

    return {
      message: {
        id: `demo_${Date.now()}`,
        role: "assistant",
        content: showUploadGuide
          ? "Great! I found your Work Permit application. Here's the complete status, timeline, and upload guide:"
          : showTimeline
            ? "Great! I found your Work Permit application. Here is the latest status and timeline."
            : "Great! I found your Work Permit application. Here is the latest status.",
        timestamp: new Date(),
        intent: "document_query",
        confidence: 1,
        agentType: "documentSupport",
        widgets,
      },
      status: "success",
    }
  }

  // Check my permit status / track application
  if (
    lowerMessage.includes("status") ||
    lowerMessage.includes("check") ||
    lowerMessage.includes("track") ||
    lowerMessage.includes("where is my")
  ) {
    return {
      message: {
        id: `demo_${Date.now()}`,
        role: "assistant",
        content: "I'll help you check your permit status. For your security, I need to verify your identity first.",
        timestamp: new Date(),
        intent: "document_query",
        confidence: 0.95,
        agentType: "documentSupport",
        widgets: [
          {
            type: "ticket-verification",
            data: {
              placeholder: "e.g., PER-2024-1234 or WRK-2024-5678"
            }
          }
        ]
      },
      status: "success",
    }
  }

  // Upload documents / how to upload - Ask for ticket first
  if (
    lowerMessage.includes("upload") ||
    lowerMessage.includes("submit") ||
    lowerMessage.includes("documents") ||
    lowerMessage.includes("how do i")
  ) {
    return {
      message: {
        id: `demo_${Date.now()}`,
        role: "assistant",
        content: "I'll guide you through uploading your documents. For your security, I need to verify your identity first.",
        timestamp: new Date(),
        intent: "document_query",
        confidence: 0.92,
        agentType: "documentSupport",
        widgets: [
          {
            type: "ticket-verification",
            data: {
              placeholder: "e.g., PER-2024-1234 or WRK-2024-5678"
            }
          }
        ]
      },
      status: "success",
    }
  }

  // Timeline / how long / process - Ask for ticket first
  if (
    lowerMessage.includes("timeline") ||
    lowerMessage.includes("how long") ||
    lowerMessage.includes("process") ||
    lowerMessage.includes("take") ||
    lowerMessage.includes("stages")
  ) {
    return {
      message: {
        id: `demo_${Date.now()}`,
        role: "assistant",
        content: "I'll show you the complete timeline for your application. For your security, I need to verify your identity first.",
        timestamp: new Date(),
        intent: "workflow_help",
        confidence: 0.94,
        agentType: "documentSupport",
        widgets: [
          {
            type: "ticket-verification",
            data: {
              placeholder: "e.g., PER-2024-1234 or WRK-2024-5678"
            }
          }
        ]
      },
      status: "success",
    }
  }

  // Default helpful response
  return {
    message: {
      id: `demo_${Date.now()}`,
      role: "assistant",
      content: `I'm here to help you with your permit applications! I can assist with:

✅ Checking permit status
✅ Uploading documents
✅ Understanding the process timeline
✅ Answering questions about requirements

Try asking me:
• "Check my permit status"
• "How do I upload documents?"
• "What's the timeline?"
• Or enter your ticket number (e.g., WRK-2024-5678)`,
      timestamp: new Date(),
      intent: "general_inquiry",
      confidence: 1,
      agentType: "generalSupport",
    },
    status: "success",
  }
}

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
    // Check if OpenAI is fully configured (API key AND assistant IDs)
    const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ""
    const hasAssistantIds =
      process.env.OPENAI_ASSISTANT_ID_CLASSIFICATION &&
      process.env.OPENAI_ASSISTANT_ID_GENERAL_SUPPORT &&
      process.env.OPENAI_ASSISTANT_ID_DOCUMENT_SUPPORT &&
      process.env.OPENAI_ASSISTANT_ID_TECHNICAL_SUPPORT

    if (!hasApiKey || !hasAssistantIds) {
      console.warn("OpenAI not fully configured. Running in demo mode with beautiful widgets!")
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
    // Demo mode response if OpenAI is not fully configured
    // Check for API key AND assistant IDs
    const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ""
    const hasAssistantIds =
      process.env.OPENAI_ASSISTANT_ID_CLASSIFICATION &&
      process.env.OPENAI_ASSISTANT_ID_GENERAL_SUPPORT &&
      process.env.OPENAI_ASSISTANT_ID_DOCUMENT_SUPPORT &&
      process.env.OPENAI_ASSISTANT_ID_TECHNICAL_SUPPORT

    if (!hasApiKey || !hasAssistantIds) {
      return getDemoResponse(message)
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
      errorCode: "unknown",
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
