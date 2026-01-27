"use server"

import { db, people, documentsV2, permits, tasksV2, permitChecklistItems, calendarEvents, complaints, type Person, type NewPerson } from "@/lib/db"
import { eq, desc, or, like, sql, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateTicketNumber } from "@/lib/utils"

/**
 * Get all people with optional search and pagination
 */
export async function getPeople(params?: {
  query?: string
  limit?: number
  offset?: number
  includeGuardian?: boolean
}) {
  const { query, limit = 50, offset = 0, includeGuardian = false } = params || {}

  try {
    let queryBuilder = db
      .select({
        id: people.id,
        firstName: people.firstName,
        lastName: people.lastName,
        nationality: people.nationality,
        dateOfBirth: people.dateOfBirth,
        gender: people.gender,
        familyStatus: people.familyStatus,
        photoUrl: people.photoUrl,
        passportNo: people.passportNo,
        passportIssueDate: people.passportIssueDate,
        passportExpiryDate: people.passportExpiryDate,
        passportDocuments: people.passportDocuments,
        medicalLicenseNo: people.medicalLicenseNo,
        medicalLicenseIssueDate: people.medicalLicenseIssueDate,
        medicalLicenseExpiryDate: people.medicalLicenseExpiryDate,
        medicalLicenseDocuments: people.medicalLicenseDocuments,
        workPermitNo: people.workPermitNo,
        workPermitSubType: people.workPermitSubType,
        workPermitIssueDate: people.workPermitIssueDate,
        workPermitExpiryDate: people.workPermitExpiryDate,
        workPermitDocuments: people.workPermitDocuments,
        residenceIdNo: people.residenceIdNo,
        residenceIdIssueDate: people.residenceIdIssueDate,
        residenceIdExpiryDate: people.residenceIdExpiryDate,
        residenceIdDocuments: people.residenceIdDocuments,
        phone: people.phone,
        email: people.email,
        guardianId: people.guardianId,
        createdAt: people.createdAt,
        updatedAt: people.updatedAt,
      })
      .from(people)

    // Apply search filter
    if (query) {
      queryBuilder = queryBuilder.where(
        or(
          like(people.firstName, `%${query}%`),
          like(people.lastName, `%${query}%`),
          like(people.passportNo, `%${query}%`),
          like(people.email, `%${query}%`)
        )
      ) as any
    }

    const result = await queryBuilder
      .orderBy(desc(people.createdAt))
      .limit(limit)
      .offset(offset)

    return { success: true, data: result }
  } catch (error: any) {
    console.error("Error fetching people:", error)
    const { isConnectionError } = await import("@/lib/db/error-utils")
    if (isConnectionError(error)) {
      return {
        success: false,
        error: "Database connection failed. Please ensure the SSH tunnel is running."
      }
    }
    return { success: false, error: "Failed to fetch people" }
  }
}

/**
 * Get a single person by ID with all related data
 */
export async function getPersonById(personId: string) {
  try {
    // Get person
    const personResult = await db
      .select()
      .from(people)
      .where(eq(people.id, personId))
      .limit(1)

    if (personResult.length === 0) {
      return { success: false, error: "Person not found" }
    }

    const person = personResult[0]

    // Get guardian if exists
    let guardian = null
    if (person.guardianId) {
      const guardianResult = await db
        .select()
        .from(people)
        .where(eq(people.id, person.guardianId))
        .limit(1)

      if (guardianResult.length > 0) {
        guardian = guardianResult[0]
      }
    }

    // Get dependents
    const dependents = await db
      .select()
      .from(people)
      .where(eq(people.guardianId, personId))

    // Get documents
    const documents = await db
      .select()
      .from(documentsV2)
      .where(eq(documentsV2.personId, personId))
      .orderBy(desc(documentsV2.createdAt))

    // Get permits
    const personPermits = await db
      .select()
      .from(permits)
      .where(eq(permits.personId, personId))
      .orderBy(desc(permits.createdAt))

    // Get related calendar events
    const personEvents = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.relatedPersonId, personId))
      .orderBy(desc(calendarEvents.startDate))

    return {
      success: true,
      data: {
        person,
        guardian,
        dependents,
        documents,
        permits: personPermits,
        calendarEvents: personEvents,
      },
    }
  } catch (error: any) {
    console.error("Error fetching person:", error)
    const isConnError = error.code === 'ECONNREFUSED' || error.message?.includes('connection')
    return {
      success: false,
      error: isConnError ? "Database connection failed. Please ensure the SSH tunnel is running." : "Failed to fetch person details"
    }
  }
}

/**
 * Create a new person
 */
export async function createPerson(data: {
  firstName: string
  lastName: string
  nationality?: string
  dateOfBirth?: Date
  gender?: "MALE" | "FEMALE"
  familyStatus?: "MARRIED" | "UNMARRIED"
  photoUrl?: string
  passportNo?: string
  passportIssueDate?: Date
  passportExpiryDate?: Date
  passportDocuments?: string[]
  medicalLicenseNo?: string
  medicalLicenseIssueDate?: Date
  medicalLicenseExpiryDate?: Date
  medicalLicenseDocuments?: string[]
  workPermitNo?: string
  workPermitSubType?: "NEW" | "RENEWAL" | "OTHER"
  workPermitIssueDate?: Date
  workPermitExpiryDate?: Date
  workPermitDocuments?: string[]
  residenceIdNo?: string
  residenceIdIssueDate?: Date
  residenceIdExpiryDate?: Date
  residenceIdDocuments?: string[]
  phone?: string
  email?: string
  familyDetails?: any
  guardianId?: string
  documentSections?: any[]
  // Permit workflow fields
  permitType?: "WORK_PERMIT" | "RESIDENCE_ID" | "MEDICAL_LICENSE" | "PIP" | "CUSTOMS" | "CAR_BOLO_INSURANCE"
  applicationType?: "NEW" | "RENEWAL" | "OTHER"
  currentStage?: "SUPPORT_LETTER" | "DOCUMENT_ARRANGEMENT" | "APPLY_ONLINE" | "SUBMIT_DOCUMENT" | "PAYMENT" | "PICK_ID" | "COMPLETED"
}) {
  try {
    // Validate required fields
    if (!data.firstName || !data.lastName) {
      return { success: false, error: "First name and last name are required" }
    }

    // Check if guardian exists if provided
    if (data.guardianId) {
      const guardianExists = await db
        .select({ id: people.id })
        .from(people)
        .where(eq(people.id, data.guardianId))
        .limit(1)

      if (guardianExists.length === 0) {
        return { success: false, error: "Guardian not found" }
      }
    }

    // Check for duplicate passport number
    if (data.passportNo) {
      const existingPerson = await db
        .select({
          id: people.id,
          firstName: people.firstName,
          lastName: people.lastName,
          passportNo: people.passportNo
        })
        .from(people)
        .where(eq(people.passportNo, data.passportNo))
        .limit(1)

      if (existingPerson.length > 0) {
        return {
          success: false,
          error: "A person with this passport number already exists",
          errorCode: "DUPLICATE_PASSPORT",
          existingPerson: existingPerson[0]
        }
      }
    }

    console.log("Creating person with data:", JSON.stringify(data, null, 2))
    const result = await db
      .insert(people)
      .values({
        ...data,
        ticketNumber: generateTicketNumber("FOR"),
        familyDetails: data.familyDetails || {},
        documentSections: data.documentSections || [],
      })
      .returning()

    // NEW: Create document record for profile photo
    if (data.photoUrl) {
      try {
        await db.insert(documentsV2).values({
          personId: result[0].id,
          type: "PROFILE_PHOTO",
          title: "Profile Photo",
          fileUrl: data.photoUrl,
          fileSize: 0,
          mimeType: "image/jpeg",
        })
      } catch (docErr) {
        console.error("Failed to create profile photo document:", docErr)
      }
    }

    revalidatePath("/foreigners")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating person:", error)
    return { success: false, error: "Failed to create person" }
  }
}

/**
 * Update a person
 */
export async function updatePerson(
  personId: string,
  data: Partial<{
    firstName: string
    lastName: string
    nationality: string
    dateOfBirth: Date
    gender: "MALE" | "FEMALE"
    familyStatus: "MARRIED" | "UNMARRIED"
    photoUrl: string
    passportNo: string
    passportIssueDate: Date
    passportExpiryDate: Date
    passportDocuments: string[]
    medicalLicenseNo: string
    medicalLicenseIssueDate: Date
    medicalLicenseExpiryDate: Date
    medicalLicenseDocuments: string[]
    workPermitNo: string
    workPermitSubType: "NEW" | "RENEWAL" | "OTHER"
    workPermitIssueDate: Date
    workPermitExpiryDate: Date
    workPermitDocuments: string[]
    residenceIdNo: string
    residenceIdIssueDate: Date
    residenceIdExpiryDate: Date
    residenceIdDocuments: string[]
    phone: string
    email: string
    familyDetails: any
    guardianId: string
    documentSections: any[]
    // Permit workflow fields
    permitType: "WORK_PERMIT" | "RESIDENCE_ID" | "MEDICAL_LICENSE" | "PIP" | "CUSTOMS" | "CAR_BOLO_INSURANCE"
    applicationType: "NEW" | "RENEWAL" | "OTHER"
    currentStage: "SUPPORT_LETTER" | "DOCUMENT_ARRANGEMENT" | "APPLY_ONLINE" | "SUBMIT_DOCUMENT" | "PAYMENT" | "PICK_ID" | "COMPLETED"
  }>
) {
  try {
    // Check if person exists and get current ticket number
    const existing = await db
      .select({ id: people.id, ticketNumber: people.ticketNumber, photoUrl: people.photoUrl })
      .from(people)
      .where(eq(people.id, personId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Person not found" }
    }

    // Generate ticket number if missing
    const updateData: any = { ...data }
    if (!existing[0].ticketNumber) {
      updateData.ticketNumber = generateTicketNumber("FOR")
    }

    // Check if guardian exists if provided
    if (data.guardianId) {
      const guardianExists = await db
        .select({ id: people.id })
        .from(people)
        .where(eq(people.id, data.guardianId))
        .limit(1)

      if (guardianExists.length === 0) {
        return { success: false, error: "Guardian not found" }
      }

      // Prevent circular references
      if (data.guardianId === personId) {
        return { success: false, error: "A person cannot be their own guardian" }
      }
    }

    // Check for duplicate passport number
    if (data.passportNo) {
      const existingPassport = await db
        .select({ id: people.id })
        .from(people)
        .where(eq(people.passportNo, data.passportNo))
        .limit(1)

      if (existingPassport.length > 0 && existingPassport[0].id !== personId) {
        return { success: false, error: "A person with this passport number already exists" }
      }
    }

    console.log("Updating person:", personId, "with data:", JSON.stringify(updateData, null, 2))
    const result = await db
      .update(people)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(people.id, personId))
      .returning()

    // NEW: Create document record if photo URL changed
    if (updateData.photoUrl && updateData.photoUrl !== existing[0].photoUrl) {
      try {
        await db.insert(documentsV2).values({
          personId: personId,
          type: "PROFILE_PHOTO",
          title: "Updated Profile Photo",
          fileUrl: updateData.photoUrl,
          fileSize: 0,
          mimeType: "image/jpeg",
        })
      } catch (docErr) {
        console.error("Failed to create profile photo document:", docErr)
      }
    }

    revalidatePath("/foreigners")
    revalidatePath(`/foreigners/${personId}`)
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating person:", error)
    return { success: false, error: "Failed to update person" }
  }
}

/**
 * Delete a person
 */
/**
 * Delete a person
 */
export async function deletePerson(personId: string, options?: { cascade?: boolean }) {
  try {
    const { cascade = false } = options || {}

    // Check if person has dependents
    const dependents = await db
      .select({ id: people.id })
      .from(people)
      .where(eq(people.guardianId, personId))

    if (dependents.length > 0) {
      if (cascade) {
        // Unlink dependents (set guardianId to null) rather than deleting them
        await db
          .update(people)
          .set({ guardianId: null, updatedAt: new Date() })
          .where(eq(people.guardianId, personId))
      } else {
        return {
          success: false,
          error: "Cannot delete person with dependents. Please remove or reassign dependents first.",
        }
      }
    }

    // Check if person has active permits
    const activePermits = await db
      .select({ id: permits.id })
      .from(permits)
      .where(eq(permits.personId, personId))

    if (activePermits.length > 0) {
      if (cascade) {
        // DELETE RELATED DATA
        const permitIds = activePermits.map(p => p.id)

        // 1. Delete tasks associated with these permits
        await db.delete(tasksV2).where(inArray(tasksV2.permitId, permitIds))

        // 2. Delete checklist items associated with these permits
        await db.delete(permitChecklistItems).where(inArray(permitChecklistItems.permitId, permitIds))

        // 3. Delete permits themselves
        await db.delete(permits).where(inArray(permits.id, permitIds))

      } else {
        return {
          success: false,
          error: "Cannot delete person with active permits. Please remove permits first.",
        }
      }
    }

    // Handle other related tables if cascade
    if (cascade) {
      // Documents
      await db.delete(documentsV2).where(eq(documentsV2.personId, personId))

      // Calendar Events
      await db.delete(calendarEvents).where(eq(calendarEvents.relatedPersonId, personId))

      // Complaints (unlink)
      await db
        .update(complaints)
        .set({ personId: null })
        .where(eq(complaints.personId, personId))

      // Tasks (linked by entity)
      await db.delete(tasksV2).where(sql`${tasksV2.entityType} = 'person' AND ${tasksV2.entityId} = ${personId}`)
    }

    const result = await db
      .delete(people)
      .where(eq(people.id, personId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Person not found" }
    }

    revalidatePath("/foreigners")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting person:", error)
    if ((error as any).code === '23503') {
      return { success: false, error: "Cannot delete person due to existing related records (e.g. complaints, events). Please try 'Delete all related data' option." }
    }
    return { success: false, error: "Failed to delete person" }
  }
}

/**
 * Get dependents of a person
 */
export async function getDependents(guardianId: string) {
  try {
    const result = await db
      .select()
      .from(people)
      .where(eq(people.guardianId, guardianId))
      .orderBy(desc(people.createdAt))

    return { success: true, data: result }
  } catch (error: any) {
    console.error("Error fetching dependents:", error)
    const { isConnectionError } = await import("@/lib/db/error-utils")
    if (isConnectionError(error)) {
      return {
        success: false,
        error: "Database connection failed. Please ensure the SSH tunnel is running."
      }
    }
    return { success: false, error: "Failed to fetch dependents" }
  }
}

/**
 * Get people statistics
 */
export async function getPeopleStats() {
  try {
    const totalPeople = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(people)

    const withGuardians = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(people)
      .where(sql`${people.guardianId} IS NOT NULL`)

    const withPermits = await db
      .select({ count: sql<number>`cast(count(DISTINCT ${people.id}) as integer)` })
      .from(people)
      .innerJoin(permits, eq(people.id, permits.personId))

    return {
      success: true,
      data: {
        total: totalPeople[0]?.count || 0,
        dependents: withGuardians[0]?.count || 0,
        withPermits: withPermits[0]?.count || 0,
      },
    }
  } catch (error: any) {
    console.error("Error fetching people stats:", error)
    const { isConnectionError } = await import("@/lib/db/error-utils")
    if (isConnectionError(error)) {
      return {
        success: false,
        error: "Database connection failed. Please ensure the SSH tunnel is running."
      }
    }
    return { success: false, error: "Failed to fetch statistics" }
  }
}

/**
 * Backfill missing ticket numbers for all people records
 * This should be run once to fix existing records without ticket numbers
 */
export async function backfillMissingTicketNumbers() {
  try {
    // Find all people without ticket numbers
    const peopleWithoutTickets = await db
      .select({ id: people.id, firstName: people.firstName, lastName: people.lastName })
      .from(people)
      .where(sql`${people.ticketNumber} IS NULL`)

    if (peopleWithoutTickets.length === 0) {
      return { success: true, message: "All records already have ticket numbers", updated: 0 }
    }

    let updated = 0
    const errors: string[] = []

    for (const person of peopleWithoutTickets) {
      try {
        const ticketNumber = generateTicketNumber("FOR")
        await db
          .update(people)
          .set({ ticketNumber, updatedAt: new Date() })
          .where(eq(people.id, person.id))
        updated++
      } catch (err) {
        errors.push(`Failed to update ${person.firstName} ${person.lastName}: ${err}`)
      }
    }

    revalidatePath("/foreigners")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `Updated ${updated} of ${peopleWithoutTickets.length} records`,
      updated,
      total: peopleWithoutTickets.length,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    console.error("Error backfilling ticket numbers:", error)
    return { success: false, error: "Failed to backfill ticket numbers" }
  }
}
