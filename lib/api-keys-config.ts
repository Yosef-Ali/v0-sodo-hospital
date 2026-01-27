// API Key configurations - separate file (not "use server")

export const API_KEY_CONFIGS = {
  GOOGLE_AI_API_KEY: {
    key: "GOOGLE_AI_API_KEY",
    label: "Google AI (Gemini)",
    description: "Used for AI chatbot, document OCR, and report generation",
    category: "ai",
    placeholder: "AIza...",
    helpUrl: "https://aistudio.google.com/apikey",
  },
  OPENAI_API_KEY: {
    key: "OPENAI_API_KEY", 
    label: "OpenAI",
    description: "Alternative AI provider for chat and analysis",
    category: "ai",
    placeholder: "sk-...",
    helpUrl: "https://platform.openai.com/api-keys",
  },
  ANTHROPIC_API_KEY: {
    key: "ANTHROPIC_API_KEY",
    label: "Anthropic (Claude)",
    description: "Alternative AI provider for advanced reasoning",
    category: "ai",
    placeholder: "sk-ant-...",
    helpUrl: "https://console.anthropic.com/settings/keys",
  },
} as const

export type ApiKeyType = keyof typeof API_KEY_CONFIGS
