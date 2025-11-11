"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export interface CustomerMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
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

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("pricing") || lowerMessage.includes("cost") || lowerMessage.includes("price")) {
      response = "We offer three pricing tiers:\n\n💼 Basic - $99/month (10 users, 100GB storage)\n🚀 Professional - $299/month (100 users, 1TB storage)\n🏢 Enterprise - Custom pricing (500+ users, unlimited storage)\n\nAll plans include a 14-day free trial. Would you like to speak with our sales team?"
      suggestions = ["Request demo", "View limitations", "Talk to sales", "Free trial"]
    } else if (lowerMessage.includes("limit") || lowerMessage.includes("restriction") || lowerMessage.includes("maximum")) {
      response = "I can show you our system limitations and capabilities. Key limitations include:\n\n• Max file size: 50MB\n• Supported formats: PDF, DOC, DOCX, JPG, PNG\n• Processing time: 2-7 business days\n• API rate limits vary by plan\n\nWould you like to see the complete limitations overview?"
      suggestions = ["Show all limitations", "Compare plans", "Enterprise options"]
      action = "show-limitations"
    } else if (lowerMessage.includes("demo") || lowerMessage.includes("try") || lowerMessage.includes("test")) {
      response = "Great! I can help you get started with SODO Hospital. We offer:\n\n✅ 14-day free trial (no credit card required)\n🎥 Live demo with our team\n📚 Self-guided product tour\n\nWhich would you prefer?"
      suggestions = ["Start free trial", "Book live demo", "Product tour", "Contact sales"]
    } else if (lowerMessage.includes("support") || lowerMessage.includes("help") || lowerMessage.includes("issue") || lowerMessage.includes("problem")) {
      response = "I'm here to help! You can:\n\n🎫 Submit a support ticket for detailed assistance\n❓ Browse our FAQ for quick answers\n💬 Continue chatting with me\n📞 Talk to our support team directly\n\nWhat works best for you?"
      suggestions = ["Submit ticket", "View FAQ", "Call support", "Continue chat"]
      action = "open-ticket"
    } else if (lowerMessage.includes("feature") || lowerMessage.includes("capability") || lowerMessage.includes("can it")) {
      response = "SODO Hospital offers comprehensive features:\n\n📄 Document Processing (license renewals, support letters, authentication)\n✅ Multi-level Approval Workflows (Ministry of Labor, HERQA, Internal)\n⏱️ Processing Time Tracking & Optimization\n👥 Team Collaboration Tools\n📊 Analytics & Reporting\n🔒 Enterprise-grade Security & Compliance\n\nWhat specific feature are you interested in?"
      suggestions = ["View all features", "Security details", "Request demo", "Compare plans"]
    } else if (lowerMessage.includes("secure") || lowerMessage.includes("security") || lowerMessage.includes("complian")) {
      response = "Security is our top priority:\n\n🔐 AES-256 encryption at rest\n🌐 TLS 1.3 in transit\n✅ SOC 2 Type II certified\n🏥 HIPAA compliant (Enterprise)\n📝 Full audit logging\n🔄 Automated backups\n\nNeed more details on our security practices?"
      suggestions = ["Security whitepaper", "Compliance docs", "Enterprise security", "Talk to security team"]
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      response = "👋 Hello! Welcome to SODO Hospital Document Management. I'm here to help you learn about our system, answer questions, or guide you through getting started.\n\nWhat brings you here today?"
      suggestions = ["View features", "See pricing", "Request demo", "Check limitations"]
    } else {
      response = "Thanks for reaching out! I can help you with:\n\n💰 Pricing & Plans\n📋 System Limitations\n🎯 Features & Capabilities\n🎫 Support Tickets\n🎥 Product Demos\n\nWhat would you like to know more about?"
      suggestions = ["Pricing info", "System limits", "Request demo", "Submit ticket"]
    }

    const assistantMessage: CustomerMessage = {
      id: responseId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
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
        content: "👋 Welcome! I'm here to help you learn about SODO Hospital Document Management System. Ask me about features, pricing, demos, or system capabilities!",
        timestamp: new Date(),
        metadata: {
          suggestions: ["View pricing", "Request demo", "Check limitations", "System features"]
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
