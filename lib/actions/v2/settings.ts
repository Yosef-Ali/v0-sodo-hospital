"use server"

import { db, systemSettings } from "@/lib/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

// Organization settings keys
const ORG_SETTINGS_KEYS = {
  NAME: "org_name",
  EMAIL: "org_email",
  PHONE: "org_phone",
  ADDRESS: "org_address",
  TIMEZONE: "org_timezone",
  LOGO_URL: "org_logo_url",
  USE_ETHIOPIAN_CALENDAR: "use_ethiopian_calendar",
  DUAL_CALENDAR_DISPLAY: "dual_calendar_display",
  PERMIT_EXPIRY_ALERTS: "permit_expiry_alerts",
  ALERT_DAYS_BEFORE: "alert_days_before",
} as const

export interface OrganizationSettings {
  name: string
  email: string
  phone: string
  address: string
  timezone: string
  logoUrl: string | null
  useEthiopianCalendar: boolean
  dualCalendarDisplay: boolean
  permitExpiryAlerts: boolean
  alertDaysBefore: number
}

/**
 * Get all organization settings
 */
export async function getOrganizationSettings(): Promise<{ success: boolean; data?: OrganizationSettings; error?: string }> {
  try {
    const settings = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.category, "organization"))

    const settingsMap: Record<string, string | null> = {}
    settings.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    return {
      success: true,
      data: {
        name: settingsMap[ORG_SETTINGS_KEYS.NAME] || "SODDO Hospital",
        email: settingsMap[ORG_SETTINGS_KEYS.EMAIL] || "",
        phone: settingsMap[ORG_SETTINGS_KEYS.PHONE] || "",
        address: settingsMap[ORG_SETTINGS_KEYS.ADDRESS] || "",
        timezone: settingsMap[ORG_SETTINGS_KEYS.TIMEZONE] || "Africa/Addis_Ababa",
        logoUrl: settingsMap[ORG_SETTINGS_KEYS.LOGO_URL] || null,
        useEthiopianCalendar: settingsMap[ORG_SETTINGS_KEYS.USE_ETHIOPIAN_CALENDAR] === "true",
        dualCalendarDisplay: settingsMap[ORG_SETTINGS_KEYS.DUAL_CALENDAR_DISPLAY] === "true",
        permitExpiryAlerts: settingsMap[ORG_SETTINGS_KEYS.PERMIT_EXPIRY_ALERTS] !== "false",
        alertDaysBefore: parseInt(settingsMap[ORG_SETTINGS_KEYS.ALERT_DAYS_BEFORE] || "30", 10),
      },
    }
  } catch (error) {
    console.error("Error fetching organization settings:", error)
    return { success: false, error: "Failed to fetch settings" }
  }
}

/**
 * Update a single setting
 */
async function upsertSetting(key: string, value: string, userId: string) {
  const existing = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(systemSettings)
      .set({
        value,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(systemSettings.key, key))
  } else {
    await db.insert(systemSettings).values({
      key,
      value,
      category: "organization",
      updatedBy: userId,
    })
  }
}

/**
 * Update organization settings
 */
export async function updateOrganizationSettings(
  data: Partial<OrganizationSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const userId = session.user.id

    // Map settings to database keys
    const updates: Array<{ key: string; value: string }> = []

    if (data.name !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.NAME, value: data.name })
    }
    if (data.email !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.EMAIL, value: data.email })
    }
    if (data.phone !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.PHONE, value: data.phone })
    }
    if (data.address !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.ADDRESS, value: data.address })
    }
    if (data.timezone !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.TIMEZONE, value: data.timezone })
    }
    if (data.logoUrl !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.LOGO_URL, value: data.logoUrl || "" })
    }
    if (data.useEthiopianCalendar !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.USE_ETHIOPIAN_CALENDAR, value: String(data.useEthiopianCalendar) })
    }
    if (data.dualCalendarDisplay !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.DUAL_CALENDAR_DISPLAY, value: String(data.dualCalendarDisplay) })
    }
    if (data.permitExpiryAlerts !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.PERMIT_EXPIRY_ALERTS, value: String(data.permitExpiryAlerts) })
    }
    if (data.alertDaysBefore !== undefined) {
      updates.push({ key: ORG_SETTINGS_KEYS.ALERT_DAYS_BEFORE, value: String(data.alertDaysBefore) })
    }

    // Perform all updates
    for (const update of updates) {
      await upsertSetting(update.key, update.value, userId)
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating organization settings:", error)
    return { success: false, error: "Failed to update settings" }
  }
}

/**
 * Update organization logo
 */
export async function updateOrganizationLogo(
  logoUrl: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    await upsertSetting(ORG_SETTINGS_KEYS.LOGO_URL, logoUrl || "", session.user.id)

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating logo:", error)
    return { success: false, error: "Failed to update logo" }
  }
}
