"use server"

import { db, permits, people, checklists, permitHistory, tasksV2, users, documentsV2, vehicles, importPermits, permitChecklistItems, type Permit } from "@/lib/db"
import { eq, desc, and, gte, lte, sql, or, like, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { gregorianToEC, formatEC } from "@/lib/dates/ethiopian"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"

// --- Schemas ---

const permitCategoryEnum = z.enum(["WORK_PERMIT", "RESIDENCE_ID", "MEDICAL_LICENSE", "PIP", "CUSTOMS", "CAR_BOLO_INSURANCE"])
const permitStatusEnum = z.enum(["PENDING", "SUBMITTED", "APPROVED", "REJECTED", "EXPIRED"])

const createPermitSchema = z.object({
  category: permitCategoryEnum,
  personId: z.string().uuid(),
  dueDate: z.coerce.date().optional(),
  checklistId: z.string().uuid().optional(),
  notes: z.string().optional(),
  createdById: z.string().uuid().optional(),
  subType: z.enum(["NEW", "RENEWAL", "OTHER"]).optional(),
})

const updatePermitSchema = z.object({
  id: z.string().uuid(),
  dueDate: z.coerce.date().optional(),
  checklistId: z.string().uuid().optional(),
  notes: z.string().optional(),
  subType: z.enum(["NEW", "RENEWAL", "OTHER"]).optional(),
})

const transitionStatusSchema = z.object({
  permitId: z.string().uuid(),
  toStatus: permitStatusEnum,
  notes: z.string().optional(),
})

const deletePermitSchema = z.object({
  id: z.string().uuid(),
})

const searchSchema = z.object({
  category: permitCategoryEnum.optional(),
  status: permitStatusEnum.optional(),
  personId: z.string().uuid().optional(),
  dueBefore: z.coerce.date().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
})

// --- Helpers ---

async function generateTicketNumber(category: string): Promise<string> {
  const prefixMap: Record<string, string> = {
    WORK_PERMIT: "WRK",
    RESIDENCE_ID: "RES",
    MEDICAL_LICENSE: "LIC",
    PIP: "PIP",
    CUSTOMS: "CUS",
    CAR_BOLO_INSURANCE: "CAR",
  }
  const prefix = prefixMap[category] || "GEN"
  const year = new Date().getFullYear()
  const pattern = `${prefix}-${year}-%`

  const latestTickets = await db
    .select({ ticketNumber: permits.ticketNumber })
    .from(permits)
    .where(like(permits.ticketNumber, pattern))
    .orderBy(desc(permits.ticketNumber))
    .limit(1)

  let sequence = 1
  if (latestTickets.length > 0 && latestTickets[0].ticketNumber) {
    const parts = latestTickets[0].ticketNumber.split('-')
    if (parts.length === 3) {
      const lastSequence = parseInt(parts[2], 10)
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1
      }
    }
  }

  return `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`
}

// --- Actions ---

/**
 * Get all permits with optional filters
 */
export async function getPermits(params?: z.infer<typeof searchSchema>) {
  try {
    const { category, status, personId, dueBefore, limit = 50, offset = 0 } = params || {}

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
  } catch (error: any) {
    console.error("Error fetching permits:", error)
    const { isConnectionError } = await import("@/lib/db/error-utils")
    if (isConnectionError(error)) {
      return { success: false, error: "Database connection failed. SSH tunnel down?" }
    }
    return { success: false, error: "Failed to fetch permits" }
  }
}

/**
 * Get a single permit by ID or ticket number
 */
export async function getPermitById(permitIdOrTicket: string) {
  try {
    const isUUID = permitIdOrTicket.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    const isTicket = permitIdOrTicket.match(/^[A-Z]{3}-\d{4}-\d{4}$/i)

    let query = db
      .select({
        permit: permits,
        person: people,
        checklist: checklists,
      })
      .from(permits)
      .leftJoin(people, eq(permits.personId, people.id))
      .leftJoin(checklists, eq(permits.checklistId, checklists.id))

    if (isUUID) {
      query = query.where(eq(permits.id, permitIdOrTicket)) as any
    } else if (isTicket) {
      query = query.where(eq(permits.ticketNumber, permitIdOrTicket.toUpperCase())) as any
    } else {
      return { success: false, error: "Invalid permit ID format" }
    }

    const permitResult = await query.limit(1)

    if (permitResult.length === 0) {
      return { success: false, error: "Permit not found" }
    }

    const permitId = permitResult[0].permit.id

    // Parallel related data fetch
    const [history, tasks, documents] = await Promise.all([
      db.select({
        history: permitHistory,
        user: { id: users.id, name: users.name, email: users.email },
      }).from(permitHistory).leftJoin(users, eq(permitHistory.changedBy, users.id)).where(eq(permitHistory.permitId, permitId)).orderBy(desc(permitHistory.changedAt)),

      db.select({
        task: tasksV2,
        assignee: { id: users.id, name: users.name },
      }).from(tasksV2).leftJoin(users, eq(tasksV2.assigneeId, users.id)).where(eq(tasksV2.permitId, permitId)).orderBy(desc(tasksV2.createdAt)),

      permitResult[0].permit.ticketNumber
        ? db.select().from(documentsV2).where(eq(documentsV2.number, permitResult[0].permit.ticketNumber)).orderBy(desc(documentsV2.createdAt))
        : Promise.resolve([])
    ])

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
 * Create a new permit (Atomic Transaction)
 */
export const createPermit = createSafeAction(
  createPermitSchema,
  async (data, user) => {
    // 1. Validate person exists
    const person = await db.select({ id: people.id }).from(people).where(eq(people.id, data.personId)).limit(1)
    if (person.length === 0) return { success: false, error: "Person not found" }

    // 2. Check for duplicate active permit (same category, person, pending/submitted)
    const existing = await db.select({ id: permits.id }).from(permits)
      .where(and(
        eq(permits.personId, data.personId),
        eq(permits.category, data.category),
        or(eq(permits.status, "PENDING"), eq(permits.status, "SUBMITTED"))
      )).limit(1)

    if (existing.length > 0) return { success: false, error: `Active ${data.category} application already exists`, errorCode: "DUPLICATE_PERMIT" }

    // 3. Transaction
    const newPermit = await db.transaction(async (tx) => {
      let dueDateEC: string | undefined
      if (data.dueDate) {
        dueDateEC = formatEC(gregorianToEC(data.dueDate), 'en', 'iso')
      }

      const ticketNumber = await generateTicketNumber(data.category)

      // Create Permit
      const [permit] = await tx.insert(permits).values({
        category: data.category,
        personId: data.personId,
        dueDate: data.dueDate,
        dueDateEC,
        checklistId: data.checklistId,
        notes: data.notes,
        subType: data.subType,
        ticketNumber,
        status: "PENDING",
      }).returning()

      // Create History
      await tx.insert(permitHistory).values({
        permitId: permit.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        changedBy: user.id || data.createdById || "", // Fallback if user.id empty (unlikely with SafeAction)
        notes: "Permit created",
      })

      return permit
    })

    revalidatePath("/permits")
    revalidatePath(`/people/${data.personId}`)
    revalidatePath("/dashboard")

    return { success: true, data: newPermit }
  }
)

/**
 * Update a permit
 */
export const updatePermit = createSafeAction(
  updatePermitSchema,
  async (data, user) => {
    const { id, ...updateData } = data

    const existing = await db.select().from(permits).where(eq(permits.id, id)).limit(1)
    if (existing.length === 0) return { success: false, error: "Permit not found" }

    const dbUpdateData: any = { ...updateData, updatedAt: new Date() }

    if (data.dueDate) {
      dbUpdateData.dueDateEC = formatEC(gregorianToEC(data.dueDate), 'en', 'iso')
    }

    // Ensure ticket number exists
    if (!existing[0].ticketNumber) {
      dbUpdateData.ticketNumber = await generateTicketNumber(existing[0].category)
    }

    const [updated] = await db.update(permits).set(dbUpdateData).where(eq(permits.id, id)).returning()

    revalidatePath("/permits")
    revalidatePath(`/permits/${id}`)
    revalidatePath(`/people/${existing[0].personId}`)

    return { success: true, data: updated }
  }
)

/**
 * Transition permit status
 */
export const transitionPermitStatus = createSafeAction(
  transitionStatusSchema,
  async ({ permitId, toStatus, notes }, user) => {
    return await db.transaction(async (tx) => {
      const current = await tx.select().from(permits).where(eq(permits.id, permitId)).limit(1)
      if (current.length === 0) throw new Error("Permit not found")

      const fromStatus = current[0].status

      const validTransitions: Record<string, string[]> = {
        PENDING: ["SUBMITTED", "REJECTED"],
        SUBMITTED: ["APPROVED", "REJECTED", "PENDING"],
        APPROVED: ["EXPIRED"],
        REJECTED: ["PENDING"],
        EXPIRED: ["PENDING"],
      }

      if (!validTransitions[fromStatus]?.includes(toStatus)) {
        throw new Error(`Invalid transition from ${fromStatus} to ${toStatus}`)
      }

      // Update Status
      const [updated] = await tx.update(permits)
        .set({ status: toStatus, updatedAt: new Date() })
        .where(eq(permits.id, permitId))
        .returning()

      // Log History
      await tx.insert(permitHistory).values({
        permitId,
        fromStatus,
        toStatus,
        changedBy: user.id || "",
        notes: notes || `Status changed from ${fromStatus} to ${toStatus}`,
      })

      return updated
    }).then((res) => {
      revalidatePath("/permits")
      revalidatePath(`/permits/${permitId}`)
      return { success: true, data: res }
    }).catch((err) => {
      return { success: false, error: err.message }
    })
  }
)

/**
 * Delete a permit (Atomic Transaction)
 */
export const deletePermit = createSafeAction(
  deletePermitSchema,
  async ({ id }, user) => {
    // Only Admin can delete?
    // if (user.role !== 'ADMIN') return { success: false, error: "Unauthorized" }

    return await db.transaction(async (tx) => {
      // Check for tasks
      const tasks = await tx.select({ id: tasksV2.id }).from(tasksV2).where(eq(tasksV2.permitId, id)).limit(1)
      if (tasks.length > 0) throw new Error("Cannot delete permit with associated tasks. Please remove tasks first.")

      // Delete Checklist Items
      await tx.delete(permitChecklistItems).where(eq(permitChecklistItems.permitId, id))

      // Delete History
      await tx.delete(permitHistory).where(eq(permitHistory.permitId, id))

      // Delete Permit
      const [deleted] = await tx.delete(permits).where(eq(permits.id, id)).returning()

      if (!deleted) throw new Error("Permit not found")

      return deleted
    }).then((res) => {
      revalidatePath("/permits")
      revalidatePath("/dashboard")
      return { success: true, data: res }
    }).catch((err) => {
      return { success: false, error: err.message }
    })
  },
  { requiredRole: ["ADMIN", "HR_MANAGER"] }
)

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
          or(eq(permits.status, "PENDING"), eq(permits.status, "SUBMITTED"), eq(permits.status, "APPROVED"))
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
    const permitStats = await db.select({
      status: permits.status,
      category: permits.category,
      count: sql<number>`cast(count(*) as integer)`,
    }).from(permits).groupBy(permits.status, permits.category)

    const vehicleTotal = (await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(vehicles))[0]?.count || 0
    const importTotal = (await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(importPermits))[0]?.count || 0

    const byStatus: Record<string, number> = {}
    const byCategory: Record<string, number> = {}

    permitStats.forEach(stat => {
      byStatus[stat.status] = (byStatus[stat.status] || 0) + stat.count
      byCategory[stat.category] = (byCategory[stat.category] || 0) + stat.count
    })

    const permitTotal = Object.values(byCategory).reduce((sum, n) => sum + n, 0)
    const total = permitTotal + vehicleTotal + importTotal

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
          pending: byStatus.PENDING || 0, // Fallback
        },
        byCategory: {
          WORK_PERMIT: byCategory.WORK_PERMIT || 0,
          RESIDENCE_ID: byCategory.RESIDENCE_ID || 0,
          LICENSE: byCategory.LICENSE || 0, // Should be MEDICAL_LICENSE but keeping for API compat
          MEDICAL_LICENSE: byCategory.MEDICAL_LICENSE || 0,
          PIP: byCategory.PIP || 0,
          VEHICLE: vehicleTotal,
          IMPORT: importTotal,
        },
      },
    }
  } catch (error: any) {
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

/**
 * Backfill missing ticket numbers
 */
export async function backfillPermitTicketNumbers() {
  try {
    const permitsWithoutTickets = await db
      .select({ id: permits.id, category: permits.category })
      .from(permits)
      .where(sql`${permits.ticketNumber} IS NULL`)

    if (permitsWithoutTickets.length === 0) return { success: true, message: "No updates needed", updated: 0 }

    let updated = 0
    for (const permit of permitsWithoutTickets) {
      if (permit.category) {
        const ticketNumber = await generateTicketNumber(permit.category as any)
        await db.update(permits).set({ ticketNumber, updatedAt: new Date() }).where(eq(permits.id, permit.id))
        updated++
      }
    }
    revalidatePath("/permits")
    return { success: true, message: `Updated ${updated} permits`, updated, total: permitsWithoutTickets.length }
  } catch (error) {
    return { success: false, error: "Failed to backfill ticket numbers" }
  }
}
