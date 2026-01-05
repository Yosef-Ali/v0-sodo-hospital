import { db, systemSettings } from "@/lib/db"
import { eq } from "drizzle-orm"

// Simple decryption (matches the one in settings actions)
function simpleDecrypt(encoded: string): string {
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8")
    if (decoded.startsWith("ENC:")) {
      return decoded.slice(4)
    }
    return encoded
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
      value = setting.isSecret ? simpleDecrypt(setting.value) : setting.value
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
 * Get Google AI API Key
 */
export async function getGoogleApiKey(): Promise<string | null> {
  return getApiKey("GOOGLE_API_KEY")
}

/**
 * Clear settings cache (call after updating settings)
 */
export function clearSettingsCache() {
  settingsCache.clear()
}
