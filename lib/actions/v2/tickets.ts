"use server"

import { db } from "@/lib/db"
import { people, vehicles, importPermits, companyRegistrations, permits, permitChecklistItems, permitHistory } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export type TicketDetails = {
  type: string
  id: string
  ticketNumber: string
  title: string
  status: string
  // Common fields
  description?: string | null
  createdAt: Date
  updatedAt: Date
  dueDate?: Date | null
  // Type specific
  category?: string | null
  stage?: string | null
  assigneeId?: string | null
}

/**
 * Fetch details for any entity based on its Ticket Number
 * Supports: FOR (Foreigner), VEH (Vehicle), IMP (Import), CMP (Company)
 */
export async function getTicketDetails(ticketNumber: string): Promise<TicketDetails | null> {
  if (!ticketNumber) return null

  const prefix = ticketNumber.split("-")[0].toUpperCase()

  try {
    if (prefix === "FOR") {
      const result = await db.select().from(people).where(eq(people.ticketNumber, ticketNumber)).limit(1)
      if (result.length > 0) {
        const item = result[0]
        return {
          type: "Foreigner",
          id: item.id,
          ticketNumber: item.ticketNumber || ticketNumber, // Fallback if null in DB but matched? 
          title: `${item.firstName} ${item.lastName}`,
          status: "active", // People don't have status column in schema usually, but let's check
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          description: `Nationality: ${item.nationality}`,
        }
      }
    }
    else if (prefix === "VEH") {
      const result = await db.select().from(vehicles).where(eq(vehicles.ticketNumber, ticketNumber)).limit(1)
      if (result.length > 0) {
        const item = result[0]
        return {
          type: "Vehicle",
          id: item.id,
          ticketNumber: item.ticketNumber!,
          title: item.title,
          status: item.status || "pending",
          description: item.description,
          category: item.category,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          dueDate: item.dueDate,
        }
      }
    }
    else if (prefix === "IMP") {
      const result = await db.select().from(importPermits).where(eq(importPermits.ticketNumber, ticketNumber)).limit(1)
      if (result.length > 0) {
        const item = result[0]
        return {
          type: "Import Permit",
          id: item.id,
          ticketNumber: item.ticketNumber!,
          title: item.title,
          status: item.status || "pending",
          description: item.description,
          category: item.category,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          dueDate: item.dueDate,
        }
      }
    }
    else if (prefix === "CMP") {
      const result = await db.select().from(companyRegistrations).where(eq(companyRegistrations.ticketNumber, ticketNumber)).limit(1)
      if (result.length > 0) {
        const item = result[0]
        return {
          type: "Company Registration",
          id: item.id,
          ticketNumber: item.ticketNumber!,
          title: item.title,
          status: item.status || "pending",
          description: item.description,
          category: item.registrationType, // Map registrationType to category
          stage: item.stage,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          dueDate: item.dueDate,
        }
      }
    }
    else if (prefix === "WRK" || prefix === "RES") {
      const result = await db.select({
        permit: permits,
        person: people
      }).from(permits)
        .where(eq(permits.ticketNumber, ticketNumber))
        .innerJoin(people, eq(permits.personId, people.id))
        .limit(1)

      if (result.length > 0) {
        const { permit, person } = result[0]
        return {
          type: permit.category.replace(/_/g, ' '),
          id: permit.id,
          ticketNumber: permit.ticketNumber!,
          title: `${person.firstName} ${person.lastName}`,
          status: permit.status.toLowerCase(),
          description: permit.notes,
          category: permit.category,
          createdAt: permit.createdAt,
          updatedAt: permit.updatedAt,
          dueDate: permit.dueDate,
        }
      }
    }
  } catch (error) {
    console.error("Error fetching ticket details:", error)
    return null
  }

  return null
}


/**
 * Get detailed permit info with checklist progress and timeline
 * For WRK-* and RES-* permits
 */
export async function getPermitWithDetails(ticketNumber: string) {
  if (!ticketNumber) return null

  const prefix = ticketNumber.split("-")[0].toUpperCase()
  if (prefix !== "WRK" && prefix !== "RES" && prefix !== "LIC") return null

  try {
    // Get permit with person
    const result = await db.select({
      permit: permits,
      person: people
    }).from(permits)
      .where(eq(permits.ticketNumber, ticketNumber))
      .innerJoin(people, eq(permits.personId, people.id))
      .limit(1)

    if (result.length === 0) return null

    const { permit, person } = result[0]

    // Get checklist items
    const checklistItems = await db.select()
      .from(permitChecklistItems)
      .where(eq(permitChecklistItems.permitId, permit.id))

    const completedCount = checklistItems.filter(item => item.completed).length
    const totalCount = checklistItems.length
    const pendingItems = checklistItems.filter(item => !item.completed && item.required)

    // Get history/timeline
    const history = await db.select()
      .from(permitHistory)
      .where(eq(permitHistory.permitId, permit.id))
      .orderBy(desc(permitHistory.changedAt))
      .limit(10)

    return {
      permit: {
        id: permit.id,
        ticketNumber: permit.ticketNumber,
        category: permit.category,
        status: permit.status,
        dueDate: permit.dueDate,
        notes: permit.notes,
        createdAt: permit.createdAt,
        updatedAt: permit.updatedAt,
      },
      person: {
        id: person.id,
        ticketNumber: person.ticketNumber,
        name: `${person.firstName} ${person.lastName}`,
        nationality: person.nationality,
        email: person.email,
        phone: person.phone,
      },
      checklist: {
        completed: completedCount,
        total: totalCount,
        progress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        pendingItems: pendingItems.map(item => ({
          label: item.label,
          required: item.required,
        })),
        allItems: checklistItems.map(item => ({
          label: item.label,
          required: item.required,
          completed: item.completed,
          completedAt: item.completedAt,
        })),
      },
      timeline: history.map(entry => ({
        status: entry.toStatus,
        notes: entry.notes,
        date: entry.changedAt,
      })),
    }
  } catch (error) {
    console.error("Error fetching permit details:", error)
    return null
  }
}

/**
 * Get all permits for a person by their FOR-* ticket number
 */
export async function getPersonPermits(personTicketNumber: string) {
  if (!personTicketNumber) return null

  try {
    // Find person
    const person = await db.query.people.findFirst({
      where: (people, { eq }) => eq(people.ticketNumber, personTicketNumber),
    })

    if (!person) return null

    // Get all permits for this person
    const personPermits = await db.select()
      .from(permits)
      .where(eq(permits.personId, person.id))
      .orderBy(desc(permits.createdAt))

    return {
      person: {
        id: person.id,
        ticketNumber: person.ticketNumber,
        name: `${person.firstName} ${person.lastName}`,
        nationality: person.nationality,
        currentStage: person.currentStage,
      },
      permits: personPermits.map(permit => ({
        ticketNumber: permit.ticketNumber,
        category: permit.category,
        status: permit.status,
        dueDate: permit.dueDate,
        createdAt: permit.createdAt,
      })),
    }
  } catch (error) {
    console.error("Error fetching person permits:", error)
    return null
  }
}
