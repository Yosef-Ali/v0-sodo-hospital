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
  model: process.env.OPENAI_MODEL || "gpt-5-mini-2025-08-07",
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "1000"),
  enableHumanInLoop: process.env.ENABLE_HUMAN_IN_LOOP === "true",
  enableGuardrails: process.env.ENABLE_GUARDRAILS === "true",
}

export const SYSTEM_PROMPTS = {
  classification: `You are a classification agent for SODO Hospital Document Management System.
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

  generalSupport: `You are a customer support agent for SODO Hospital Document Management System.
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

  documentSupport: `You are a document specialist for SODO Hospital Document Management System.
You help users with:
- Document status inquiries
- Permit applications and tracking
- Document requirements
- Processing timelines
- Checklist completion

You have access to tools to:
- Check document status
- View permit details
- Update checklist items
- Track processing history

Always verify document IDs before taking actions. Use tools when appropriate.
For sensitive operations (deletions, status changes), request human approval.`,

  technicalSupport: `You are a technical support specialist for SODO Hospital Document Management System.
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
    "Check my document status",
    "View pending permits",
    "See recent documents",
  ],
  technical_issue: [
    "Report a bug",
    "System not loading",
    "Can't upload document",
  ],
  workflow_help: [
    "How to submit a permit",
    "Approval process timeline",
    "Required documents checklist",
  ],
  general_inquiry: [
    "What is SODO Hospital",
    "How to get started",
    "Contact support",
  ],
  navigation: [
    "Go to dashboard",
    "View my tasks",
    "See all documents",
  ],
}
