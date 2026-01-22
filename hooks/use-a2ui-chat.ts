"use client"

/**
 * useA2UIChat - Hook for A2UI Chat with Gemini
 * Pure Google implementation using existing SODDO Hospital widgets
 */

import { useState, useCallback, useRef, useEffect } from "react"

interface A2UIWidget {
  widget: string
  props: Record<string, any>
}

interface A2UIChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  widgets?: A2UIWidget[]
  isStreaming?: boolean
}

interface A2UIChatState {
  messages: A2UIChatMessage[]
  isTyping: boolean
  isOpen: boolean
  sessionId: string
  verifiedTicket: string | null
  error: string | null
  lastAction: { type: 'message' | 'action', payload: any } | null
}

// Helper to check if two widgets are identical
const isSameWidget = (w1: A2UIWidget, w2: A2UIWidget) => {
  return w1.widget === w2.widget && JSON.stringify(w1.props) === JSON.stringify(w2.props)
}

// Helper to filter duplicate widgets against the last message
const filterDuplicateWidgets = (newWidgets: A2UIWidget[] | undefined, lastMessage: A2UIChatMessage | undefined) => {
  if (!newWidgets || !lastMessage || !lastMessage.widgets) return newWidgets

  // Filter out widgets that appear in the last message
  return newWidgets.filter(nw =>
    !lastMessage.widgets?.some(lw => isSameWidget(nw, lw))
  )
}

export function useA2UIChat() {
  const [state, setState] = useState<A2UIChatState>({
    messages: [],
    isTyping: false,
    isOpen: false,
    sessionId: `session-${Date.now()}`,
    verifiedTicket: null,
    error: null,
    lastAction: null,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  const toggleChat = useCallback(() => {
    setState((prev) => {
      const newIsOpen = !prev.isOpen
      // Add welcome message when opening for the first time
      if (newIsOpen && prev.messages.length === 0) {
        return {
          ...prev,
          isOpen: newIsOpen,
          messages: [
            {
              id: "welcome",
              role: "assistant",
              content: "👋 Welcome to SODDO Hospital support! I can help you with permits, documents, and workflows.",
              timestamp: new Date(),
              widgets: [
                {
                  widget: "quick-actions",
                  props: {
                    actions: [
                      { label: "Check permit status", action: "check_status" },
                      { label: "Upload document", action: "upload_document" },
                      { label: "View timeline", action: "view_timeline" },
                    ]
                  }
                }
              ]
            },
          ],
        }
      }
      return { ...prev, isOpen: newIsOpen }
    })
  }, [])

  const closeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: A2UIChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      error: null,
      lastAction: { type: 'message', payload: content }
    }))

    try {
      // Call A2UI Chat API (Gemini-powered)
      const response = await fetch("/api/a2ui-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          sessionId: state.sessionId,
          verifiedTicket: state.verifiedTicket,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Chat failed")
      }

      setState((prev) => {
        // Filter duplicates against the last message (which is the user message we just added, so check the one before that?)
        // Actually, we should check against the last ASSISTANT message to avoid repeating suggestions.
        const lastAssistantMsg = [...prev.messages].reverse().find(m => m.role === 'assistant')
        const uniqueWidgets = filterDuplicateWidgets(data.response.widgets, lastAssistantMsg)

        const assistantMessage: A2UIChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: data.response.text,
          timestamp: new Date(),
          widgets: uniqueWidgets,
        }

        return {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isTyping: false,
          verifiedTicket: data.verifiedTicket || prev.verifiedTicket,
        }
      })
    } catch (err: any) {
      console.error("Chat error:", err)
      setState((prev) => ({
        ...prev,
        isTyping: false,
        error: err.message || "Failed to send message. Please try again."
      }))
    }
  }, [state.sessionId, state.verifiedTicket])

  // Handle A2UI widget actions
  const handleAction = useCallback(async (actionName: string, context: Record<string, any>) => {
    setState((prev) => ({
      ...prev,
      isTyping: true,
      error: null,
      lastAction: { type: 'action', payload: { actionName, context } }
    }))

    try {
      const response = await fetch("/api/a2ui-chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionName,
          context,
          sessionId: state.sessionId,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Action failed")
      }

      setState((prev) => {
        const lastAssistantMsg = [...prev.messages].reverse().find(m => m.role === 'assistant')
        const uniqueWidgets = filterDuplicateWidgets(data.response.widgets, lastAssistantMsg)

        const assistantMessage: A2UIChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: data.response.text,
          timestamp: new Date(),
          widgets: uniqueWidgets,
        }

        return {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isTyping: false,
          verifiedTicket: data.verifiedTicket || prev.verifiedTicket,
        }
      })
    } catch (err: any) {
      console.error("Action error:", err)
      setState((prev) => ({
        ...prev,
        isTyping: false,
        error: err.message || "Action failed. Please try again."
      }))
    }
  }, [state.sessionId])

  const retryLastAction = useCallback(() => {
    if (!state.lastAction) return

    if (state.lastAction.type === 'message') {
      sendMessage(state.lastAction.payload)
    } else {
      handleAction(state.lastAction.payload.actionName, state.lastAction.payload.context)
    }
  }, [state.lastAction, sendMessage, handleAction])

  // Handle ticket verification
  const handleVerify = useCallback((ticketNumber: string) => {
    setState((prev) => ({ ...prev, verifiedTicket: ticketNumber }))
    // Trigger status fetch
    handleAction("verify_ticket", { ticketNumber })
  }, [handleAction])

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      sessionId: `session-${Date.now()}`,
      verifiedTicket: null,
    }))
  }, [])

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    isOpen: state.isOpen,
    verifiedTicket: state.verifiedTicket,
    error: state.error,
    toggleChat,
    closeChat,
    sendMessage,
    retryLastAction,
    handleAction,
    handleVerify,
    clearMessages,
    messagesEndRef,
  }
}
