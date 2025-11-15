"use server"

import { db, permits, people, checklists, permitHistory, tasksV2, users, documentsV2, type Permit, type NewPermit, type PermitHistory } from "@/lib/db"
import { eq, desc, and, gte, lte, sql, or, like } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { gregorianToEC, formatEC } from "@/lib/dates/ethiopian"

/**
 * Generate a unique ticket number for a permit
 * Format: {PREFIX}-{YEAR}-{SEQUENCE}
 * Example: WRK-2025-0001, RES-2025-0002, LIC-2025-0003, PIP-2025-0001
 */
async function generateTicketNumber(category: "WORK_PERMIT" | "RESIDENCE_ID" | "LICENSE" | "PIP"): Promise<string> {
  // Get prefix based on category
  const prefixMap = {
    WORK_PERMIT: "WRK",
    RESIDENCE_ID: "RES",
    LICENSE: "LIC",
    PIP: "PIP",
  }
  const prefix = prefixMap[category]

  // Get current year
  const year = new Date().getFullYear()

  // Find the latest ticket number for this category and year
  const pattern = `${prefix}-${year}-%`
  const latestTickets = await db
    .select({ ticketNumber: permits.ticketNumber })
    .from(permits)
    .where(like(permits.ticketNumber, pattern))
    .orderBy(desc(permits.ticketNumber))
    .limit(1)

  let sequence = 1
  if (latestTickets.length > 0 && latestTickets[0].ticketNumber) {
    // Extract sequence number from the latest ticket
    const parts = latestTickets[0].ticketNumber.split('-')
    if (parts.length === 3) {
      const lastSequence = parseInt(parts[2], 10)
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1
      }
    }
  }

  // Format: PREFIX-YEAR-SEQUENCE (padded to 4 digits)
  return `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`
}

/**
 * Get all permits with optional filters and pagination
 */
export async function getPermits(params?: {
  category?: "WORK_PERMIT" | "RESIDENCE_ID" | "LICENSE" | "PIP"
  status?: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "EXPIRED"
  personId?: string
  dueBefore?: Date
  limit?: number
  offset?: number
}) {
  const { category, status, personId, dueBefore, limit = 50, offset = 0 } = params || {}

  try {
    let queryBuilder = db
      .select({
        permit: permits,
        person: {
          id: people.id,
          firstName: people.firstName,
          lastName: people.lastName,
          passportNo: people.passportNo,
        },
        checklist: {
          id: checklists.id,
          name: checklists.name,
        },
      })
      .from(permits)
      .leftJoin(people, eq(permits.personId, people.id))
      .leftJoin(checklists, eq(permits.checklistId, checklists.id))

    // Build where conditions
    const conditions = []
    if (category) conditions.push(eq(permits.category, category))
    if (status) conditions.push(eq(permits.status, status))
    if (personId) conditions.push(eq(permits.personId, personId))
    if (dueBefore) conditions.push(lte(permits.dueDate, dueBefore))

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any
    }

    const result = await queryBuilder
      .orderBy(desc(permits.createdAt))
      .limit(limit)
      .offset(offset)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching permits:", error)
    return { success: false, error: "Failed to fetch permits" }
  }
}

/**
 * Get a single permit by ID or ticket number with all related data
 */
export async function getPermitById(permitIdOrTicket: string) {
  try {
    // Determine if input is UUID or ticket number
    const isUUID = permitIdOrTicket.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    const isTicket = permitIdOrTicket.match(/^[A-Z]{3}-\d{4}-\d{4}$/i)

    // Get permit with person and checklist
    let permitResult
    if (isUUID) {
      permitResult = await db
        .select({
          permit: permits,
          person: people,
          checklist: checklists,
        })
        .from(permits)
        .leftJoin(people, eq(permits.personId, people.id))
        .leftJoin(checklists, eq(permits.checklistId, checklists.id))
        .where(eq(permits.id, permitIdOrTicket))
        .limit(1)
    } else if (isTicket) {
      permitResult = await db
        .select({
          permit: permits,
          person: people,
          checklist: checklists,
        })
        .from(permits)
        .leftJoin(people, eq(permits.personId, people.id))
        .leftJoin(checklists, eq(permits.checklistId, checklists.id))
        .where(eq(permits.ticketNumber, permitIdOrTicket.toUpperCase()))
        .limit(1)
    } else {
      return { success: false, error: "Invalid permit ID or ticket number format" }
    }

    if (permitResult.length === 0) {
      return { success: false, error: "Permit not found" }
    }

    const permitId = permitResult[0].permit.id

    // Get permit history
    const history = await db
      .select({
        history: permitHistory,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(permitHistory)
      .leftJoin(users, eq(permitHistory.changedBy, users.id))
      .where(eq(permitHistory.permitId, permitId))
      .orderBy(desc(permitHistory.changedAt))

    // Get related tasks
    const tasks = await db
      .select({
        task: tasksV2,
        assignee: {
          id: users.id,
          name: users.name,
        },
      })
      .from(tasksV2)
      .leftJoin(users, eq(tasksV2.assigneeId, users.id))
      .where(eq(tasksV2.permitId, permitId))
      .orderBy(desc(tasksV2.createdAt))

    // Get related documents (by ticket number)
    const ticketNumber = permitResult[0].permit.ticketNumber
    const documents = ticketNumber
      ? await db
          .select()
          .from(documentsV2)
          .where(eq(documentsV2.number, ticketNumber))
          .orderBy(desc(documentsV2.createdAt))
      : []

    return {
      success: true,
      data: {
        ...permitResult[0],
        history,
        tasks,
        documents,
      },
    }
  } catch (error) {
    console.error("Error fetching permit:", error)
    return { success: false, error: "Failed to fetch permit details" }
  }
}

/**
 * Create a new permit
 */
export async function createPermit(data: {
  category: "WORK_PERMIT" | "RESIDENCE_ID" | "LICENSE" | "PIP"
  personId: string
  dueDate?: Date
  checklistId?: string
  notes?: string
  createdById?: string
}) {
  try {
    // Validate person exists
    const personExists = await db
      .select({ id: people.id })
      .from(people)
      .where(eq(people.id, data.personId))
      .limit(1)

    if (personExists.length === 0) {
      return { success: false, error: "Person not found" }
    }

    // Validate checklist exists if provided
    if (data.checklistId) {
      const checklistExists = await db
        .select({ id: checklists.id })
        .from(checklists)
        .where(eq(checklists.id, data.checklistId))
        .limit(1)

      if (checklistExists.length === 0) {
        return { success: false, error: "Checklist not found" }
      }
    }

    // Convert due date to Ethiopian calendar for storage
    let dueDateEC: string | undefined
    if (data.dueDate) {
      const ec = gregorianToEC(data.dueDate)
      dueDateEC = formatEC(ec, 'en', 'iso')
    }

    // Auto-generate ticket number
    const ticketNumber = await generateTicketNumber(data.category)

    const result = await db
      .insert(permits)
      .values({
        ...data,
        ticketNumber,
        dueDateEC,
        status: "PENDING",
      })
      .returning()

    // Create initial history entry
    if (data.createdById) {
      await db.insert(permitHistory).values({
        permitId: result[0].id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        changedBy: data.createdById,
        notes: "Permit created",
      })
    }

    // Revalidate cache (only works in Next.js request context)
    try {
      revalidatePath("/permits")
      revalidatePath(`/people/${data.personId}`)
      revalidatePath("/dashboard")
    } catch (error) {
      // Ignore revalidation errors in non-request contexts (e.g., scripts)
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating permit:", error)
    return { success: false, error: "Failed to create permit" }
  }
}

/**
 * Update a permit
 */
export async function updatePermit(
  permitId: string,
  data: Partial<{
    dueDate: Date
    checklistId: string
    notes: string
  }>
) {
  try {
    // Check if permit exists
    const existing = await db
      .select({ id: permits.id, personId: permits.personId })
      .from(permits)
      .where(eq(permits.id, permitId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Permit not found" }
    }

    // Validate checklist if provided
    if (data.checklistId) {
      const checklistExists = await db
        .select({ id: checklists.id })
        .from(checklists)
        .where(eq(checklists.id, data.checklistId))
        .limit(1)

      if (checklistExists.length === 0) {
        return { success: false, error: "Checklist not found" }
      }
    }

    // Convert due date to Ethiopian calendar if provided
    const updateData: any = { ...data, updatedAt: new Date() }
    if (data.dueDate) {
      const ec = gregorianToEC(data.dueDate)
      updateData.dueDateEC = formatEC(ec, 'en', 'iso')
    }

    const result = await db
      .update(permits)
      .set(updateData)
      .where(eq(permits.id, permitId))
      .returning()

    revalidatePath("/permits")
    revalidatePath(`/permits/${permitId}`)
    revalidatePath(`/people/${existing[0].personId}`)

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating permit:", error)
    return { success: false, error: "Failed to update permit" }
  }
}

/**
 * Transition permit status with audit trail
 */
export async function transitionPermitStatus(
  permitId: string,
  toStatus: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "EXPIRED",
  changedBy: string,
  notes?: string
) {
  try {
    // Get current permit
    const current = await db
      .select()
      .from(permits)
      .where(eq(permits.id, permitId))
      .limit(1)

    if (current.length === 0) {
      return { success: false, error: "Permit not found" }
    }

    const fromStatus = current[0].status

    // Validate user exists
    const userExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, changedBy))
      .limit(1)

    if (userExists.length === 0) {
      return { success: false, error: "User not found" }
    }

    // Validate state transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ["SUBMITTED", "REJECTED"],
      SUBMITTED: ["APPROVED", "REJECTED", "PENDING"],
      APPROVED: ["EXPIRED"],
      REJECTED: ["PENDING"],
      EXPIRED: ["PENDING"],
    }

    if (!validTransitions[fromStatus]?.includes(toStatus)) {
      return {
        success: false,
        error: `Invalid transition from ${fromStatus} to ${toStatus}`,
      }
    }

    // Update permit status
    const result = await db
      .update(permits)
      .set({
        status: toStatus,
        updatedAt: new Date(),
      })
      .where(eq(permits.id, permitId))
      .returning()

    // Create history entry
    await db.insert(permitHistory).values({
      permitId,
      fromStatus,
      toStatus,
      changedBy,
      notes: notes || `Status changed from ${fromStatus} to ${toStatus}`,
    })

    revalidatePath("/permits")
    revalidatePath(`/permits/${permitId}`)
    revalidatePath(`/people/${current[0].personId}`)
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error transitioning permit status:", error)
    return { success: false, error: "Failed to transition permit status" }
  }
}

/**
 * Delete a permit
 */
export async function deletePermit(permitId: string) {
  try {
    // Check if permit has tasks
    const tasks = await db
      .select({ id: tasksV2.id })
      .from(tasksV2)
      .where(eq(tasksV2.permitId, permitId))
      .limit(1)

    if (tasks.length > 0) {
      return {
        success: false,
        error: "Cannot delete permit with associated tasks. Please remove tasks first.",
      }
    }

    const result = await db
      .delete(permits)
      .where(eq(permits.id, permitId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Permit not found" }
    }

    revalidatePath("/permits")
    revalidatePath(`/people/${result[0].personId}`)
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting permit:", error)
    return { success: false, error: "Failed to delete permit" }
  }
}

/**
 * Get permits expiring within specified days
 */
export async function getExpiringPermits(daysAhead: number = 30) {
  try {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const result = await db
      .select({
        permit: permits,
        person: {
          id: people.id,
          firstName: people.firstName,
          lastName: people.lastName,
          passportNo: people.passportNo,
        },
      })
      .from(permits)
      .leftJoin(people, eq(permits.personId, people.id))
      .where(
        and(
          sql`${permits.dueDate} IS NOT NULL`,
          lte(permits.dueDate, futureDate),
          gte(permits.dueDate, new Date()),
          or(
            eq(permits.status, "PENDING"),
            eq(permits.status, "SUBMITTED"),
            eq(permits.status, "APPROVED")
          )
        )
      )
      .orderBy(permits.dueDate)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching expiring permits:", error)
    return { success: false, error: "Failed to fetch expiring permits" }
  }
}

/**
 * Get permit statistics
 */
export async function getPermitStats() {
  try {
    const stats = await db
      .select({
        status: permits.status,
        category: permits.category,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(permits)
      .groupBy(permits.status, permits.category)

    // Aggregate by status
    const byStatus = stats.reduce((acc, stat) => {
      acc[stat.status] = (acc[stat.status] || 0) + stat.count
      return acc
    }, {} as Record<string, number>)

    // Aggregate by category
    const byCategory = stats.reduce((acc, stat) => {
      acc[stat.category] = (acc[stat.category] || 0) + stat.count
      return acc
    }, {} as Record<string, number>)

    const total = stats.reduce((sum, stat) => sum + stat.count, 0)

    return {
      success: true,
      data: {
        total,
        byStatus: {
          PENDING: byStatus.PENDING || 0,
          SUBMITTED: byStatus.SUBMITTED || 0,
          APPROVED: byStatus.APPROVED || 0,
          REJECTED: byStatus.REJECTED || 0,
          EXPIRED: byStatus.EXPIRED || 0,
        },
        byCategory: {
          WORK_PERMIT: byCategory.WORK_PERMIT || 0,
          RESIDENCE_ID: byCategory.RESIDENCE_ID || 0,
          LICENSE: byCategory.LICENSE || 0,
          PIP: byCategory.PIP || 0,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching permit stats:", error)
    return { success: false, error: "Failed to fetch permit statistics" }
  }
}

/**
 * Get permit history
 */
export async function getPermitHistory(permitId: string) {
  try {
    const result = await db
      .select({
        history: permitHistory,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(permitHistory)
      .leftJoin(users, eq(permitHistory.changedBy, users.id))
      .where(eq(permitHistory.permitId, permitId))
      .orderBy(desc(permitHistory.changedAt))

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching permit history:", error)
    return { success: false, error: "Failed to fetch permit history" }
  }
}
