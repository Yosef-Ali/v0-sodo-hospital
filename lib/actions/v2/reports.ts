"use server"

import { db, reports, users } from "@/lib/db"
import { eq, desc, and, gte, lte, sql, or, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"

// --- Schemas ---

const reportStatusEnum = z.enum(["DRAFT", "GENERATED", "PUBLISHED", "ARCHIVED"])
const reportFrequencyEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "ON_DEMAND"])
const reportFormatEnum = z.enum(["PDF", "EXCEL", "CSV", "DASHBOARD"])

export const createReportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: reportFrequencyEnum.default("ON_DEMAND"),
  format: reportFormatEnum.default("PDF"),
  department: z.string().optional(),
  category: z.string().optional(),
  parameters: z.record(z.any()).optional(),
})

export const searchReportSchema = z.object({
  query: z.string().optional(),
  status: reportStatusEnum.optional(),
  category: z.string().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
})

export const deleteReportSchema = z.object({
  id: z.string().uuid(),
})

// --- Actions ---

/**
 * Get all reports with optional filters
 */
export async function getReports(params?: z.infer<typeof searchReportSchema>) {
  try {
    const { query, status, category, limit = 20, offset = 0 } = params || {}

    let queryBuilder = db
      .select({
        report: reports,
        generatedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(reports)
      .leftJoin(users, eq(reports.generatedBy, users.id))

    const conditions = []
    if (status) conditions.push(eq(reports.status, status))
    if (category) conditions.push(eq(reports.category, category))
    // if (query) conditions.push(like(reports.title, `%${query}%`)) // requires import like

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any
    }

    const result = await queryBuilder
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching reports:", error)
    return { success: false, error: "Failed to fetch reports" }
  }
}

/**
 * Create a new report request
 */
export const createReport = createSafeAction(
  createReportSchema,
  async (data, user) => {
    // 1. Create Report Record
    const [newReport] = await db
      .insert(reports)
      .values({
        title: data.title,
        description: data.description,
        frequency: data.frequency,
        format: data.format,
        department: data.department,
        category: data.category,
        parameters: data.parameters || {},
        status: "DRAFT", // Initially draft until generated
        createdBy: user.id,
        generatedBy: user.id,
      })
      .returning()

    revalidatePath("/reports")
    return { success: true, data: newReport }
  },
  { requiredRole: ["ADMIN", "HR_MANAGER", "LOGISTICS"] }
)

/**
 * Update report status (e.g. after generation)
 * INTERNAL USE mostly, but exposed as action for client-side generation flows
 */
export const updateReportStatus = createSafeAction(
  z.object({
    id: z.string().uuid(),
    status: reportStatusEnum,
    fileUrl: z.string().optional(),
    fileSize: z.number().optional(),
  }),
  async (data, user) => {
    const [updated] = await db
      .update(reports)
      .set({
        status: data.status,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        lastGenerated: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reports.id, data.id))
      .returning()

    revalidatePath("/reports")
    return { success: true, data: updated }
  },
  { requiredRole: ["ADMIN", "HR_MANAGER", "LOGISTICS"] }
)

/**
 * Delete a report
 */
export const deleteReport = createSafeAction(
  deleteReportSchema,
  async ({ id }, user) => {
    const [deleted] = await db.delete(reports).where(eq(reports.id, id)).returning()
    revalidatePath("/reports")
    return { success: true, data: deleted }
  },
  { requiredRole: ["ADMIN", "HR_MANAGER"] }
)
