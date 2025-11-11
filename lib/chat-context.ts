// Hospital document management system context for AI support agent
export const SUPPORT_AGENT_CONTEXT = `You are a helpful customer support agent for the SODO Hospital Document Management System.

Your role is to assist hospital administrators with:
- Document processing (license renewals, support letters, authentication)
- Task management and approval workflows
- Ministry of Labor, HERQA, and internal approval processes
- Processing time optimization
- System navigation and feature explanation
- Troubleshooting common issues

Key system information:
- Average processing time: 4.2 days
- Main document types: License Renewals, Support Letters, Authentication Documents
- Approval authorities: Ministry of Labor, HERQA, Internal
- Available modules: Dashboard, Documents, Tasks, Teams, Departments, Reports, Settings

Be professional, concise, and provide actionable guidance. Offer to help with specific tasks or navigate to relevant sections.`

export interface ChatWidget {
  type: "action-card" | "progress" | "list" | "document-card" | "metric-card" | "quick-actions" | "status-badge" | "date-picker"
  data: any
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isStreaming?: boolean
  widgets?: ChatWidget[]
  metadata?: {
    action?: string
    link?: string
    suggestions?: string[]
  }
}

export interface ChatState {
  messages: Message[]
  isTyping: boolean
  isOpen: boolean
}

export const QUICK_ACTIONS = [
  {
    id: "check-status",
    label: "Check Document Status",
    prompt: "How can I check the status of my documents?",
    icon: "FileText"
  },
  {
    id: "speed-up",
    label: "Speed Up Processing",
    prompt: "How can I speed up document processing?",
    icon: "Clock"
  },
  {
    id: "approval-help",
    label: "Approval Process",
    prompt: "Explain the approval workflow",
    icon: "CheckCircle"
  },
  {
    id: "navigate",
    label: "Navigation Help",
    prompt: "Help me navigate the system",
    icon: "Map"
  }
]

export const SUGGESTED_RESPONSES = {
  greeting: [
    "Check document status",
    "View pending approvals",
    "Processing time help",
    "System navigation"
  ],
  documents: [
    "How to upload documents",
    "Track processing status",
    "Document requirements",
    "Download processed files"
  ],
  tasks: [
    "View urgent tasks",
    "Approval workflow",
    "Task prioritization",
    "Overdue items"
  ],
  general: [
    "Contact support",
    "Report an issue",
    "Feature request",
    "System status"
  ]
}
