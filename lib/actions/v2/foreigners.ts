"use server"

import { db, people, documentsV2, permits, tasksV2, permitChecklistItems, calendarEvents, complaints, type Person } from "@/lib/db"
import { eq, desc, or, like, sql, inArray, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateTicketNumber } from "@/lib/utils"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"

// --- Schemas ---

const personSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  nationality: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  familyStatus: z.enum(["MARRIED", "UNMARRIED"]).optional(),
  photoUrl: z.string().optional(),
  passportNo: z.string().optional(),
  passportIssueDate: z.coerce.date().optional(),
  passportExpiryDate: z.coerce.date().optional(),
  passportDocuments: z.array(z.string()).optional(),
  medicalLicenseNo: z.string().optional(),
  medicalLicenseIssueDate: z.coerce.date().optional(),
  medicalLicenseExpiryDate: z.coerce.date().optional(),
  medicalLicenseDocuments: z.array(z.string()).optional(),
  workPermitNo: z.string().optional(),
  workPermitSubType: z.enum(["NEW", "RENEWAL", "OTHER"]).optional(),
  workPermitIssueDate: z.coerce.date().optional(),
  workPermitExpiryDate: z.coerce.date().optional(),
  workPermitDocuments: z.array(z.string()).optional(),
  residenceIdNo: z.string().optional(),
  residenceIdIssueDate: z.coerce.date().optional(),
  residenceIdExpiryDate: z.coerce.date().optional(),
  residenceIdDocuments: z.array(z.string()).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  familyDetails: z.any().optional(),
  guardianId: z.string().optional(),
  documentSections: z.array(z.any()).optional(),
  // Workflow fields (optional)
  permitType: z.enum(["WORK_PERMIT", "RESIDENCE_ID", "MEDICAL_LICENSE", "PIP", "CUSTOMS", "CAR_BOLO_INSURANCE"]).optional(),
  applicationType: z.enum(["NEW", "RENEWAL", "OTHER"]).optional(),
  currentStage: z.enum(["SUPPORT_LETTER", "DOCUMENT_ARRANGEMENT", "APPLY_ONLINE", "SUBMIT_DOCUMENT", "PAYMENT", "PICK_ID", "COMPLETED"]).optional(),
})

const updatePersonSchema = personSchema.partial().extend({
  id: z.string().uuid(),
})

const deletePersonSchema = z.object({
  id: z.string().uuid(),
  cascade: z.boolean().default(false),
})

const searchSchema = z.object({
  query: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
  includeGuardian: z.boolean().default(false),
})

// --- Actions ---

/**
 * Get all people with optional search and pagination
 */
export async function getPeople(params?: z.input<typeof searchSchema>) {
  // Read-only, still good to wrap or just use directly if public/internal
  // For consistency, we'll keep it as a regular function but could safely be wrapped if we wanted to enforce auth for reading
  try {
    // Check auth manually for read ops if needed, or leave open if dashboard is protected by middleware
    const { query, limit = 50, offset = 0 } = params || {}

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
        ticketNumber: people.ticketNumber,
      })
      .from(people)

    if (query) {
      queryBuilder = queryBuilder.where(
        or(
          like(people.firstName, `%${query}%`),
          like(people.lastName, `%${query}%`),
          like(people.passportNo, `%${query}%`),
          like(people.email, `%${query}%`),
          like(people.ticketNumber, `%${query}%`)
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
      return { success: false, error: "Database connection failed. SSH tunnel down?" }
    }
    return { success: false, error: "Failed to fetch people" }
  }
}

/**
 * Get a single person by ID
 */
export async function getPersonById(personId: string) {
  try {
    const personResult = await db
      .select()
      .from(people)
      .where(eq(people.id, personId))
      .limit(1)

    if (personResult.length === 0) {
      return { success: false, error: "Person not found" }
    }

    const person = personResult[0]

    // Parallel fetch for related data
    const [guardianResult, dependents, documents, personPermits, personEvents] = await Promise.all([
      person.guardianId
        ? db.select().from(people).where(eq(people.id, person.guardianId)).limit(1)
        : Promise.resolve([]),
      db.select().from(people).where(eq(people.guardianId, personId)),
      db.select().from(documentsV2).where(eq(documentsV2.personId, personId)).orderBy(desc(documentsV2.createdAt)),
      db.select().from(permits).where(eq(permits.personId, personId)).orderBy(desc(permits.createdAt)),
      db.select().from(calendarEvents).where(eq(calendarEvents.relatedPersonId, personId)).orderBy(desc(calendarEvents.startDate))
    ])

    return {
      success: true,
      data: {
        person,
        guardian: guardianResult[0] || null,
        dependents,
        documents,
        permits: personPermits,
        calendarEvents: personEvents,
      },
    }
  } catch (error: any) {
    console.error("Error fetching person:", error)
    return { success: false, error: "Failed to fetch person details" }
  }
}

/**
 * Create a new person
 */
export const createPerson = createSafeAction(
  personSchema,
  async (data, user) => {
    // 1. Validate duplicates
    if (data.passportNo) {
      const existing = await db
        .select({ id: people.id })
        .from(people)
        .where(eq(people.passportNo, data.passportNo))
        .limit(1)

      if (existing.length > 0) {
        return { success: false, error: "Passport number already exists" }
      }
    }

    // 2. Validate guardian
    if (data.guardianId) {
      const guardian = await db.select({ id: people.id }).from(people).where(eq(people.id, data.guardianId)).limit(1)
      if (guardian.length === 0) return { success: false, error: "Guardian not found" }
    }

    // 3. Create
    console.log(`[CreatePerson] User ${user.email} creating person ${data.firstName} ${data.lastName}`)

    // Using transaction to ensure person and potential initial documents are created together
    const newPerson = await db.transaction(async (tx) => {
      const [person] = await tx
        .insert(people)
        .values({
          ...data,
          ticketNumber: generateTicketNumber("FOR"),
          familyDetails: data.familyDetails || {},
          documentSections: data.documentSections || [],
        })
        .returning()

      // Create profile photo doc if exists
      if (data.photoUrl) {
        await tx.insert(documentsV2).values({
          personId: person.id,
          type: "PROFILE_PHOTO",
          title: "Profile Photo",
          fileUrl: data.photoUrl,
          fileSize: 0,
          mimeType: "image/jpeg",
        })
      }
      return person
    })

    revalidatePath("/foreigners")
    revalidatePath("/dashboard")
    return { success: true, data: newPerson }
  }
)

/**
 * Update a person
 */
export const updatePerson = createSafeAction(
  updatePersonSchema,
  async (data, user) => {
    const { id, ...updateData } = data

    // 1. Verify existence
    const existing = await db.select().from(people).where(eq(people.id, id)).limit(1)
    if (existing.length === 0) return { success: false, error: "Person not found" }

    // 2. Validate duplicates if passport changed
    if (updateData.passportNo && updateData.passportNo !== existing[0].passportNo) {
      const dup = await db.select({ id: people.id }).from(people).where(eq(people.passportNo, updateData.passportNo)).limit(1)
      if (dup.length > 0) return { success: false, error: "Passport number already exists" }
    }

    // 3. Update
    console.log(`[UpdatePerson] User ${user.email} updating person ${id}`)

    const updatedPerson = await db.transaction(async (tx) => {
      const [person] = await tx
        .update(people)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(people.id, id))
        .returning()

      // Handle photo update
      if (updateData.photoUrl && updateData.photoUrl !== existing[0].photoUrl) {
        await tx.insert(documentsV2).values({
          personId: id,
          type: "PROFILE_PHOTO",
          title: "Updated Profile Photo",
          fileUrl: updateData.photoUrl,
          fileSize: 0,
          mimeType: "image/jpeg",
        })
      }
      return person
    })

    revalidatePath("/foreigners")
    revalidatePath(`/foreigners/${id}`)
    revalidatePath("/dashboard")

    return { success: true, data: updatedPerson }
  }
)

/**
 * Delete a person (Atomic Transaction)
 */
export const deletePerson = createSafeAction(
  deletePersonSchema,
  async ({ id, cascade }, user) => {
    // Only Admin or HR Manager should delete? (Optional: enforce via role)
    // if (!['ADMIN', 'HR_MANAGER'].includes(user.role)) return { success: false, error: "Unauthorized" }

    return await db.transaction(async (tx) => {
      // 1. Check dependents
      const dependents = await tx.select({ id: people.id }).from(people).where(eq(people.guardianId, id))
      if (dependents.length > 0) {
        if (!cascade) throw new Error("Cannot delete person with dependents. Remove dependents first.")

        // Unlink dependents
        await tx.update(people).set({ guardianId: null, updatedAt: new Date() }).where(eq(people.guardianId, id))
      }

      // 2. Check permits
      const activePermits = await tx.select({ id: permits.id }).from(permits).where(eq(permits.personId, id))
      if (activePermits.length > 0) {
        if (!cascade) throw new Error("Cannot delete person with active permits.")

        const permitIds = activePermits.map(p => p.id)

        // Cleanup Permit Deps
        if (permitIds.length > 0) {
          await tx.delete(tasksV2).where(inArray(tasksV2.permitId, permitIds))
          await tx.delete(permitChecklistItems).where(inArray(permitChecklistItems.permitId, permitIds))
          await tx.delete(permits).where(inArray(permits.id, permitIds))
        }
      }

      // 3. Cascade Logic
      if (cascade) {
        await tx.delete(documentsV2).where(eq(documentsV2.personId, id))
        await tx.delete(calendarEvents).where(eq(calendarEvents.relatedPersonId, id))
        await tx.update(complaints).set({ personId: null }).where(eq(complaints.personId, id))
        // Delete generic tasks linked to this person
        await tx.delete(tasksV2).where(and(eq(tasksV2.entityType, 'person'), eq(tasksV2.entityId, id)))
      }

      // 4. Delete Person
      const [deleted] = await tx.delete(people).where(eq(people.id, id)).returning()

      if (!deleted) throw new Error("Person not found or already deleted")

      return { success: true, data: deleted }
    }).catch((err) => {
      console.error("Delete Transaction Failed:", err)
      return { success: false, error: err.message || "Failed to delete person" }
    })
  },
  { requiredRole: ["ADMIN", "HR_MANAGER"] } // Enforce role for deletion
)

/**
 * Get dependents
 */
export async function getDependents(guardianId: string) {
  try {
    const result = await db
      .select()
      .from(people)
      .where(eq(people.guardianId, guardianId))
      .orderBy(desc(people.createdAt))

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: "Failed to fetch dependents" }
  }
}

/**
 * Get stats
 */
export async function getPeopleStats() {
  try {
    const totalPeople = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(people)
    const withGuardians = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(people).where(sql`${people.guardianId} IS NOT NULL`)
    const withPermits = await db.select({ count: sql<number>`cast(count(DISTINCT ${people.id}) as integer)` }).from(people).innerJoin(permits, eq(people.id, permits.personId))

    return {
      success: true,
      data: {
        total: totalPeople[0]?.count || 0,
        dependents: withGuardians[0]?.count || 0,
        withPermits: withPermits[0]?.count || 0,
      },
    }
  } catch (error) {
    return { success: false, error: "Failed to fetch stats" }
  }
}

/**
 * Backfill ticket numbers (Admin/System usually, but public for now)
 */
export async function backfillMissingTicketNumbers() {
  try {
    const peopleWithoutTickets = await db.select({ id: people.id, firstName: people.firstName }).from(people).where(sql`${people.ticketNumber} IS NULL`)
    if (peopleWithoutTickets.length === 0) return { success: true, message: "No updates needed", updated: 0 }

    let updated = 0
    for (const person of peopleWithoutTickets) {
      await db.update(people).set({ ticketNumber: generateTicketNumber("FOR"), updatedAt: new Date() }).where(eq(people.id, person.id))
      updated++
    }
    revalidatePath("/foreigners")
    return { success: true, message: `Updated ${updated} records`, updated }
  } catch {
    return { success: false, error: "Backfill failed" }
  }
}
