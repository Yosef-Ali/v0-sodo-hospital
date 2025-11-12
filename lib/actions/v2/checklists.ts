"use server"

import { db, checklists, permits, type Checklist, type NewChecklist } from "@/lib/db"
import { eq, desc, like, sql, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type ChecklistItem = {
  label: string
  required: boolean
  hint?: string
}

// Re-export types for components
export type { Checklist }

/**
 * Get all checklists with optional search
 */
export async function getChecklists(params?: {
  query?: string
  search?: string
  limit?: number
  offset?: number
  activeOnly?: boolean
}) {
  const { query, search, limit = 50, offset = 0, activeOnly = false } = params || {}
  const searchTerm = search || query

  try {
    let queryBuilder = db.select().from(checklists)

    const conditions: any[] = []

    // Search by name
    if (searchTerm) {
      conditions.push(like(checklists.name, `%${searchTerm}%`))
    }

    // Filter active only
    if (activeOnly) {
      conditions.push(eq(checklists.active, true))
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any
    }

    const result = await queryBuilder
      .orderBy(desc(checklists.createdAt))
      .limit(limit)
      .offset(offset)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching checklists:", error)
    return { success: false, error: "Failed to fetch checklists" }
  }
}

/**
 * Get a single checklist by ID
 */
export async function getChecklistById(checklistId: string) {
  try {
    const result = await db
      .select({
        checklist: checklists,
        permitCount: sql<number>`cast(count(${permits.id}) as integer)`,
      })
      .from(checklists)
      .leftJoin(permits, eq(checklists.id, permits.checklistId))
      .where(eq(checklists.id, checklistId))
      .groupBy(checklists.id)
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: "Checklist not found" }
    }

    // Get permits using this checklist
    const relatedPermits = await db
      .select({
        id: permits.id,
        category: permits.category,
        status: permits.status,
        createdAt: permits.createdAt,
      })
      .from(permits)
      .where(eq(permits.checklistId, checklistId))
      .orderBy(desc(permits.createdAt))
      .limit(10)

    return {
      success: true,
      data: {
        ...result[0],
        permits: relatedPermits,
      },
    }
  } catch (error) {
    console.error("Error fetching checklist:", error)
    return { success: false, error: "Failed to fetch checklist" }
  }
}

/**
 * Create a new checklist
 */
export async function createChecklist(data: {
  name: string
  items: ChecklistItem[]
}) {
  try {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: "Checklist name is required" }
    }

    if (!data.items || data.items.length === 0) {
      return { success: false, error: "At least one checklist item is required" }
    }

    // Validate each item
    for (const item of data.items) {
      if (!item.label || item.label.trim().length === 0) {
        return { success: false, error: "All checklist items must have a label" }
      }
      if (typeof item.required !== "boolean") {
        return { success: false, error: "All checklist items must specify if they are required" }
      }
    }

    // Check for duplicate name
    const existing = await db
      .select({ id: checklists.id })
      .from(checklists)
      .where(eq(checklists.name, data.name.trim()))
      .limit(1)

    if (existing.length > 0) {
      return {
        success: false,
        error: "A checklist with this name already exists",
      }
    }

    const result = await db
      .insert(checklists)
      .values({
        name: data.name.trim(),
        items: data.items,
      })
      .returning()

    revalidatePath("/checklists")
    revalidatePath("/permits")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating checklist:", error)
    return { success: false, error: "Failed to create checklist" }
  }
}

/**
 * Update a checklist
 */
export async function updateChecklist(
  checklistId: string,
  data: Partial<{
    name: string
    items: ChecklistItem[]
  }>
) {
  try {
    // Check if checklist exists
    const existing = await db
      .select({ id: checklists.id, name: checklists.name })
      .from(checklists)
      .where(eq(checklists.id, checklistId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Checklist not found" }
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        return { success: false, error: "Checklist name cannot be empty" }
      }

      // Check for duplicate name (excluding current checklist)
      const duplicate = await db
        .select({ id: checklists.id })
        .from(checklists)
        .where(eq(checklists.name, data.name.trim()))
        .limit(1)

      if (duplicate.length > 0 && duplicate[0].id !== checklistId) {
        return {
          success: false,
          error: "A checklist with this name already exists",
        }
      }
    }

    // Validate items if provided
    if (data.items !== undefined) {
      if (data.items.length === 0) {
        return { success: false, error: "At least one checklist item is required" }
      }

      for (const item of data.items) {
        if (!item.label || item.label.trim().length === 0) {
          return { success: false, error: "All checklist items must have a label" }
        }
        if (typeof item.required !== "boolean") {
          return { success: false, error: "All checklist items must specify if they are required" }
        }
      }
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.items !== undefined) updateData.items = data.items

    const result = await db
      .update(checklists)
      .set(updateData)
      .where(eq(checklists.id, checklistId))
      .returning()

    revalidatePath("/checklists")
    revalidatePath(`/checklists/${checklistId}`)
    revalidatePath("/permits")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating checklist:", error)
    return { success: false, error: "Failed to update checklist" }
  }
}

/**
 * Delete a checklist
 */
export async function deleteChecklist(checklistId: string) {
  try {
    // Check if checklist has permits
    const relatedPermits = await db
      .select({ id: permits.id })
      .from(permits)
      .where(eq(permits.checklistId, checklistId))
      .limit(1)

    if (relatedPermits.length > 0) {
      return {
        success: false,
        error: "Cannot delete checklist with associated permits. Please remove or reassign permits first.",
      }
    }

    const result = await db
      .delete(checklists)
      .where(eq(checklists.id, checklistId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Checklist not found" }
    }

    revalidatePath("/checklists")
    revalidatePath("/permits")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting checklist:", error)
    return { success: false, error: "Failed to delete checklist" }
  }
}

/**
 * Duplicate a checklist (create a copy)
 */
export async function duplicateChecklist(checklistId: string, newName?: string) {
  try {
    // Get original checklist
    const original = await db
      .select()
      .from(checklists)
      .where(eq(checklists.id, checklistId))
      .limit(1)

    if (original.length === 0) {
      return { success: false, error: "Checklist not found" }
    }

    const originalChecklist = original[0]
    const copyName = newName || `${originalChecklist.name} (Copy)`

    // Check for duplicate name
    const existing = await db
      .select({ id: checklists.id })
      .from(checklists)
      .where(eq(checklists.name, copyName))
      .limit(1)

    if (existing.length > 0) {
      return {
        success: false,
        error: "A checklist with this name already exists",
      }
    }

    const result = await db
      .insert(checklists)
      .values({
        name: copyName,
        items: originalChecklist.items,
      })
      .returning()

    revalidatePath("/checklists")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error duplicating checklist:", error)
    return { success: false, error: "Failed to duplicate checklist" }
  }
}

/**
 * Get checklist statistics
 */
export async function getChecklistStats() {
  try {
    const stats = await db
      .select({
        checklistId: checklists.id,
        checklistName: checklists.name,
        permitCount: sql<number>`cast(count(${permits.id}) as integer)`,
      })
      .from(checklists)
      .leftJoin(permits, eq(checklists.id, permits.checklistId))
      .groupBy(checklists.id, checklists.name)

    const total = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(checklists)

    return {
      success: true,
      data: {
        total: total[0]?.count || 0,
        byChecklist: stats,
      },
    }
  } catch (error) {
    console.error("Error fetching checklist stats:", error)
    return { success: false, error: "Failed to fetch checklist statistics" }
  }
}

/**
 * Search checklists by name or item content
 */
export async function searchChecklists(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return { success: true, data: [] }
    }

    const result = await db
      .select({
        checklist: checklists,
        permitCount: sql<number>`cast(count(${permits.id}) as integer)`,
      })
      .from(checklists)
      .leftJoin(permits, eq(checklists.id, permits.checklistId))
      .where(like(checklists.name, `%${query.trim()}%`))
      .groupBy(checklists.id)
      .orderBy(desc(checklists.createdAt))
      .limit(20)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error searching checklists:", error)
    return { success: false, error: "Failed to search checklists" }
  }
}

/**
 * Validate checklist items format
 */
export function validateChecklistItems(items: any[]): {
  valid: boolean
  error?: string
} {
  if (!Array.isArray(items)) {
    return { valid: false, error: "Items must be an array" }
  }

  if (items.length === 0) {
    return { valid: false, error: "At least one item is required" }
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (typeof item !== "object" || item === null) {
      return { valid: false, error: `Item ${i + 1} must be an object` }
    }

    if (typeof item.label !== "string" || item.label.trim().length === 0) {
      return { valid: false, error: `Item ${i + 1} must have a non-empty label` }
    }

    if (typeof item.required !== "boolean") {
      return { valid: false, error: `Item ${i + 1} must have a boolean required field` }
    }

    if (item.hint !== undefined && typeof item.hint !== "string") {
      return { valid: false, error: `Item ${i + 1} hint must be a string if provided` }
    }
  }

  return { valid: true }
}
