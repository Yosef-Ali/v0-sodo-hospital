"use server"

import { db, systemSettings } from "@/lib/db"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// Simple encryption for API keys (in production, use a proper encryption service)
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || "default-key-change-in-production"

function simpleEncrypt(text: string): string {
  // Base64 encode with a marker - in production use proper encryption
  return Buffer.from(`ENC:${text}`).toString("base64")
}

function simpleDecrypt(encoded: string): string {
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8")
    if (decoded.startsWith("ENC:")) {
      return decoded.slice(4)
    }
    return encoded // Return as-is if not encrypted
  } catch {
    return encoded
  }
}

// Get all settings
export async function getSettings(category?: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    let query = db.select().from(systemSettings)
    
    if (category) {
      query = query.where(eq(systemSettings.category, category)) as any
    }

    const settings = await query

    // Mask secret values
    const maskedSettings = settings.map(setting => ({
      ...setting,
      value: setting.isSecret ? "••••••••" : setting.value,
      hasValue: !!setting.value
    }))

    return { success: true, data: maskedSettings }
  } catch (error) {
    console.error("Error fetching settings:", error)
    return { success: false, error: "Failed to fetch settings" }
  }
}

// Get a single setting value (for internal use)
export async function getSettingValue(key: string): Promise<string | null> {
  try {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1)

    if (!setting?.value) return null

    // Decrypt if it's a secret
    if (setting.isSecret) {
      return simpleDecrypt(setting.value)
    }
    return setting.value
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error)
    return null
  }
}

// Upsert a setting
export async function saveSetting(data: {
  key: string
  value: string
  description?: string
  category?: string
  isSecret?: boolean
}) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized - Admin only" }
    }

    const { key, value, description, category = "general", isSecret = false } = data

    // Encrypt secret values
    const storedValue = isSecret ? simpleEncrypt(value) : value

    // Check if setting exists
    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1)

    if (existing) {
      // Update
      await db
        .update(systemSettings)
        .set({
          value: storedValue,
          description: description || existing.description,
          category,
          isSecret,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, key))
    } else {
      // Insert
      await db.insert(systemSettings).values({
        key,
        value: storedValue,
        description,
        category,
        isSecret,
        updatedBy: session.user.id,
      })
    }

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Error saving setting:", error)
    return { success: false, error: "Failed to save setting" }
  }
}

// Delete a setting
export async function deleteSetting(key: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await db.delete(systemSettings).where(eq(systemSettings.key, key))

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Error deleting setting:", error)
    return { success: false, error: "Failed to delete setting" }
  }
}

// Test API key validity
export async function testGoogleApiKey(apiKey: string) {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    
    // Simple test prompt
    const result = await model.generateContent("Say 'API key is valid' in exactly those words")
    const text = result.response.text()
    
    return { 
      success: true, 
      message: "Google API key is valid!",
      model: "gemini-2.0-flash"
    }
  } catch (error: any) {
    console.error("API key test failed:", error)
    return { 
      success: false, 
      error: error.message || "Invalid API key or API error" 
    }
  }
}

// Initialize default settings
export async function initializeDefaultSettings() {
  const defaults = [
    {
      key: "GOOGLE_API_KEY",
      description: "Google AI (Gemini) API Key for OCR and chat features",
      category: "ai",
      isSecret: true,
    },
    {
      key: "AI_MODEL",
      value: "gemini-2.0-flash",
      description: "Default AI model to use",
      category: "ai",
      isSecret: false,
    },
    {
      key: "HOSPITAL_NAME",
      value: "Sodo Christian Hospital",
      description: "Hospital name displayed in the app",
      category: "general",
      isSecret: false,
    },
    {
      key: "SUPPORT_EMAIL",
      value: "support@sch-addis.org",
      description: "Support email address",
      category: "general",
      isSecret: false,
    },
  ]

  for (const setting of defaults) {
    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, setting.key))
      .limit(1)

    if (!existing) {
      await db.insert(systemSettings).values(setting)
    }
  }

  return { success: true }
}
