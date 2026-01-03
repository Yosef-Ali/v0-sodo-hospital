"use server"

import { db, importPermits, type ImportPermit, type NewImportPermit } from "@/lib/db"
import { eq, desc, or, like, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateTicketNumber } from "@/lib/utils"

/**
 * Get all import permits with optional search and pagination
 */
export async function getImports(params?: {
  query?: string
  category?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const { query, category, status, limit = 50, offset = 0 } = params || {}

  try {
    let queryBuilder = db.select().from(importPermits)

    // Apply filters
    const conditions = []
    if (query) {
      conditions.push(
        or(
          like(importPermits.title, `%${query}%`),
          like(importPermits.description, `%${query}%`)
        )
      )
    }
    if (category) {
      conditions.push(eq(importPermits.category, category))
    }
    if (status) {
      conditions.push(eq(importPermits.status, status))
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(conditions[0]) as any
    }

    const result = await queryBuilder
      .orderBy(desc(importPermits.createdAt))
      .limit(limit)
      .offset(offset)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching imports:", error)
    return { success: false, error: "Failed to fetch imports" }
  }
}

/**
 * Get a single import permit by ID
 */
export async function getImportById(importId: string) {
  try {
    const result = await db
      .select()
      .from(importPermits)
      .where(eq(importPermits.id, importId))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: "Import permit not found" }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error fetching import:", error)
    return { success: false, error: "Failed to fetch import details" }
  }
}

/**
 * Create a new import permit
 */
export async function createImport(data: {
  title: string
  description?: string
  category: string // "pip" | "single_window"
  status?: string
  dueDate?: Date
  assigneeId?: string
  supplierName?: string
  supplierCountry?: string
  itemDescription?: string
  estimatedValue?: string
  currency?: string
  importType?: string
  currentStage?: string
  documents?: string[]
  documentSections?: any[]
}) {
  try {
    if (!data.title) {
      return { success: false, error: "Title is required" }
    }
    if (!data.category) {
      return { success: false, error: "Category is required" }
    }

    const result = await db
      .insert(importPermits)
      .values({
        ticketNumber: generateTicketNumber("IMP"),
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status || "pending",
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,

        supplierName: data.supplierName,
        supplierCountry: data.supplierCountry,
        itemDescription: data.itemDescription,
        estimatedValue: data.estimatedValue,
        currency: data.currency || "USD",
        importType: data.importType,
        currentStage: data.currentStage || "SUPPORT_LETTER",
        documents: data.documents || [],
        documentSections: data.documentSections || [],
      })
      .returning()

    revalidatePath("/import")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating import:", error)
    return { success: false, error: "Failed to create import permit" }
  }
}

/**
 * Update an import permit
 */
export async function updateImport(
  importId: string,
  data: Partial<{
    title: string
    description: string
    category: string
    status: string

    assigneeId: string
    supplierName: string
    supplierCountry: string
    itemDescription: string
    estimatedValue: string
    currency: string
    importType: string
    currentStage: string
    documents: string[]
    documentSections: any[]
  }>
) {
  try {
    const existing = await db
      .select({ id: importPermits.id })
      .from(importPermits)
      .where(eq(importPermits.id, importId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Import permit not found" }
    }

    const result = await db
      .update(importPermits)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(importPermits.id, importId))
      .returning()

    revalidatePath("/import")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating import:", error)
    return { success: false, error: "Failed to update import permit" }
  }
}

/**
 * Delete an import permit
 */
export async function deleteImport(importId: string) {
  try {
    const result = await db
      .delete(importPermits)
      .where(eq(importPermits.id, importId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Import permit not found" }
    }

    revalidatePath("/import")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting import:", error)
    return { success: false, error: "Failed to delete import permit" }
  }
}

/**
 * Get import permit statistics
 */
export async function getImportStats() {
  try {
    const total = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(importPermits)

    const pip = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(importPermits)
      .where(eq(importPermits.category, "pip"))

    const singleWindow = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(importPermits)
      .where(eq(importPermits.category, "single_window"))

    const pending = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(importPermits)
      .where(eq(importPermits.status, "pending"))

    const completed = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(importPermits)
      .where(eq(importPermits.status, "completed"))

    return {
      success: true,
      data: {
        total: total[0]?.count || 0,
        pip: pip[0]?.count || 0,
        singleWindow: singleWindow[0]?.count || 0,
        pending: pending[0]?.count || 0,
        completed: completed[0]?.count || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching import stats:", error)
    return { success: false, error: "Failed to fetch statistics" }
  }
}
