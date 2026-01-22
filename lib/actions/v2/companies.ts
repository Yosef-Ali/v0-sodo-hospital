"use server"

import { db, companyRegistrations, type CompanyRegistration, type NewCompanyRegistration } from "@/lib/db"
import { eq, desc, or, like, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateTicketNumber } from "@/lib/utils"

/**
 * Get all company registrations with optional search and pagination
 */
export async function getCompanies(params?: {
  query?: string
  stage?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const { query, stage, status, limit = 50, offset = 0 } = params || {}

  try {
    let queryBuilder = db.select().from(companyRegistrations)

    // Apply filters
    const conditions = []
    if (query) {
      conditions.push(
        or(
          like(companyRegistrations.title, `%${query}%`),
          like(companyRegistrations.companyName, `%${query}%`),
          like(companyRegistrations.registrationType, `%${query}%`)
        )
      )
    }
    if (stage) {
      conditions.push(eq(companyRegistrations.stage, stage))
    }
    if (status) {
      conditions.push(eq(companyRegistrations.status, status))
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(conditions[0]) as any
    }

    const result = await queryBuilder
      .orderBy(desc(companyRegistrations.createdAt))
      .limit(limit)
      .offset(offset)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching companies:", error)
    return { success: false, error: "Failed to fetch company registrations" }
  }
}

/**
 * Get a single company registration by ID
 */
export async function getCompanyById(companyId: string) {
  try {
    const result = await db
      .select()
      .from(companyRegistrations)
      .where(eq(companyRegistrations.id, companyId))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: "Company registration not found" }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error fetching company:", error)
    return { success: false, error: "Failed to fetch company details" }
  }
}

/**
 * Create a new company registration
 */
export async function createCompany(data: {
  title: string
  description?: string
  stage?: string // "document_prep" | "apply_online" | "approval" | "completed"
  status?: string
  companyName?: string
  registrationType?: string
  dueDate?: Date
  assigneeId?: string
  documents?: string[]
  documentSections?: any[]
}) {
  try {
    if (!data.title) {
      return { success: false, error: "Title is required" }
    }

    // Check for duplicate company name
    if (data.companyName) {
      const existingCompany = await db
        .select({
          id: companyRegistrations.id,
          title: companyRegistrations.title,
          companyName: companyRegistrations.companyName,
          registrationType: companyRegistrations.registrationType
        })
        .from(companyRegistrations)
        .where(eq(companyRegistrations.companyName, data.companyName))
        .limit(1)

      if (existingCompany.length > 0) {
        return {
          success: false,
          error: "A company with this name already exists",
          errorCode: "DUPLICATE_COMPANY_NAME",
          existingCompany: existingCompany[0]
        }
      }
    }

    const result = await db
      .insert(companyRegistrations)
      .values({
        ticketNumber: generateTicketNumber("CMP"),
        title: data.title,
        description: data.description,
        stage: data.stage || "document_prep",
        status: data.status || "pending",
        companyName: data.companyName,
        registrationType: data.registrationType,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,
        documents: data.documents || [],
        documentSections: data.documentSections || [],
      })
      .returning()

    revalidatePath("/company")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating company:", error)
    return { success: false, error: "Failed to create company registration" }
  }
}

/**
 * Update a company registration
 */
export async function updateCompany(
  companyId: string,
  data: Partial<{
    title: string
    description: string
    stage: string
    status: string
    companyName: string
    registrationType: string
    dueDate: Date
    assigneeId: string
    documents: string[]
    documentSections: any[]
  }>
) {
  try {
    const existing = await db
      .select({ id: companyRegistrations.id, ticketNumber: companyRegistrations.ticketNumber })
      .from(companyRegistrations)
      .where(eq(companyRegistrations.id, companyId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Company registration not found" }
    }

    // Generate ticket number if missing
    const updateData: any = { ...data }
    if (!existing[0].ticketNumber) {
      updateData.ticketNumber = generateTicketNumber("CMP")
    }

    // Check for duplicate company name (excluding current company)
    if (data.companyName) {
      const existingName = await db
        .select({
          id: companyRegistrations.id,
          title: companyRegistrations.title,
          companyName: companyRegistrations.companyName,
          registrationType: companyRegistrations.registrationType
        })
        .from(companyRegistrations)
        .where(eq(companyRegistrations.companyName, data.companyName))
        .limit(1)

      if (existingName.length > 0 && existingName[0].id !== companyId) {
        return {
          success: false,
          error: "A company with this name already exists",
          errorCode: "DUPLICATE_COMPANY_NAME",
          existingCompany: existingName[0]
        }
      }
    }

    const result = await db
      .update(companyRegistrations)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(companyRegistrations.id, companyId))
      .returning()

    revalidatePath("/company")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating company:", error)
    return { success: false, error: "Failed to update company registration" }
  }
}

/**
 * Delete a company registration
 */
export async function deleteCompany(companyId: string) {
  try {
    const result = await db
      .delete(companyRegistrations)
      .where(eq(companyRegistrations.id, companyId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Company registration not found" }
    }

    revalidatePath("/company")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting company:", error)
    return { success: false, error: "Failed to delete company registration" }
  }
}

/**
 * Get company registration statistics
 */
export async function getCompanyStats() {
  try {
    const total = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(companyRegistrations)

    const documentPrep = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(companyRegistrations)
      .where(eq(companyRegistrations.stage, "document_prep"))

    const applyOnline = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(companyRegistrations)
      .where(eq(companyRegistrations.stage, "apply_online"))

    const approval = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(companyRegistrations)
      .where(eq(companyRegistrations.stage, "approval"))

    const completed = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(companyRegistrations)
      .where(eq(companyRegistrations.stage, "completed"))

    return {
      success: true,
      data: {
        total: total[0]?.count || 0,
        documentPrep: documentPrep[0]?.count || 0,
        applyOnline: applyOnline[0]?.count || 0,
        approval: approval[0]?.count || 0,
        completed: completed[0]?.count || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching company stats:", error)
    return { success: false, error: "Failed to fetch statistics" }
  }
}

/**
 * Backfill missing ticket numbers for all company records
 */
export async function backfillCompanyTicketNumbers() {
  try {
    const companiesWithoutTickets = await db
      .select({ id: companyRegistrations.id, title: companyRegistrations.title })
      .from(companyRegistrations)
      .where(sql`${companyRegistrations.ticketNumber} IS NULL`)

    if (companiesWithoutTickets.length === 0) {
      return { success: true, message: "All companies already have ticket numbers", updated: 0 }
    }

    let updated = 0
    for (const company of companiesWithoutTickets) {
      try {
        const ticketNumber = generateTicketNumber("CMP")
        await db
          .update(companyRegistrations)
          .set({ ticketNumber, updatedAt: new Date() })
          .where(eq(companyRegistrations.id, company.id))
        updated++
      } catch (err) {
        console.error(`Failed to update company ${company.title}:`, err)
      }
    }

    revalidatePath("/company")
    return {
      success: true,
      message: `Updated ${updated} of ${companiesWithoutTickets.length} companies`,
      updated,
      total: companiesWithoutTickets.length
    }
  } catch (error) {
    console.error("Error backfilling company ticket numbers:", error)
    return { success: false, error: "Failed to backfill ticket numbers" }
  }
}
