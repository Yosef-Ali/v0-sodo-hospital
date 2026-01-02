"use server"

import { db, vehicles, type Vehicle, type NewVehicle } from "@/lib/db"
import { eq, desc, or, like, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateTicketNumber } from "@/lib/utils"

/**
 * Get all vehicles with optional search and pagination
 */
export async function getVehicles(params?: {
  query?: string
  category?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const { query, category, status, limit = 50, offset = 0 } = params || {}

  try {
    let queryBuilder = db.select().from(vehicles)

    // Apply filters
    const conditions = []
    if (query) {
      conditions.push(
        or(
          like(vehicles.title, `%${query}%`),
          like(vehicles.vehicleInfo, `%${query}%`),
          like(vehicles.plateNumber, `%${query}%`)
        )
      )
    }
    if (category) {
      conditions.push(eq(vehicles.category, category))
    }
    if (status) {
      conditions.push(eq(vehicles.status, status))
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(conditions[0]) as any
    }

    const result = await queryBuilder
      .orderBy(desc(vehicles.createdAt))
      .limit(limit)
      .offset(offset)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return { success: false, error: "Failed to fetch vehicles" }
  }
}

/**
 * Get a single vehicle by ID
 */
export async function getVehicleById(vehicleId: string) {
  try {
    const result = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, vehicleId))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: "Vehicle not found" }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error fetching vehicle:", error)
    return { success: false, error: "Failed to fetch vehicle details" }
  }
}

/**
 * Create a new vehicle record
 */
export async function createVehicle(data: {
  title: string
  description?: string
  category: string // "inspection" | "road_fund" | "insurance" | "road_transport"
  status?: string
  vehicleInfo?: string
  plateNumber?: string
  dueDate?: Date
  assigneeId?: string
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
      .insert(vehicles)
      .values({
        ticketNumber: generateTicketNumber("VEH"),
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status || "pending",
        vehicleInfo: data.vehicleInfo,
        plateNumber: data.plateNumber,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,
        documents: data.documents || [],
        documentSections: data.documentSections || [],
      })
      .returning()

    revalidatePath("/vehicle")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return { success: false, error: "Failed to create vehicle record" }
  }
}

/**
 * Update a vehicle record
 */
export async function updateVehicle(
  vehicleId: string,
  data: Partial<{
    title: string
    description: string
    category: string
    status: string
    vehicleInfo: string
    plateNumber: string
    dueDate: Date
    assigneeId: string
    documents: string[]
    documentSections: any[]
  }>
) {
  try {
    const existing = await db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(eq(vehicles.id, vehicleId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Vehicle not found" }
    }

    const result = await db
      .update(vehicles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vehicles.id, vehicleId))
      .returning()

    revalidatePath("/vehicle")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating vehicle:", error)
    return { success: false, error: "Failed to update vehicle record" }
  }
}

/**
 * Delete a vehicle record
 */
export async function deleteVehicle(vehicleId: string) {
  try {
    const result = await db
      .delete(vehicles)
      .where(eq(vehicles.id, vehicleId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Vehicle not found" }
    }

    revalidatePath("/vehicle")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    return { success: false, error: "Failed to delete vehicle record" }
  }
}

/**
 * Get vehicle statistics
 */
export async function getVehicleStats() {
  try {
    const total = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(vehicles)

    const inspection = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(vehicles)
      .where(eq(vehicles.category, "inspection"))

    const roadFund = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(vehicles)
      .where(eq(vehicles.category, "road_fund"))

    const insurance = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(vehicles)
      .where(eq(vehicles.category, "insurance"))

    const roadTransport = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(vehicles)
      .where(eq(vehicles.category, "road_transport"))

    return {
      success: true,
      data: {
        total: total[0]?.count || 0,
        inspection: inspection[0]?.count || 0,
        roadFund: roadFund[0]?.count || 0,
        insurance: insurance[0]?.count || 0,
        roadTransport: roadTransport[0]?.count || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching vehicle stats:", error)
    return { success: false, error: "Failed to fetch statistics" }
  }
}
