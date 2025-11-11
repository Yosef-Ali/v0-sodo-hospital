// Customer support context for landing page visitors
export const CUSTOMER_SUPPORT_CONTEXT = `You are a customer support agent for SODO Hospital Document Management System helping potential customers and visitors.

Your role is to assist with:
- Product information and features
- Pricing and plans
- System capabilities and limitations
- Getting started guidance
- Technical requirements
- Demo requests
- Support ticket creation
- Pre-sales questions

System Limitations:
- Maximum file size: 50MB per document
- Supported formats: PDF, DOC, DOCX, JPG, PNG
- Maximum concurrent users: Depends on plan (10-500)
- Storage limits: 100GB (Basic), 1TB (Pro), Unlimited (Enterprise)
- Processing time: 2-7 business days depending on document type
- API rate limits: 1000 requests/hour (Basic), 10000/hour (Pro)
- Backup retention: 30 days (Basic), 90 days (Pro), Custom (Enterprise)

Be helpful, professional, and guide visitors to take action (request demo, create ticket, contact sales).`

export interface ChatWidget {
  type: "action-card" | "progress" | "list" | "document-card" | "metric-card" | "quick-actions" | "status-badge" | "date-picker"
  data: any
}

export interface SupportTicket {
  id: string
  name: string
  email: string
  subject: string
  category: "technical" | "billing" | "general" | "demo" | "sales"
  priority: "low" | "medium" | "high" | "urgent"
  description: string
  status: "submitted" | "pending" | "resolved"
  createdAt: Date
}

export const SUPPORT_CATEGORIES = [
  { value: "technical", label: "Technical Support", icon: "Wrench" },
  { value: "billing", label: "Billing & Pricing", icon: "CreditCard" },
  { value: "general", label: "General Inquiry", icon: "HelpCircle" },
  { value: "demo", label: "Request Demo", icon: "Play" },
  { value: "sales", label: "Talk to Sales", icon: "PhoneCall" }
] as const

export const FAQ_ITEMS = [
  {
    category: "General",
    items: [
      {
        question: "What is SODO Hospital Document Management System?",
        answer: "A comprehensive document management platform designed specifically for hospital administrative tasks, including license renewals, support letters, and authentication documents."
      },
      {
        question: "Who can use this system?",
        answer: "Hospital administrators, document processors, approval managers, and staff handling Ministry of Labor, HERQA, and internal documentation."
      },
      {
        question: "How long does document processing take?",
        answer: "Average processing time is 4.2 days, depending on document type and approval requirements. Urgent processing is available."
      }
    ]
  },
  {
    category: "Features & Limitations",
    items: [
      {
        question: "What file formats are supported?",
        answer: "We support PDF, DOC, DOCX, JPG, and PNG formats. Maximum file size is 50MB per document."
      },
      {
        question: "What are the system limitations?",
        answer: "Limitations depend on your plan: Basic (10 users, 100GB storage), Pro (100 users, 1TB storage), Enterprise (500+ users, unlimited storage). API rate limits apply."
      },
      {
        question: "How many concurrent users are supported?",
        answer: "Basic plan: 10 users, Professional: 100 users, Enterprise: 500+ users with custom scaling options."
      },
      {
        question: "What is the backup retention policy?",
        answer: "Basic: 30 days, Professional: 90 days, Enterprise: Custom retention with compliance support."
      }
    ]
  },
  {
    category: "Pricing & Plans",
    items: [
      {
        question: "What pricing plans are available?",
        answer: "We offer Basic ($99/mo), Professional ($299/mo), and Enterprise (custom pricing) plans. All plans include core features with varying limits."
      },
      {
        question: "Is there a free trial?",
        answer: "Yes! We offer a 14-day free trial with access to Professional plan features. No credit card required."
      },
      {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can change your plan at any time. Upgrades are immediate, downgrades take effect at the next billing cycle."
      }
    ]
  },
  {
    category: "Security & Compliance",
    items: [
      {
        question: "Is the system HIPAA compliant?",
        answer: "Yes, our Enterprise plan includes full HIPAA compliance with BAA, encryption, and audit logging."
      },
      {
        question: "How is data secured?",
        answer: "We use AES-256 encryption at rest, TLS 1.3 in transit, and maintain SOC 2 Type II certification."
      }
    ]
  }
]

export const SYSTEM_LIMITATIONS = [
  {
    category: "File & Storage",
    limits: [
      { item: "Maximum file size", limit: "50MB per document" },
      { item: "Supported formats", limit: "PDF, DOC, DOCX, JPG, PNG" },
      { item: "Storage (Basic)", limit: "100GB" },
      { item: "Storage (Pro)", limit: "1TB" },
      { item: "Storage (Enterprise)", limit: "Unlimited" }
    ]
  },
  {
    category: "Users & Access",
    limits: [
      { item: "Concurrent users (Basic)", limit: "10 users" },
      { item: "Concurrent users (Pro)", limit: "100 users" },
      { item: "Concurrent users (Enterprise)", limit: "500+ users" },
      { item: "User roles", limit: "5 custom roles" }
    ]
  },
  {
    category: "Processing & Performance",
    limits: [
      { item: "Processing time", limit: "2-7 business days" },
      { item: "Urgent processing", limit: "24 hours (additional fee)" },
      { item: "Bulk upload", limit: "100 documents at once" },
      { item: "API rate limit (Basic)", limit: "1,000 requests/hour" },
      { item: "API rate limit (Pro)", limit: "10,000 requests/hour" }
    ]
  },
  {
    category: "Data & Backup",
    limits: [
      { item: "Backup retention (Basic)", limit: "30 days" },
      { item: "Backup retention (Pro)", limit: "90 days" },
      { item: "Backup retention (Enterprise)", limit: "Custom" },
      { item: "Export frequency", limit: "Daily exports available" }
    ]
  }
]
