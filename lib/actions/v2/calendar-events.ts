"use server"

import { db } from "@/lib/db"
import { calendarEvents, permits, people, tasksV2, vehicles, importPermits, companyRegistrations, type NewCalendarEvent, type CalendarEvent } from "@/lib/db/schema"
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
 * Also includes tasks with due dates that may not be in the calendar events table
 */
export async function getCalendarEvents(params?: {
  startDate?: Date
  endDate?: Date
  type?: string
}) {
  try {
    const { startDate, endDate, type } = params || {}

    // 1. Get events from calendarEvents table
    let query = db.select().from(calendarEvents)
    const conditions = []

    if (startDate && endDate) {
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

    const calendarEventsResult = await query.orderBy(calendarEvents.startDate)

    // 2. Get tasks with due dates (to ensure all tasks appear on calendar)
    const taskConditions = [isNotNull(tasksV2.dueDate)]
    if (startDate && endDate) {
      taskConditions.push(gte(tasksV2.dueDate, startDate))
      taskConditions.push(lte(tasksV2.dueDate, endDate))
    }

    const tasksWithDueDates = await db
      .select({
        task: tasksV2,
        permit: permits,
        person: people
      })
      .from(tasksV2)
      .leftJoin(permits, eq(tasksV2.permitId, permits.id))
      .leftJoin(people, eq(permits.personId, people.id))
      .where(and(...taskConditions))

    // 3. Get existing task IDs in calendar events to avoid duplicates
    const existingTaskIds = new Set(
      calendarEventsResult
        .filter(e => e.entityType === "task")
        .map(e => e.entityId)
    )

    // 4. Convert tasks to calendar event format (for those not already in calendar)
    const taskEvents: CalendarEvent[] = tasksWithDueDates
      .filter(({ task }) => !existingTaskIds.has(task.id))
      .map(({ task, permit, person }) => {
        // Build title with status indicator
        let title = ""
        if (task.status === "urgent") {
          title = `🚨 URGENT: ${task.title}`
        } else if (task.priority === "high") {
          title = `⚠️ HIGH: ${task.title}`
        } else {
          title = `Task: ${task.title}`
        }

        // Build description
        const dueDate = new Date(task.dueDate!)
        const today = new Date()
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        let description = task.description || ""
        description += `\n\nStatus: ${task.status?.toUpperCase() || "PENDING"}`
        description += `\nPriority: ${task.priority?.toUpperCase() || "MEDIUM"}`
        description += `\nDue: ${dueDate.toLocaleDateString()}`

        if (daysUntilDue < 0) {
          description += `\n⚠️ OVERDUE by ${Math.abs(daysUntilDue)} day(s)`
        } else if (daysUntilDue === 0) {
          description += `\n⚠️ DUE TODAY`
        } else if (daysUntilDue <= 7) {
          description += `\n⏰ Due in ${daysUntilDue} day(s)`
        }

        if (person) {
          description += `\nPerson: ${person.firstName} ${person.lastName}`
        }

        return {
          id: `task-${task.id}`,
          title,
          description: description.trim(),
          type: "deadline" as const,
          startDate: task.dueDate!,
          endDate: task.dueDate!,
          startTime: null,
          endTime: null,
          allDay: true,
          location: null,
          relatedPersonId: person?.id || null,
          relatedPermitId: task.permitId || null,
          entityType: "task",
          entityId: task.id,
          createdBy: null,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }
      })

    // 5. Merge and sort all events
    const allEvents = [...calendarEventsResult, ...taskEvents].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

    return {
      success: true,
      data: allEvents,
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
    const [existing] = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.entityType, entityType),
          eq(calendarEvents.entityId, entityId)
        )
      )
      .limit(1)

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
    await db.delete(calendarEvents).where(
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
 * Get all items expiring within specified days
 * Returns permits, person documents, vehicles, imports, companies with upcoming expirations
 */
export async function getExpiringItems(daysAhead: number = 30) {
  try {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const expiringItems: Array<{
      id: string
      type: "permit" | "passport" | "work_permit" | "residence_id" | "medical_license" | "vehicle" | "import" | "company"
      title: string
      entityName: string
      expiryDate: Date
      daysRemaining: number
      status: "expired" | "urgent" | "warning" | "upcoming"
      entityId?: string
      personId?: string
    }> = []

    // 1. Get expiring permits
    const expiringPermits = await db
      .select({
        permit: permits,
        person: people
      })
      .from(permits)
      .leftJoin(people, eq(permits.personId, people.id))
      .where(
        and(
          isNotNull(permits.dueDate),
          lte(permits.dueDate, futureDate),
          ne(permits.status, "EXPIRED")
        )
      )

    for (const { permit, person } of expiringPermits) {
      if (!permit.dueDate) continue
      const dueDate = new Date(permit.dueDate)
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      expiringItems.push({
        id: permit.id,
        type: "permit",
        title: permit.category.replace(/_/g, " "),
        entityName: person ? `${person.firstName} ${person.lastName}` : "Unknown",
        expiryDate: dueDate,
        daysRemaining: diffDays,
        status: diffDays < 0 ? "expired" : diffDays <= 7 ? "urgent" : diffDays <= 14 ? "warning" : "upcoming",
        personId: permit.personId || undefined
      })
    }

    // 2. Get people with expiring documents (passport, work permit, residence ID, medical license)
    const peopleWithExpiry = await db
      .select()
      .from(people)
      .where(
        and(
          isNotNull(people.id),
          // At least one expiry date exists and is within range
        )
      )

    for (const person of peopleWithExpiry) {
      const personName = `${person.firstName} ${person.lastName}`

      // Check passport expiry
      if (person.passportExpiryDate) {
        const expiryDate = new Date(person.passportExpiryDate)
        if (expiryDate <= futureDate) {
          const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          expiringItems.push({
            id: `passport-${person.id}`,
            type: "passport",
            title: "Passport",
            entityName: personName,
            expiryDate,
            daysRemaining: diffDays,
            status: diffDays < 0 ? "expired" : diffDays <= 7 ? "urgent" : diffDays <= 14 ? "warning" : "upcoming",
            personId: person.id
          })
        }
      }

      // Check work permit expiry
      if (person.workPermitExpiryDate) {
        const expiryDate = new Date(person.workPermitExpiryDate)
        if (expiryDate <= futureDate) {
          const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          expiringItems.push({
            id: `workpermit-${person.id}`,
            type: "work_permit",
            title: "Work Permit",
            entityName: personName,
            expiryDate,
            daysRemaining: diffDays,
            status: diffDays < 0 ? "expired" : diffDays <= 7 ? "urgent" : diffDays <= 14 ? "warning" : "upcoming",
            personId: person.id
          })
        }
      }

      // Check residence ID expiry
      if (person.residenceIdExpiryDate) {
        const expiryDate = new Date(person.residenceIdExpiryDate)
        if (expiryDate <= futureDate) {
          const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          expiringItems.push({
            id: `residenceid-${person.id}`,
            type: "residence_id",
            title: "Residence ID",
            entityName: personName,
            expiryDate,
            daysRemaining: diffDays,
            status: diffDays < 0 ? "expired" : diffDays <= 7 ? "urgent" : diffDays <= 14 ? "warning" : "upcoming",
            personId: person.id
          })
        }
      }

      // Check medical license expiry
      if (person.medicalLicenseExpiryDate) {
        const expiryDate = new Date(person.medicalLicenseExpiryDate)
        if (expiryDate <= futureDate) {
          const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          expiringItems.push({
            id: `medicallicense-${person.id}`,
            type: "medical_license",
            title: "Medical License",
            entityName: personName,
            expiryDate,
            daysRemaining: diffDays,
            status: diffDays < 0 ? "expired" : diffDays <= 7 ? "urgent" : diffDays <= 14 ? "warning" : "upcoming",
            personId: person.id
          })
        }
      }
    }

    // 3. Get expiring vehicles
    const expiringVehicles = await db
      .select()
      .from(vehicles)
      .where(
        and(
          isNotNull(vehicles.dueDate),
          lte(vehicles.dueDate, futureDate)
        )
      )

    for (const vehicle of expiringVehicles) {
      if (!vehicle.dueDate) continue
      const dueDate = new Date(vehicle.dueDate)
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      expiringItems.push({
        id: vehicle.id,
        type: "vehicle",
        title: vehicle.category || "Vehicle Service",
        entityName: vehicle.plateNumber || vehicle.title || "Unknown Vehicle",
        expiryDate: dueDate,
        daysRemaining: diffDays,
        status: diffDays < 0 ? "expired" : diffDays <= 7 ? "urgent" : diffDays <= 14 ? "warning" : "upcoming",
        entityId: vehicle.id
      })
    }

    // 4. Get expiring imports
    const expiringImports = await db
      .select()
      .from(importPermits)
      .where(
        and(
          isNotNull(importPermits.dueDate),
          lte(importPermits.dueDate, futureDate)
        )
      )

    for (const imp of expiringImports) {
      if (!imp.dueDate) continue
      const dueDate = new Date(imp.dueDate)
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      expiringItems.push({
        id: imp.id,
        type: "import",
        title: imp.category || "Import Permit",
        entityName: imp.title || "Unknown Import",
        expiryDate: dueDate,
        daysRemaining: diffDays,
        status: diffDays < 0 ? "expired" : diffDays <= 7 ? "urgent" : diffDays <= 14 ? "warning" : "upcoming",
        entityId: imp.id
      })
    }

    // 5. Get expiring company registrations
    const expiringCompanies = await db
      .select()
      .from(companyRegistrations)
      .where(
        and(
          isNotNull(companyRegistrations.dueDate),
          lte(companyRegistrations.dueDate, futureDate)
        )
      )

    for (const company of expiringCompanies) {
      if (!company.dueDate) continue
      const dueDate = new Date(company.dueDate)
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      expiringItems.push({
        id: company.id,
        type: "company",
        title: "Company Registration",
        entityName: company.companyName || company.title || "Unknown Company",
        expiryDate: dueDate,
        daysRemaining: diffDays,
        status: diffDays < 0 ? "expired" : diffDays <= 7 ? "urgent" : diffDays <= 14 ? "warning" : "upcoming",
        entityId: company.id
      })
    }

    // Sort by days remaining (most urgent first)
    expiringItems.sort((a, b) => a.daysRemaining - b.daysRemaining)

    return { success: true, data: expiringItems }
  } catch (error) {
    console.error("Error fetching expiring items:", error)
    return { success: false, error: "Failed to fetch expiring items", data: [] }
  }
}

/**
 * Generate calendar events for ALL expiring items (permits, documents, vehicles, imports, companies)
 * Run this via Cron or periodically to keep calendar in sync
 */
export async function syncAllExpirationsToCalendar() {
  try {
    const result = await getExpiringItems(30)
    if (!result.success || !result.data) {
      return { success: false, error: "Failed to fetch expiring items" }
    }

    let count = 0

    for (const item of result.data) {
      let title = ""
      const type: "permit" | "deadline" = item.status === "expired" ? "deadline" : "permit"

      if (item.status === "expired") {
        title = `EXPIRED: ${item.title} - ${item.entityName}`
      } else if (item.status === "urgent") {
        title = `URGENT: ${item.title} expires in ${item.daysRemaining} days - ${item.entityName}`
      } else {
        title = `Expiry: ${item.title} - ${item.entityName}`
      }

      await syncEntityToCalendar(
        `expiry_${item.type}`,
        item.id,
        {
          title,
          description: `${item.title} for ${item.entityName}\nExpiry Date: ${item.expiryDate.toLocaleDateString()}\nDays Remaining: ${item.daysRemaining}`,
          date: item.expiryDate,
          type,
          relatedPersonId: item.personId
        }
      )
      count++
    }

    return { success: true, count }
  } catch (error) {
    console.error("Error syncing expirations to calendar:", error)
    return { success: false, error: "Failed to sync expirations" }
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
        permit: permits,
        person: people
      })
      .from(tasksV2)
      .leftJoin(permits, eq(tasksV2.permitId, permits.id))
      .leftJoin(people, eq(permits.personId, people.id))
      .where(eq(tasksV2.id, taskId))
      .limit(1)

    if (taskResult.length === 0) return { success: false, error: "Task not found" }

    const { task, permit, person } = taskResult[0]

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

    // Build title with status indicator
    let title = ""
    if (task.status === "urgent") {
      title = `🚨 URGENT: ${task.title}`
    } else if (task.priority === "high") {
      title = `⚠️ HIGH: ${task.title}`
    } else {
      title = `Task: ${task.title}`
    }

    // Build detailed description
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    let description = task.description || ""
    description += `\n\n--- Task Details ---`
    description += `\nStatus: ${task.status?.toUpperCase() || "PENDING"}`
    description += `\nPriority: ${task.priority?.toUpperCase() || "MEDIUM"}`
    description += `\nDue Date: ${dueDate.toLocaleDateString()}`

    if (daysUntilDue < 0) {
      description += `\n⚠️ OVERDUE by ${Math.abs(daysUntilDue)} day(s)`
    } else if (daysUntilDue === 0) {
      description += `\n⚠️ DUE TODAY`
    } else if (daysUntilDue <= 7) {
      description += `\n⏰ Due in ${daysUntilDue} day(s)`
    }

    if (person) {
      description += `\nPerson: ${person.firstName} ${person.lastName}`
    }
    if (permit) {
      description += `\nPermit: ${permit.category?.replace(/_/g, " ")}`
    }

    await syncEntityToCalendar(
      "task",
      task.id,
      {
        title,
        description: description.trim(),
        date: task.dueDate,
        type: "deadline",
        relatedPermitId: task.permitId || undefined,
        relatedPersonId: person?.id
      }
    )

    return { success: true, action: "synced" }
  } catch (error) {
    console.error("Error syncing task to calendar:", error)
    return { success: false, error: "Failed to sync task" }
  }
}
