"use server"

import { db, permits, people, checklists, permitHistory, tasksV2, users, type Permit, type NewPermit, type PermitHistory } from "@/lib/db"
import { eq, desc, and, gte, lte, lt, sql, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { gregorianToEC, formatEC } from "@/lib/dates/ethiopian"
import { addDays, subDays } from "date-fns"

export interface PermitStatsSummary {
  total: number
  byStatus: {
    PENDING: number
    SUBMITTED: number
    APPROVED: number
    REJECTED: number
    EXPIRED: number
  }
  byCategory: {
    WORK_PERMIT: number
    RESIDENCE_ID: number
    LICENSE: number
    PIP: number
  }
  trends: {
    PENDING: number
    SUBMITTED: number
    APPROVED: number
    REJECTED: number
    EXPIRED: number
    total: number
  }
  expiringSoonCount: number
  backlogOlderThan30Days: number
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
 * Get a single permit by ID with all related data
 */
export async function getPermitById(permitId: string) {
  try {
    // Get permit with person and checklist
    const permitResult = await db
      .select({
        permit: permits,
        person: people,
        checklist: checklists,
      })
      .from(permits)
      .leftJoin(people, eq(permits.personId, people.id))
      .leftJoin(checklists, eq(permits.checklistId, checklists.id))
      .where(eq(permits.id, permitId))
      .limit(1)

    if (permitResult.length === 0) {
      return { success: false, error: "Permit not found" }
    }

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

    return {
      success: true,
      data: {
        ...permitResult[0],
        history,
        tasks,
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

    const result = await db
      .insert(permits)
      .values({
        ...data,
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

    revalidatePath("/permits")
    revalidatePath(`/people/${data.personId}`)
    revalidatePath("/dashboard")

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
export async function getPermitStats(): Promise<{ success: true; data: PermitStatsSummary } | { success: false; error: string }> {
  try {
    const stats = await db
      .select({
        status: permits.status,
        category: permits.category,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(permits)
      .groupBy(permits.status, permits.category)

    const byStatus = stats.reduce((acc, stat) => {
      acc[stat.status] = (acc[stat.status] || 0) + stat.count
      return acc
    }, {} as Record<string, number>)

    const byCategory = stats.reduce((acc, stat) => {
      acc[stat.category] = (acc[stat.category] || 0) + stat.count
      return acc
    }, {} as Record<string, number>)

    const total = stats.reduce((sum, stat) => sum + stat.count, 0)

    const now = new Date()
    const currentWindowStart = subDays(now, 7)
    const previousWindowStart = subDays(currentWindowStart, 7)

    const currentWindow = await db
      .select({
        status: permits.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(permits)
      .where(and(gte(permits.createdAt, currentWindowStart), lte(permits.createdAt, now)))
      .groupBy(permits.status)

    const previousWindow = await db
      .select({
        status: permits.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(permits)
      .where(and(gte(permits.createdAt, previousWindowStart), lt(permits.createdAt, currentWindowStart)))
      .groupBy(permits.status)

    const toRecord = (rows: { status: string; count: number }[]) =>
      rows.reduce((acc, row) => {
        acc[row.status] = row.count
        return acc
      }, {} as Record<string, number>)

    const currentWindowCounts = toRecord(currentWindow)
    const previousWindowCounts = toRecord(previousWindow)

    const currentWindowTotal = Object.values(currentWindowCounts).reduce((acc, value) => acc + value, 0)
    const previousWindowTotal = Object.values(previousWindowCounts).reduce((acc, value) => acc + value, 0)

    const percentChange = (current: number, previous: number) => {
      if (previous === 0) {
        return current === 0 ? 0 : 100
      }
      return ((current - previous) / previous) * 100
    }

    const expiringSoonResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(permits)
      .where(
        and(
          sql`${permits.dueDate} IS NOT NULL`,
          lte(permits.dueDate, addDays(now, 14)),
          gte(permits.dueDate, now),
          or(eq(permits.status, "PENDING"), eq(permits.status, "SUBMITTED"))
        )
      )
      .limit(1)

    const backlogResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(permits)
      .where(
        and(
          lt(permits.createdAt, subDays(now, 30)),
          or(eq(permits.status, "PENDING"), eq(permits.status, "SUBMITTED"))
        )
      )
      .limit(1)

    const trends = {
      PENDING: percentChange(currentWindowCounts.PENDING || 0, previousWindowCounts.PENDING || 0),
      SUBMITTED: percentChange(currentWindowCounts.SUBMITTED || 0, previousWindowCounts.SUBMITTED || 0),
      APPROVED: percentChange(currentWindowCounts.APPROVED || 0, previousWindowCounts.APPROVED || 0),
      REJECTED: percentChange(currentWindowCounts.REJECTED || 0, previousWindowCounts.REJECTED || 0),
      EXPIRED: percentChange(currentWindowCounts.EXPIRED || 0, previousWindowCounts.EXPIRED || 0),
      total: percentChange(currentWindowTotal, previousWindowTotal),
    }

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
        trends,
        expiringSoonCount: expiringSoonResult[0]?.count || 0,
        backlogOlderThan30Days: backlogResult[0]?.count || 0,
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
