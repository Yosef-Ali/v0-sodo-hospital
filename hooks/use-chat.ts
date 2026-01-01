"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Message, ChatState, ChatWidget } from "@/lib/chat-context"
import { SUPPORT_AGENT_CONTEXT } from "@/lib/chat-context"
import { FileText, Clock, AlertCircle } from "lucide-react"

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
    let widgets: ChatWidget[] = []

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("document") || lowerMessage.includes("status")) {
      response = "I can help you check your document status. Here are your recent documents:"
      suggestions = ["View all documents", "Check pending items", "Processing timeline"]
      link = "/documents"
      widgets = [
        {
          type: "list",
          data: {
            title: "Recent Documents",
            items: [
              { title: "License Renewal - Dr. Ahmed", subtitle: "Ministry of Labor", status: "success", value: "Approved" },
              { title: "Support Letter - Nursing Dept", subtitle: "HERQA Review", status: "pending", value: "Pending" },
              { title: "Authentication - Admin Office", subtitle: "Internal", status: "pending", value: "Processing" },
            ]
          }
        }
      ]
    } else if (lowerMessage.includes("approval") || lowerMessage.includes("workflow")) {
      response = "The approval workflow involves three main authorities. Here's your approval status:"
      suggestions = ["View pending approvals", "Urgent items only", "Explain workflow"]
      link = "/tasks"
      widgets = [
        {
          type: "metric-card",
          data: {
            title: "Pending Approvals",
            value: "32",
            change: { value: "+5", type: "increase" },
            description: "5 urgent items need attention"
          }
        },
        {
          type: "list",
          data: {
            title: "Approval Breakdown",
            items: [
              { title: "Ministry of Labor", value: "12", status: "pending" },
              { title: "HERQA", value: "8", status: "pending" },
              { title: "Internal", value: "12", status: "success" },
            ]
          }
        }
      ]
    } else if (lowerMessage.includes("speed") || lowerMessage.includes("faster") || lowerMessage.includes("slow")) {
      response = "Here's your current processing performance:"
      suggestions = ["View overdue items", "Priority settings", "Best practices"]
      link = "/tasks"
      widgets = [
        {
          type: "metric-card",
          data: {
            title: "Avg. Processing Time",
            value: "4.2",
            change: { value: "-0.3 days", type: "decrease" },
            description: "Better than last month"
          }
        },
        {
          type: "progress",
          data: {
            label: "Documents on Track",
            value: 142,
            max: 156,
            color: "green"
          }
        },
        {
          type: "action-card",
          data: {
            title: "8 Overdue Tasks",
            description: "These items need immediate attention to prevent delays",
            actions: [
              { label: "View All", variant: "default", href: "/tasks" },
              { label: "Prioritize", variant: "outline" }
            ],
            status: "error"
          }
        }
      ]
    } else if (lowerMessage.includes("navigate") || lowerMessage.includes("help") || lowerMessage.includes("how")) {
      response = "I'm here to help! The system has several main sections:\n\n📊 Dashboard - Overview and metrics\n📄 Documents - All document processing\n✅ Tasks - Approvals and workflows\n👥 Teams - Staff management\n🏢 Departments - Department info\n📈 Reports - Analytics\n⚙️ Settings - Configuration\n\nWhat would you like to explore?"
      suggestions = ["Go to Dashboard", "View Documents", "Check Tasks", "System tour"]
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      response = "Hello! I'm your SODDO Hospital support assistant. I can help you with document processing, approvals, navigation, and any questions about the system. What can I help you with today?"
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
      widgets,
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
        content: "👋 Welcome to SODDO Hospital support! I'm here to help you with document management, approvals, and system navigation. How can I assist you today?",
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
