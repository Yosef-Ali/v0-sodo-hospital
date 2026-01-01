/**
 * OpenAI Chat Hook
 * Enhanced chat hook with OpenAI ChatKit integration
 * Implements context-aware sessions, co-pilot features, and human-in-the-loop
 */

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import type { Message } from "@/lib/chat-context"
import type { AIMessage, ToolApproval, ChatErrorCode } from "@/lib/openai/types"
import {
  initializeChatSession,
  sendChatMessage,
  approveToolAction,
  rejectToolAction,
  updateCopilotContext,
  endChatSession,
} from "@/lib/actions/v2/chat"

interface OpenAIChatState {
  messages: Message[]
  isTyping: boolean
  isOpen: boolean
  sessionId: string | null
  threadId: string | null
  pendingApproval: ToolApproval | null
}

interface UseOpenAIChatOptions {
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
  enableCopilot?: boolean
}

function getFriendlyErrorMessage(
  errorCode?: ChatErrorCode,
  fallback?: string
): string {
  switch (errorCode) {
    case "guardrail_blocked":
      return "I can’t process that request because it may violate safety policies. Please rephrase without sensitive or personal information."
    case "thread_creation_failed":
      return "I couldn’t start a new support session. Please wait a moment and try again."
    case "add_message_failed":
      return "I had trouble sending your message to the assistant. Please try again."
    case "assistant_run_failed":
      return "The AI assistant couldn’t complete your request. You can retry or contact support if the problem continues."
    case "openai_unavailable":
      return "Our AI service is temporarily unavailable. Please try again shortly or contact support."
    default:
      return fallback || "I encountered an unexpected error. Please try again."
  }
}

export function useOpenAIChat(options: UseOpenAIChatOptions = {}) {
  const pathname = usePathname()
  const [state, setState] = useState<OpenAIChatState>({
    messages: [],
    isTyping: false,
    isOpen: false,
    sessionId: null,
    threadId: null,
    pendingApproval: null,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initializingRef = useRef(false)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  // Initialize session when chat opens
  const initializeSession = useCallback(async () => {
    if (initializingRef.current || state.sessionId) return

    initializingRef.current = true

    try {
      const { sessionId, threadId } = await initializeChatSession(
        options.userId,
        options.userName,
        options.userEmail,
        options.userRole,
        pathname
      )

      setState(prev => ({
        ...prev,
        sessionId,
        threadId,
      }))

      // Add welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: `👋 Hello${options.userName ? ` ${options.userName}` : ""}! I'm your SODDO Hospital support assistant.

I can help you with:
✅ Check permit/document status
✅ Upload document guidance
✅ Track application progress
✅ View process timeline

For personal inquiries, I'll need your permit/ticket number to ensure security.

How can I assist you today?`,
        timestamp: new Date(),
        metadata: {
          suggestions: [
            "Check my permit status",
            "How do I upload documents?",
            "What's the timeline?",
            "WRK-2024-5678",
          ],
        },
      }

      setState(prev => ({
        ...prev,
        messages: [welcomeMessage],
      }))
    } catch (error) {
      console.error("Error initializing session:", error)
    } finally {
      initializingRef.current = false
    }
  }, [options.userId, options.userName, options.userEmail, options.userRole, pathname, state.sessionId])

  // Toggle chat open/close
  const toggleChat = useCallback(() => {
    setState(prev => {
      const newIsOpen = !prev.isOpen
      if (newIsOpen && !prev.sessionId) {
        // Initialize session when opening
        setTimeout(() => initializeSession(), 0)
      }
      return { ...prev, isOpen: newIsOpen }
    })
  }, [initializeSession])

  const closeChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Send message to OpenAI
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !state.sessionId) {
        if (!state.sessionId) {
          await initializeSession()
        }
        return
      }

      // Add user message
      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isTyping: true,
      }))

      try {
        // Send to OpenAI
        const response = await sendChatMessage(state.sessionId, content.trim(), pathname)

        setState(prev => ({ ...prev, isTyping: false }))

        if (response.status === "error") {
          // Add error message
          const errorMessage: Message = {
            id: `msg-${Date.now()}-error`,
            role: "assistant",
            content: getFriendlyErrorMessage(
              response.errorCode as ChatErrorCode,
              response.message?.content
            ),
            timestamp: new Date(),
          }
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, errorMessage],
          }))
          return
        }

        if (response.status === "pending_approval") {
          // Handle approval required
          const approvalMessage: Message = {
            id: response.message.id,
            role: "assistant",
            content: response.message.content,
            timestamp: new Date(),
            widgets: [
              {
                type: "approval-widget",
                data: {
                  approval: response.requiresApproval,
                },
              },
            ],
          }
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, approvalMessage],
            pendingApproval: response.requiresApproval || null,
          }))
          return
        }

        // Add AI response with streaming simulation
        const aiMessage = response.message as AIMessage
        const assistantMessage: Message = {
          id: aiMessage.id,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
          widgets: aiMessage.widgets || [],
          metadata: {
            intent: aiMessage.intent,
            confidence: aiMessage.confidence,
            agentType: aiMessage.agentType,
          },
        }

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }))

        // Simulate streaming
        const words = aiMessage.content.split(" ")
        for (let i = 0; i < words.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 30))
          setState(prev => {
            const updatedMessages = [...prev.messages]
            const lastMessage = updatedMessages[updatedMessages.length - 1]
            if (lastMessage.id === aiMessage.id) {
              lastMessage.content = words.slice(0, i + 1).join(" ")
              if (i === words.length - 1) {
                lastMessage.isStreaming = false
              }
            }
            return { ...prev, messages: updatedMessages }
          })
        }
      } catch (error) {
        console.error("Error sending message:", error)
        setState(prev => ({
          ...prev,
          isTyping: false,
        }))

        const errorMessage: Message = {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date(),
        }
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
        }))
      }
    },
    [state.sessionId, pathname, initializeSession]
  )

  // Handle tool approval
  const handleApproval = useCallback(
    async (approvalId: string, approved: boolean) => {
      if (!state.sessionId || !state.threadId || !state.pendingApproval) return

      try {
        const action = approved ? approveToolAction : rejectToolAction
        const result = await action(
          state.sessionId,
          state.threadId,
          state.pendingApproval.id,
          approvalId
        )

        // Add result message
        const resultMessage: Message = {
          id: `msg-${Date.now()}-approval-result`,
          role: "assistant",
          content: result.message || (approved ? "Action approved and executed." : "Action rejected."),
          timestamp: new Date(),
        }

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, resultMessage],
          pendingApproval: null,
        }))
      } catch (error) {
        console.error("Error handling approval:", error)
      }
    },
    [state.sessionId, state.threadId, state.pendingApproval]
  )

  // Update copilot context
  const updateCopilot = useCallback(
    async (updates: {
      recentDocumentId?: string
      recentTaskId?: string
      searchQuery?: string
      filters?: Record<string, any>
    }) => {
      if (!state.sessionId || !options.enableCopilot) return

      try {
        await updateCopilotContext(state.sessionId, updates)
      } catch (error) {
        console.error("Error updating copilot context:", error)
      }
    },
    [state.sessionId, options.enableCopilot]
  )

  // Clear messages
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id === "welcome"),
    }))
  }, [])

  // End session
  const endSession = useCallback(async () => {
    if (state.sessionId) {
      try {
        await endChatSession(state.sessionId)
      } catch (error) {
        console.error("Error ending session:", error)
      }
    }

    setState({
      messages: [],
      isTyping: false,
      isOpen: false,
      sessionId: null,
      threadId: null,
      pendingApproval: null,
    })
    initializingRef.current = false
  }, [state.sessionId])

  // Update page context when pathname changes
  useEffect(() => {
    if (state.sessionId && options.enableCopilot) {
      // Context will be updated automatically on next message
    }
  }, [pathname, state.sessionId, options.enableCopilot])

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    isOpen: state.isOpen,
    sessionId: state.sessionId,
    threadId: state.threadId,
    pendingApproval: state.pendingApproval,
    toggleChat,
    closeChat,
    sendMessage,
    clearMessages,
    handleApproval,
    updateCopilot,
    endSession,
    messagesEndRef,
  }
}
