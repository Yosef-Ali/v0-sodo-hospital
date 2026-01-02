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
}

export function useA2UIChat() {
  const [state, setState] = useState<A2UIChatState>({
    messages: [],
    isTyping: false,
    isOpen: false,
    sessionId: `session-${Date.now()}`,
    verifiedTicket: null,
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

      // Add assistant message with widgets
      const assistantMessage: A2UIChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.response.text,
        timestamp: new Date(),
        widgets: data.response.widgets,
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
        verifiedTicket: data.verifiedTicket || prev.verifiedTicket,
      }))
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: A2UIChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isTyping: false,
      }))
    }
  }, [state.sessionId, state.verifiedTicket])

  // Handle A2UI widget actions
  const handleAction = useCallback(async (actionName: string, context: Record<string, any>) => {
    setState((prev) => ({ ...prev, isTyping: true }))

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

      const assistantMessage: A2UIChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.response.text,
        timestamp: new Date(),
        widgets: data.response.widgets,
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
        verifiedTicket: data.verifiedTicket || prev.verifiedTicket,
      }))
    } catch (error) {
      console.error("Action error:", error)
      setState((prev) => ({ ...prev, isTyping: false }))
    }
  }, [state.sessionId])

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
    toggleChat,
    closeChat,
    sendMessage,
    handleAction,
    handleVerify,
    clearMessages,
    messagesEndRef,
  }
}
