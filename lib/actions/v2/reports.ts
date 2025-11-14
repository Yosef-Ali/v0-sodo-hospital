"use server"

import { db } from "@/lib/db"
import { reports, permits, tasksV2, people } from "@/lib/db/schema"
import { count, sql, and, eq, desc, ilike, or } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import { revalidateTag } from "next/cache"

export interface ReportStats {
  total: number
  draft: number
  generated: number
  published: number
  archived: number
  lastUpdated: Date
}

export interface Report {
  id: string
  title: string
  description: string | null
  status: "DRAFT" | "GENERATED" | "PUBLISHED" | "ARCHIVED"
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ON_DEMAND"
  format: "PDF" | "EXCEL" | "CSV" | "DASHBOARD"
  department: string | null
  category: string | null
  lastGenerated: Date | null
  generatedBy: string | null
  fileUrl: string | null
  fileSize: number | null
  parameters: Record<string, any>
  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}

// Get all reports with optional filtering
export async function getReports(params?: {
  query?: string
  status?: string
  limit?: number
}) {
  try {
    const { query, status, limit = 100 } = params || {}

    let conditions = []

    if (query) {
      conditions.push(
        or(
          ilike(reports.title, `%${query}%`),
          ilike(reports.description, `%${query}%`)
        )
      )
    }

    if (status && status !== "all") {
      conditions.push(eq(reports.status, status.toUpperCase() as any))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const reportsList = await db
      .select()
      .from(reports)
      .where(whereClause)
      .orderBy(desc(reports.updatedAt))
      .limit(limit)

    return {
      success: true,
      data: reportsList,
    }
  } catch (error) {
    console.error("Error fetching reports:", error)
    return {
      success: false,
      error: "Failed to fetch reports",
      data: [],
    }
  }
}

// Get report statistics
export async function getReportStats() {
  try {
    const stats = await unstable_cache(
      async () => {
        const [totalCount, draftCount, generatedCount, publishedCount, archivedCount] = await Promise.all([
          db.select({ count: count() }).from(reports),
          db.select({ count: count() }).from(reports).where(eq(reports.status, "DRAFT")),
          db.select({ count: count() }).from(reports).where(eq(reports.status, "GENERATED")),
          db.select({ count: count() }).from(reports).where(eq(reports.status, "PUBLISHED")),
          db.select({ count: count() }).from(reports).where(eq(reports.status, "ARCHIVED")),
        ])

        return {
          total: totalCount[0]?.count || 0,
          draft: draftCount[0]?.count || 0,
          generated: generatedCount[0]?.count || 0,
          published: publishedCount[0]?.count || 0,
          archived: archivedCount[0]?.count || 0,
          lastUpdated: new Date(),
        }
      },
      ["report-stats"],
      { revalidate: 60, tags: ["reports"] }
    )()

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error("Error fetching report stats:", error)
    return {
      success: false,
      error: "Failed to fetch report statistics",
    }
  }
}

// Get single report by ID
export async function getReportById(id: string) {
  try {
    const report = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1)

    if (!report || report.length === 0) {
      return {
        success: false,
        error: "Report not found",
      }
    }

    return {
      success: true,
      data: report[0],
    }
  } catch (error) {
    console.error("Error fetching report:", error)
    return {
      success: false,
      error: "Failed to fetch report",
    }
  }
}

// Create new report
export async function createReport(reportData: {
  title: string
  description?: string
  status?: "DRAFT" | "GENERATED" | "PUBLISHED" | "ARCHIVED"
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ON_DEMAND"
  format?: "PDF" | "EXCEL" | "CSV" | "DASHBOARD"
  department?: string
  category?: string
  lastGenerated?: Date
  generatedBy?: string
  fileUrl?: string
  fileSize?: number
  parameters?: Record<string, any>
  createdBy?: string
}) {
  try {
    const newReport = await db
      .insert(reports)
      .values({
        title: reportData.title,
        description: reportData.description || null,
        status: reportData.status || "DRAFT",
        frequency: reportData.frequency || "MONTHLY",
        format: reportData.format || "PDF",
        department: reportData.department || null,
        category: reportData.category || null,
        lastGenerated: reportData.lastGenerated || null,
        generatedBy: reportData.generatedBy || null,
        fileUrl: reportData.fileUrl || null,
        fileSize: reportData.fileSize || null,
        parameters: reportData.parameters || {},
        createdBy: reportData.createdBy || null,
      })
      .returning()

    revalidateTag("reports")

    return {
      success: true,
      data: newReport[0],
      message: "Report created successfully",
    }
  } catch (error) {
    console.error("Error creating report:", error)
    return {
      success: false,
      error: "Failed to create report",
    }
  }
}

// Update existing report
export async function updateReport(id: string, reportData: Partial<{
  title: string
  description: string
  status: "DRAFT" | "GENERATED" | "PUBLISHED" | "ARCHIVED"
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ON_DEMAND"
  format: "PDF" | "EXCEL" | "CSV" | "DASHBOARD"
  department: string
  category: string
  lastGenerated: Date
  generatedBy: string
  fileUrl: string
  fileSize: number
  parameters: Record<string, any>
}>) {
  try {
    const updatedReport = await db
      .update(reports)
      .set({
        ...reportData,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning()

    revalidateTag("reports")
    revalidateTag(`report-${id}`)

    return {
      success: true,
      data: updatedReport[0],
      message: "Report updated successfully",
    }
  } catch (error) {
    console.error("Error updating report:", error)
    return {
      success: false,
      error: "Failed to update report",
    }
  }
}

// Delete report
export async function deleteReport(id: string) {
  try {
    await db
      .delete(reports)
      .where(eq(reports.id, id))

    revalidateTag("reports")
    revalidateTag(`report-${id}`)

    return {
      success: true,
      message: "Report deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting report:", error)
    return {
      success: false,
      error: "Failed to delete report",
    }
  }
}
