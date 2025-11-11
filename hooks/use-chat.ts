"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Message, ChatState } from "@/lib/chat-context"
import { SUPPORT_AGENT_CONTEXT } from "@/lib/chat-context"

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    isOpen: false
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  const closeChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Simulate AI response with streaming effect
  const simulateAIResponse = useCallback(async (userMessage: string) => {
    setState(prev => ({ ...prev, isTyping: true }))

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const responseId = `msg-${Date.now()}-assistant`

    // Context-aware responses based on keywords
    let response = ""
    let suggestions: string[] = []
    let link = ""

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("document") || lowerMessage.includes("status")) {
      response = "I can help you check your document status. You can view all documents and their processing status in the Documents section. Would you like me to guide you there?"
      suggestions = ["View documents", "Check pending items", "Processing timeline"]
      link = "/documents"
    } else if (lowerMessage.includes("approval") || lowerMessage.includes("workflow")) {
      response = "The approval workflow involves three main authorities: Ministry of Labor, HERQA, and Internal reviewers. You currently have 32 pending approvals with 5 marked as urgent. Would you like to view them?"
      suggestions = ["View pending approvals", "Urgent items only", "Explain workflow"]
      link = "/tasks"
    } else if (lowerMessage.includes("speed") || lowerMessage.includes("faster") || lowerMessage.includes("slow")) {
      response = "To optimize processing time: 1) Ensure all required documents are complete 2) Follow up on pending approvals 3) Use the priority flag for urgent items. Your current average is 4.2 days. I can show you the overdue items that need attention."
      suggestions = ["View overdue items", "Priority settings", "Best practices"]
      link = "/tasks"
    } else if (lowerMessage.includes("navigate") || lowerMessage.includes("help") || lowerMessage.includes("how")) {
      response = "I'm here to help! The system has several main sections:\n\n📊 Dashboard - Overview and metrics\n📄 Documents - All document processing\n✅ Tasks - Approvals and workflows\n👥 Teams - Staff management\n🏢 Departments - Department info\n📈 Reports - Analytics\n⚙️ Settings - Configuration\n\nWhat would you like to explore?"
      suggestions = ["Go to Dashboard", "View Documents", "Check Tasks", "System tour"]
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      response = "Hello! I'm your SODO Hospital support assistant. I can help you with document processing, approvals, navigation, and any questions about the system. What can I help you with today?"
      suggestions = ["Check document status", "View pending approvals", "System help", "Processing time"]
    } else {
      response = "I understand you need help with that. Let me assist you. Could you provide more details about what you're looking for? I can help with documents, approvals, tasks, navigation, or general system questions."
      suggestions = ["Document help", "Approval workflow", "Navigation", "Contact support"]
    }

    // Create assistant message with streaming simulation
    const assistantMessage: Message = {
      id: responseId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      metadata: {
        suggestions,
        link
      }
    }

    setState(prev => ({
      ...prev,
      isTyping: false,
      messages: [...prev.messages, assistantMessage]
    }))

    // Simulate streaming by adding characters progressively
    const words = response.split(" ")
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50))
      setState(prev => {
        const updatedMessages = [...prev.messages]
        const lastMessage = updatedMessages[updatedMessages.length - 1]
        if (lastMessage.id === responseId) {
          lastMessage.content = words.slice(0, i + 1).join(" ")
          if (i === words.length - 1) {
            lastMessage.isStreaming = false
          }
        }
        return { ...prev, messages: updatedMessages }
      })
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }))

    // Trigger AI response
    await simulateAIResponse(content.trim())
  }, [simulateAIResponse])

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: []
    }))
  }, [])

  // Initialize with welcome message if no messages
  useEffect(() => {
    if (state.messages.length === 0 && state.isOpen) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: "👋 Welcome to SODO Hospital support! I'm here to help you with document management, approvals, and system navigation. How can I assist you today?",
        timestamp: new Date(),
        metadata: {
          suggestions: ["Check document status", "View pending approvals", "Processing help", "System tour"]
        }
      }
      setState(prev => ({
        ...prev,
        messages: [welcomeMessage]
      }))
    }
  }, [state.isOpen, state.messages.length])

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    isOpen: state.isOpen,
    toggleChat,
    closeChat,
    sendMessage,
    clearMessages,
    messagesEndRef
  }
}
