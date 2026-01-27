"use server"

import { db } from "@/lib/db"
import { systemSettings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { API_KEY_CONFIGS, type ApiKeyType } from "@/lib/api-keys-config"

// Re-export the type for convenience
export type { ApiKeyType } from "@/lib/api-keys-config"

// Simple encryption for API keys (in production, use proper encryption)
function encryptValue(value: string): string {
  return Buffer.from(value).toString("base64")
}

function decryptValue(encrypted: string): string {
  try {
    return Buffer.from(encrypted, "base64").toString("utf-8")
  } catch {
    return encrypted
  }
}

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "••••••••"
  return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4)
}

// Get all API keys (masked)
export async function getApiKeys() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const settings = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.category, "ai"))

    const keys = Object.entries(API_KEY_CONFIGS).map(([key, config]) => {
      const setting = settings.find(s => s.key === key)
      const hasValue = setting?.value && setting.value.length > 0
      
      return {
        key: config.key,
        label: config.label,
        description: config.description,
        placeholder: config.placeholder,
        helpUrl: config.helpUrl,
        isConfigured: hasValue,
        maskedValue: hasValue ? maskApiKey(decryptValue(setting!.value!)) : null,
        updatedAt: setting?.updatedAt || null,
      }
    })

    return { success: true, data: keys }
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return { success: false, error: "Failed to fetch API keys" }
  }
}

// Set an API key
export async function setApiKey(keyType: ApiKeyType, value: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized - Admin access required" }
  }

  const config = API_KEY_CONFIGS[keyType]
  if (!config) {
    return { success: false, error: "Invalid API key type" }
  }

  try {
    const encryptedValue = encryptValue(value.trim())
    
    // Check if exists
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, keyType))
      .limit(1)

    if (existing.length > 0) {
      // Update
      await db
        .update(systemSettings)
        .set({
          value: encryptedValue,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, keyType))
    } else {
      // Insert
      await db.insert(systemSettings).values({
        key: keyType,
        value: encryptedValue,
        description: config.description,
        category: "ai",
        isSecret: true,
        updatedBy: session.user.id,
      })
    }

    revalidatePath("/settings/api-keys")
    return { success: true, message: `${config.label} API key saved successfully` }
  } catch (error) {
    console.error("Error saving API key:", error)
    return { success: false, error: "Failed to save API key" }
  }
}

// Delete an API key
export async function deleteApiKey(keyType: ApiKeyType) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized - Admin access required" }
  }

  try {
    await db
      .delete(systemSettings)
      .where(eq(systemSettings.key, keyType))

    revalidatePath("/settings/api-keys")
    return { success: true, message: "API key deleted successfully" }
  } catch (error) {
    console.error("Error deleting API key:", error)
    return { success: false, error: "Failed to delete API key" }
  }
}

// Get a specific API key (decrypted) - for internal use only
export async function getApiKeyValue(keyType: ApiKeyType): Promise<string | null> {
  try {
    const setting = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, keyType))
      .limit(1)

    if (setting.length > 0 && setting[0].value) {
      return decryptValue(setting[0].value)
    }
    
    // Fallback to environment variable
    return process.env[keyType] || null
  } catch (error) {
    console.error(`Error fetching ${keyType}:`, error)
    // Fallback to environment variable
    return process.env[keyType] || null
  }
}

// Test API key connection
export async function testApiKey(keyType: ApiKeyType, value?: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  // Get the key to test
  let apiKey = value
  if (!apiKey) {
    apiKey = await getApiKeyValue(keyType)
  }

  if (!apiKey) {
    return { success: false, error: "No API key provided" }
  }

  try {
    if (keyType === "GOOGLE_AI_API_KEY") {
      // Test Google AI
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      )
      if (response.ok) {
        return { success: true, message: "Google AI API key is valid" }
      } else {
        const data = await response.json()
        return { success: false, error: data.error?.message || "Invalid API key" }
      }
    }
    
    if (keyType === "OPENAI_API_KEY") {
      // Test OpenAI
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` }
      })
      if (response.ok) {
        return { success: true, message: "OpenAI API key is valid" }
      } else {
        return { success: false, error: "Invalid API key" }
      }
    }

    if (keyType === "ANTHROPIC_API_KEY") {
      // For Anthropic, we can't easily test without making a request
      // Just validate the format
      if (apiKey.startsWith("sk-ant-")) {
        return { success: true, message: "Anthropic API key format is valid" }
      }
      return { success: false, error: "Invalid API key format" }
    }

    return { success: false, error: "Unknown API key type" }
  } catch (error) {
    return { success: false, error: "Connection test failed" }
  }
}
