"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export interface CustomerMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
  widgets?: Array<{
    type: "action-card" | "progress" | "list" | "document-card" | "metric-card" | "quick-actions" | "status-badge" | "date-picker"
    data: any
  }>
  metadata?: {
    suggestions?: string[]
    action?: "open-ticket" | "show-faq" | "show-limitations" | "contact-sales"
  }
}

export interface CustomerSupportState {
  messages: CustomerMessage[]
  isTyping: boolean
  isOpen: boolean
  activeTab: "chat" | "ticket" | "faq" | "limitations"
}

export function useCustomerSupport() {
  const [state, setState] = useState<CustomerSupportState>({
    messages: [],
    isTyping: false,
    isOpen: false,
    activeTab: "chat"
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  const toggleSupport = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  const closeSupport = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const setActiveTab = useCallback((tab: CustomerSupportState["activeTab"]) => {
    setState(prev => ({ ...prev, activeTab: tab }))
  }, [])

  const simulateAIResponse = useCallback(async (userMessage: string) => {
    setState(prev => ({ ...prev, isTyping: true }))

    await new Promise(resolve => setTimeout(resolve, 500))

    const responseId = `msg-${Date.now()}-assistant`
    let response = ""
    let suggestions: string[] = []
    let action: CustomerMessage["metadata"]["action"] = undefined
    let widgets: CustomerMessage["widgets"] = []

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("upload") || lowerMessage.includes("submit") || lowerMessage.includes("add document")) {
      response = "Here's how to upload documents to the system:"
      suggestions = ["View all documents", "Check processing status", "Bulk upload", "File formats"]
      widgets = [
        {
          type: "action-card",
          data: {
            title: "Upload Documents",
            description: "Navigate to Documents → Upload Document. Select file (PDF, DOC, DOCX, JPG, PNG up to 50MB), fill in details, and submit.",
            actions: [
              { label: "Go to Documents", variant: "default", href: "/documents" },
              { label: "View Guide", variant: "outline" }
            ]
          }
        },
        {
          type: "list",
          data: {
            title: "Supported Document Types",
            items: [
              { title: "License Renewals", subtitle: "Hospital licenses", value: "Ministry of Labor" },
              { title: "Support Letters", subtitle: "Official correspondence", value: "HERQA/Internal" },
              { title: "Authentication Docs", subtitle: "Verified documents", value: "Multi-authority" },
            ]
          }
        }
      ]
    } else if (lowerMessage.includes("limit") || lowerMessage.includes("restriction") || lowerMessage.includes("maximum") || lowerMessage.includes("capability")) {
      response = "I can show you the system capabilities and limitations:"
      suggestions = ["Show all limitations", "File formats", "Processing times", "User access"]
      action = "show-limitations"
    } else if (lowerMessage.includes("start") || lowerMessage.includes("begin") || lowerMessage.includes("how to use")) {
      response = "Welcome to SODDO Hospital Document Management! Here's how to get started:"
      suggestions = ["Upload document", "View dashboard", "Check tasks", "System tour"]
      widgets = [
        {
          type: "list",
          data: {
            title: "Quick Start Guide",
            items: [
              { title: "Dashboard", subtitle: "View system overview", icon: "📊" },
              { title: "Documents", subtitle: "Upload and track documents", icon: "📄" },
              { title: "Tasks", subtitle: "Manage your assignments", icon: "✅" },
              { title: "Teams", subtitle: "Collaborate with colleagues", icon: "👥" }
            ]
          }
        }
      ]
    } else if (lowerMessage.includes("support") || lowerMessage.includes("help") || lowerMessage.includes("issue") || lowerMessage.includes("problem") || lowerMessage.includes("ticket")) {
      response = "I'm here to help! You can:\n\n🎫 Submit a support ticket for detailed assistance\n❓ Browse our FAQ for quick answers\n💬 Continue chatting with me\n📞 Contact your IT department for technical issues\n\nWhat works best for you?"
      suggestions = ["Submit ticket", "View FAQ", "Document help", "Workflow help"]
      action = "open-ticket"
    } else if (lowerMessage.includes("feature") || lowerMessage.includes("what can") || lowerMessage.includes("capabilities")) {
      response = "SODDO Hospital Document Management System features:\n\n📄 Document Processing (license renewals, support letters, authentication)\n✅ Multi-level Approval Workflows (Ministry of Labor, HERQA, Internal)\n⏱️ Processing Time Tracking (avg 4.2 days)\n👥 Team Collaboration (9 departments, multiple teams)\n📊 Comprehensive Reporting (9 report types)\n🔒 Secure & HIPAA-compliant\n📋 Kanban task management\n\nWhat would you like to know more about?"
      suggestions = ["Document types", "Approval process", "Team features", "Reports"]
    } else if (lowerMessage.includes("secure") || lowerMessage.includes("security") || lowerMessage.includes("complian") || lowerMessage.includes("hipaa")) {
      response = "Security and compliance information:\n\n🔐 AES-256 encryption at rest\n🌐 TLS 1.3 in transit\n🏥 HIPAA compliant for healthcare data\n📝 Complete audit trail and activity logging\n🔄 Daily automated backups (90-day retention)\n👤 Two-factor authentication available\n🔒 Role-based access control\n\nNeed specific security details?"
      suggestions = ["Access control", "Data backup", "Compliance info", "Security settings"]
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      response = "👋 Hello! Welcome to SODDO Hospital Document Management System. I'm here to help hospital staff with document processing, approvals, task management, and system navigation.\n\nWhat can I help you with today?"
      suggestions = ["Upload document", "Check status", "View tasks", "System features"]
    } else {
      response = "Thanks for reaching out! I can help you with:\n\n📄 Document Upload & Processing\n✅ Approval Workflows & Tasks\n👥 Team Collaboration\n📊 Reports & Analytics\n🔧 Technical Support\n❓ System Navigation\n\nWhat would you like to know more about?"
      suggestions = ["Document help", "Approval workflow", "System features", "Submit ticket"]
    }

    const assistantMessage: CustomerMessage = {
      id: responseId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      widgets,
      metadata: { suggestions, action }
    }

    setState(prev => ({
      ...prev,
      isTyping: false,
      messages: [...prev.messages, assistantMessage]
    }))

    // Simulate streaming
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

    const userMessage: CustomerMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }))

    await simulateAIResponse(content.trim())
  }, [simulateAIResponse])

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }))
  }, [])

  useEffect(() => {
    if (state.messages.length === 0 && state.isOpen && state.activeTab === "chat") {
      const welcomeMessage: CustomerMessage = {
        id: "welcome",
        role: "assistant",
        content: "👋 Welcome! I'm here to help you with SODDO Hospital Document Management. Ask me about document processing, approvals, tasks, teams, or any system features!",
        timestamp: new Date(),
        metadata: {
          suggestions: ["Upload document", "Check approvals", "View tasks", "System features"]
        }
      }
      setState(prev => ({
        ...prev,
        messages: [welcomeMessage]
      }))
    }
  }, [state.isOpen, state.activeTab, state.messages.length])

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    isOpen: state.isOpen,
    activeTab: state.activeTab,
    toggleSupport,
    closeSupport,
    setActiveTab,
    sendMessage,
    clearMessages,
    messagesEndRef
  }
}
