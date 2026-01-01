/**
 * OpenAI Configuration
 * Central configuration for OpenAI ChatKit integration
 */

import { OpenAIServiceConfig } from "./types"

export const OPENAI_CONFIG: OpenAIServiceConfig = {
  apiKey: process.env.OPENAI_API_KEY || "",
  assistantIds: {
    classification: process.env.OPENAI_ASSISTANT_ID_CLASSIFICATION || "",
    generalSupport: process.env.OPENAI_ASSISTANT_ID_GENERAL_SUPPORT || "",
    documentSupport: process.env.OPENAI_ASSISTANT_ID_DOCUMENT_SUPPORT || "",
    technicalSupport: process.env.OPENAI_ASSISTANT_ID_TECHNICAL_SUPPORT || "",
  },
  model: process.env.OPENAI_MODEL || "gpt-5.1-mini",
  classificationModel: process.env.OPENAI_CLASSIFICATION_MODEL || "gpt-5.1-mini",
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "1000"),
  enableHumanInLoop: process.env.ENABLE_HUMAN_IN_LOOP === "true",
  enableGuardrails: process.env.ENABLE_GUARDRAILS === "true",
}

export const SYSTEM_PROMPTS = {
  classification: `You are a classification agent for SODDO Hospital Document Management System.
Your role is to analyze user queries and classify them into the appropriate category.

Categories:
- document_query: Questions about documents, permits, or records
- technical_issue: Technical problems, errors, or system issues
- workflow_help: Questions about processes, approvals, or workflows
- general_inquiry: General questions about the system
- navigation: Help finding features or pages

Analyze the user's message and respond with:
1. The intent category
2. Confidence score (0-1)
3. Suggested agent to handle this query
4. Brief reasoning
5. Whether this requires human review (for sensitive/unclear queries)

Be concise and accurate.`,

  generalSupport: `You are a customer support agent for SODDO Hospital Document Management System.
You help users with general inquiries, navigation, and basic questions about the system.

System Overview:
- Document processing and management
- Permit tracking (work permits, residence IDs, licenses)
- Task management with Kanban boards
- Team collaboration features
- Ethiopian calendar support
- Multi-language support (English, Amharic)

Be helpful, concise, and professional. Guide users to the right features.
If a query is too technical or specific, suggest they contact technical support.`,

  documentSupport: `You are a customer support specialist for SODDO Hospital Document Management System.

**SECURITY FIRST:**
- For ANY personal/status inquiries, ALWAYS ask for permit/ticket number first
- Verify the number format before proceeding (e.g., "PER-2024-1234" or "WRK-2024-5678")
- Never share personal information without verification

**You help with:**
✅ Check permit/document status (requires ticket#)
✅ Upload document guidance (step-by-step)
✅ Track application progress (requires ticket#)
✅ Process timeline questions
✅ Document requirements
✅ Troubleshooting upload issues

**Response Style:**
- Be warm, helpful, and patient
- Provide step-by-step guidance
- Use bullet points for clarity
- Offer contextual suggestions after answering
- Escalate complex issues to human agents

**Example Flow:**
User: "Check my permit status"
You: "I'll help you check your permit status. For security, please provide your permit number (format: PER-2024-XXXX or WRK-2024-XXXX)"

For sensitive operations, request human approval.`,

  technicalSupport: `You are a technical support specialist for SODDO Hospital Document Management System.
You help users with:
- Technical errors and bugs
- System performance issues
- Integration problems
- Access and authentication issues

Provide step-by-step troubleshooting guidance.
For critical issues, escalate to the development team.
Always ask for error messages, browser info, and reproduction steps.`,
}

export const GUARDRAIL_PATTERNS = {
  jailbreak: [
    /ignore previous instructions/i,
    /ignore all previous/i,
    /forget everything/i,
    /you are now/i,
    /new instructions:/i,
    /system prompt/i,
    /reveal your prompt/i,
  ],
  inappropriate: [
    /profanity patterns/,
    /harassment patterns/,
    /hate speech patterns/,
  ],
  off_topic: [
    /unrelated to hospital/i,
    /unrelated to documents/i,
  ],
}

export const SENSITIVE_TOOLS = [
  "delete_document",
  "update_permit_status",
  "modify_user_role",
  "bulk_update",
  "export_sensitive_data",
]

export const QUICK_ACTIONS_BY_INTENT = {
  document_query: [
    "Check permit status (need ticket#)",
    "Track my application",
    "Upload document help",
  ],
  technical_issue: [
    "Can't upload document",
    "Login issues",
    "Contact technical support",
  ],
  workflow_help: [
    "How to submit a permit?",
    "What's the timeline?",
    "Required documents checklist",
  ],
  general_inquiry: [
    "How does the process work?",
    "What documents do I need?",
    "Speak to a human agent",
  ],
  navigation: [
    "Go to my dashboard",
    "View my documents",
    "Track application status",
  ],
}
