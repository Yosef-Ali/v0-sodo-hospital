import { db } from "@/lib/db"
import { systemSettings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// Simple decryption (matches the one in settings actions)
function decryptValue(encoded: string): string {
  try {
    return Buffer.from(encoded, "base64").toString("utf-8")
  } catch {
    return encoded
  }
}

// Cache for settings to avoid repeated DB calls
const settingsCache = new Map<string, { value: string; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute cache

/**
 * Get an API key from settings database or fallback to environment variable
 */
export async function getApiKey(key: string): Promise<string | null> {
  // Check cache first
  const cached = settingsCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value
  }

  try {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1)

    let value: string | null = null

    if (setting?.value) {
      value = decryptValue(setting.value)
    }

    // Fallback to environment variable
    if (!value) {
      value = process.env[key] || null
    }

    // Cache the value
    if (value) {
      settingsCache.set(key, { value, timestamp: Date.now() })
    }

    return value
  } catch (error) {
    console.error(`Error fetching API key ${key}:`, error)
    // Fallback to environment variable on error
    return process.env[key] || null
  }
}

/**
 * Get Google AI API Key (for Gemini)
 */
export async function getGoogleApiKey(): Promise<string | null> {
  // Try new key name first, then fallback to old name
  const key = await getApiKey("GOOGLE_AI_API_KEY")
  if (key) return key
  return getApiKey("GOOGLE_API_KEY")
}

/**
 * Get OpenAI API Key
 */
export async function getOpenAIApiKey(): Promise<string | null> {
  return getApiKey("OPENAI_API_KEY")
}

/**
 * Get Anthropic API Key
 */
export async function getAnthropicApiKey(): Promise<string | null> {
  return getApiKey("ANTHROPIC_API_KEY")
}

/**
 * Clear settings cache (call after updating settings)
 */
export function clearSettingsCache() {
  settingsCache.clear()
}
