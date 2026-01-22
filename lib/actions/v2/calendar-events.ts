"use server"

import { db } from "@/lib/db"
import { calendarEvents, permits, people, tasksV2, type NewCalendarEvent, type CalendarEvent } from "@/lib/db/schema"
import { eq, and, gte, lte, isNotNull, ne } from "drizzle-orm"
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

/**
 * Sync an entity (Task, Permit, etc.) to the calendar
 */
export async function syncEntityToCalendar(
  entityType: string,
  entityId: string,
  data: {
    title: string
    description?: string
    date: Date
    type: "permit" | "deadline" | "meeting" | "interview" | "other"
    relatedPersonId?: string
    relatedPermitId?: string
  }
) {
  try {
    // Check if event already exists for this entity
    const existing = await db.query.calendarEvents.findFirst({
      where: and(
        eq(calendarEvents.entityType, entityType),
        eq(calendarEvents.entityId, entityId)
      )
    })

    if (existing) {
      // Update existing event
      await db
        .update(calendarEvents)
        .set({
          title: data.title,
          description: data.description,
          startDate: data.date,
          endDate: data.date,
          type: data.type,
          relatedPersonId: data.relatedPersonId,
          relatedPermitId: data.relatedPermitId,
          updatedAt: new Date()
        })
        .where(eq(calendarEvents.id, existing.id))
    } else {
      // Create new event
      await db.insert(calendarEvents).values({
        title: data.title,
        description: data.description,
        startDate: data.date,
        endDate: data.date,
        type: data.type,
        entityType,
        entityId,
        relatedPersonId: data.relatedPersonId,
        relatedPermitId: data.relatedPermitId,
        allDay: true
      })
    }

    revalidatePath("/calendar")
    return { success: true }
  } catch (error) {
    console.error("Error syncing to calendar:", error)
    return { success: false, error: "Failed to sync to calendar" }
  }
}

/**
 * Delete calendar event by entity (Task, Permit, etc.)
 */
export async function deleteEntityFromCalendar(entityType: string, entityId: string) {
  try {
    const deleted = await db.delete(calendarEvents).where(
      and(
        eq(calendarEvents.entityType, entityType),
        eq(calendarEvents.entityId, entityId)
      )
    )
    revalidatePath("/calendar")
    return { success: true }
  } catch (error) {
    console.error("Error deleting entity from calendar:", error)
    return { success: false, error: "Failed to delete from calendar" }
  }
}

/**
 * Generate calendar events for expiring permits
 * Run this via Cron or periodically
 */
export async function generateExpiryCalendarEvents() {
  try {
    // Fetch all active permits with due dates
    const allPermits = await db
      .select({
        permit: permits,
        person: people
      })
      .from(permits)
      .leftJoin(people, eq(permits.personId, people.id))
      .where(
        and(
          isNotNull(permits.dueDate),
          ne(permits.status, "EXPIRED")
        )
      )

    let count = 0

    for (const { permit, person } of allPermits) {
      if (!permit.dueDate) continue

      const dueDate = new Date(permit.dueDate)
      // Determine status based on dates
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Only care about upcoming expirations or just expired (within last 7 days)
      if (diffDays <= 30 && diffDays >= -7) {
        let title = `Expiry: ${permit.category.replace(/_/g, " ")}`
        let type: "permit" | "deadline" = "permit"

        if (diffDays < 0) {
          title = `EXPIRED: ${permit.category.replace(/_/g, " ")}`
          type = "deadline"
        } else if (diffDays <= 7) {
          title = `URGENT: ${permit.category.replace(/_/g, " ")} expires in ${diffDays} days`
        }

        if (person) {
          title += ` - ${person.firstName} ${person.lastName}`
        }

        await syncEntityToCalendar(
          "permit_expiry",
          permit.id,
          {
            title,
            description: `Permit ID: ${permit.id}\nStatus: ${permit.status}\nDue: ${dueDate.toLocaleDateString()}`,
            date: dueDate,
            type: type,
            relatedPermitId: permit.id,
            relatedPersonId: permit.personId || undefined
          }
        )
        count++
      }
    }

    return { success: true, count }
  } catch (error) {
    console.error("Error generating expiry events:", error)
    return { success: false, error: "Failed to generate events" }
  }
}

/**
 * Sync a task to the calendar
 */
export async function syncTaskToCalendar(taskId: string) {
  try {
    const taskResult = await db
      .select({
        task: tasksV2,
        permit: permits
      })
      .from(tasksV2)
      .leftJoin(permits, eq(tasksV2.permitId, permits.id))
      .where(eq(tasksV2.id, taskId))
      .limit(1)

    if (taskResult.length === 0) return { success: false, error: "Task not found" }

    const { task, permit } = taskResult[0]

    // If task has no due date, remove from calendar if it exists
    if (!task.dueDate) {
      await db.delete(calendarEvents).where(
        and(
          eq(calendarEvents.entityType, "task"),
          eq(calendarEvents.entityId, taskId)
        )
      )
      return { success: true, action: "removed" }
    }

    const title = `Task: ${task.title}`

    await syncEntityToCalendar(
      "task",
      task.id,
      {
        title,
        description: task.description || "",
        date: task.dueDate,
        type: "deadline",
        relatedPermitId: task.permitId || undefined,
      }
    )

    return { success: true, action: "synced" }
  } catch (error) {
    console.error("Error syncing task to calendar:", error)
    return { success: false, error: "Failed to sync task" }
  }
}
