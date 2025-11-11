// Customer support context for SODO Hospital staff and users
export const CUSTOMER_SUPPORT_CONTEXT = `You are a support assistant for SODO Hospital Document Management System helping hospital staff and administrators.

Your role is to assist with:
- System navigation and features
- Document upload and processing workflows
- Task management and assignment
- Approval workflows (Ministry of Labor, HERQA, Internal)
- Team and department coordination
- Troubleshooting common issues
- Report generation and analytics
- User account and settings

System Capabilities:
- Document types: License renewals, support letters, authentication documents
- Processing time: 2-7 business days (urgent: 24 hours)
- Approval authorities: Ministry of Labor, HERQA, Internal reviewers
- Task management: Pending, In-Progress, Completed, Urgent statuses
- File support: PDF, DOC, DOCX, JPG, PNG (max 50MB)
- Features: Dashboard, Documents, Tasks, Kanban, Teams, Departments, Reports, Settings

Be helpful, professional, and guide users on how to use the system effectively for hospital administrative tasks.`

export interface ChatWidget {
  type: "action-card" | "progress" | "list" | "document-card" | "metric-card" | "quick-actions" | "status-badge" | "date-picker"
  data: any
}

export interface SupportTicket {
  id: string
  name: string
  email: string
  subject: string
  category: "technical" | "document" | "workflow" | "general" | "training"
  priority: "low" | "medium" | "high" | "urgent"
  description: string
  status: "submitted" | "pending" | "resolved"
  createdAt: Date
}

export const SUPPORT_CATEGORIES = [
  { value: "technical", label: "Technical Support", icon: "Wrench" },
  { value: "document", label: "Document Processing", icon: "FileText" },
  { value: "workflow", label: "Workflow & Approvals", icon: "CheckCircle" },
  { value: "general", label: "General Inquiry", icon: "HelpCircle" },
  { value: "training", label: "Training & How-To", icon: "BookOpen" }
] as const

export const FAQ_ITEMS = [
  {
    category: "Getting Started",
    items: [
      {
        question: "What is SODO Hospital Document Management System?",
        answer: "An internal document management platform for SODO Hospital staff to manage administrative tasks, including license renewals, support letters, authentication documents, and approval workflows."
      },
      {
        question: "Who can use this system?",
        answer: "Hospital administrators, document processors, approval managers, medical staff, department heads, and team leads handling Ministry of Labor, HERQA, and internal documentation."
      },
      {
        question: "How do I upload documents?",
        answer: "Navigate to the Documents page, click 'Upload Document', select your file (PDF, DOC, DOCX, JPG, or PNG up to 50MB), fill in document details, and submit. You'll be able to track its processing status."
      }
    ]
  },
  {
    category: "Document Processing",
    items: [
      {
        question: "How long does document processing take?",
        answer: "Average processing time is 4.2 days, depending on document type and approval requirements. Urgent documents can be processed within 24 hours."
      },
      {
        question: "What file formats are supported?",
        answer: "We support PDF, DOC, DOCX, JPG, and PNG formats. Maximum file size is 50MB per document."
      },
      {
        question: "How do I track my document status?",
        answer: "Go to the Documents page to view all your documents. You can filter by status (Pending, Under Review, Approved, Authenticated) and use the search function to find specific documents."
      },
      {
        question: "What document types can I submit?",
        answer: "License renewals, support letters, authentication documents, medical staff bylaws, infection control policies, emergency response plans, consent forms, equipment logs, and quality improvement reports."
      }
    ]
  },
  {
    category: "Approvals & Workflows",
    items: [
      {
        question: "What are the approval authorities?",
        answer: "Documents require approval from: Ministry of Labor, HERQA (Higher Education Relevance and Quality Assurance), and Internal reviewers depending on document type."
      },
      {
        question: "How do I check pending approvals?",
        answer: "Visit the Dashboard to see pending approvals count, or go to the Tasks page and filter by 'Pending' status. You can view which authority is reviewing each document."
      },
      {
        question: "Can I expedite urgent documents?",
        answer: "Yes, mark documents as 'Urgent' when uploading. Urgent documents are processed within 24 hours and appear at the top of the approval queue."
      }
    ]
  },
  {
    category: "Tasks & Teams",
    items: [
      {
        question: "How do I manage tasks?",
        answer: "Use the Tasks page to view all tasks with filters for status (Pending, In-Progress, Completed, Urgent), priority, and assignee. You can also use the Kanban board for drag-and-drop task management."
      },
      {
        question: "How do I collaborate with my team?",
        answer: "Visit the Teams page to see your team members, team lead, and department. You can assign tasks to team members and track their progress in real-time."
      },
      {
        question: "What reports are available?",
        answer: "Access 9 report types in the Reports page: Patient Statistics, Financial Performance, Staff Productivity, Quality Indicators, Inventory Status, Facility Utilization, Medication Usage, Equipment Maintenance, and Regulatory Compliance."
      }
    ]
  },
  {
    category: "Security & Support",
    items: [
      {
        question: "Is the system secure?",
        answer: "Yes, we use AES-256 encryption for data storage, TLS 1.3 for data transfer, and maintain HIPAA compliance standards for healthcare documentation."
      },
      {
        question: "How do I get help?",
        answer: "Use this support widget to chat with our AI assistant, submit support tickets, or browse FAQs. For urgent technical issues, contact your IT department."
      }
    ]
  }
]

export const SYSTEM_LIMITATIONS = [
  {
    category: "File & Document Management",
    limits: [
      { item: "Maximum file size", limit: "50MB per document" },
      { item: "Supported formats", limit: "PDF, DOC, DOCX, JPG, PNG" },
      { item: "Bulk upload", limit: "100 documents at once" },
      { item: "Document retention", limit: "Unlimited (as per hospital policy)" },
      { item: "Search depth", limit: "Full-text search across all documents" }
    ]
  },
  {
    category: "Users & Access Control",
    limits: [
      { item: "Concurrent users", limit: "Hospital-wide access for all staff" },
      { item: "User roles", limit: "9 departments, multiple teams" },
      { item: "Session timeout", limit: "Configurable (default 30 minutes)" },
      { item: "Two-factor authentication", limit: "Available for all users" },
      { item: "Role-based permissions", limit: "Department and team-level access" }
    ]
  },
  {
    category: "Processing & Workflows",
    limits: [
      { item: "Standard processing", limit: "2-7 business days" },
      { item: "Urgent processing", limit: "24 hours" },
      { item: "Approval authorities", limit: "Ministry of Labor, HERQA, Internal" },
      { item: "Task statuses", limit: "Pending, In-Progress, Completed, Urgent" },
      { item: "Workflow automation", limit: "Auto-routing to approval authorities" }
    ]
  },
  {
    category: "Reporting & Analytics",
    limits: [
      { item: "Report types", limit: "9 comprehensive report categories" },
      { item: "Report generation", limit: "Daily, Weekly, Monthly, Quarterly" },
      { item: "Data export", limit: "PDF, Excel, CSV formats" },
      { item: "Analytics dashboard", limit: "Real-time metrics and KPIs" },
      { item: "Activity logging", limit: "Complete audit trail" }
    ]
  },
  {
    category: "System Performance",
    limits: [
      { item: "System availability", limit: "24/7 operation" },
      { item: "Backup frequency", limit: "Daily automated backups" },
      { item: "Data recovery", limit: "90-day backup retention" },
      { item: "Response time", limit: "Average < 2 seconds" },
      { item: "Browser support", limit: "Modern browsers (Chrome, Firefox, Safari, Edge)" }
    ]
  }
]
