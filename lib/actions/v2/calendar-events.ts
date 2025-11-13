"use server"

import { db } from "@/lib/db"
import { calendarEvents, type NewCalendarEvent, type CalendarEvent } from "@/lib/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(data: NewCalendarEvent) {
  try {
    const [event] = await db.insert(calendarEvents).values(data).returning()

    revalidatePath("/calendar")

    return {
      success: true,
      data: event,
    }
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create calendar event",
    }
  }
}

/**
 * Get calendar events for a specific date range
 */
export async function getCalendarEvents(params?: {
  startDate?: Date
  endDate?: Date
  type?: string
}) {
  try {
    const { startDate, endDate, type } = params || {}

    let query = db.select().from(calendarEvents)

    const conditions = []

    if (startDate && endDate) {
      // Get events that fall within or overlap the date range
      conditions.push(
        and(
          gte(calendarEvents.startDate, startDate),
          lte(calendarEvents.startDate, endDate)
        )
      )
    }

    if (type) {
      conditions.push(eq(calendarEvents.type, type as any))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    const events = await query.orderBy(calendarEvents.startDate)

    return {
      success: true,
      data: events,
    }
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch calendar events",
      data: [] as CalendarEvent[],
    }
  }
}

/**
 * Get a single calendar event by ID
 */
export async function getCalendarEvent(id: string) {
  try {
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, id))
      .limit(1)

    if (!event) {
      return {
        success: false,
        error: "Calendar event not found",
      }
    }

    return {
      success: true,
      data: event,
    }
  } catch (error) {
    console.error("Error fetching calendar event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch calendar event",
    }
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(id: string, data: Partial<NewCalendarEvent>) {
  try {
    const [event] = await db
      .update(calendarEvents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(calendarEvents.id, id))
      .returning()

    revalidatePath("/calendar")

    return {
      success: true,
      data: event,
    }
  } catch (error) {
    console.error("Error updating calendar event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update calendar event",
    }
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string) {
  try {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id))

    revalidatePath("/calendar")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete calendar event",
    }
  }
}
