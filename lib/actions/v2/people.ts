"use server"

import { db, people, documentsV2, permits, type Person, type NewPerson } from "@/lib/db"
import { eq, desc, or, like, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

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
        passportDocumentUrl: people.passportDocumentUrl,
        medicalLicenseNo: people.medicalLicenseNo,
        medicalLicenseIssueDate: people.medicalLicenseIssueDate,
        medicalLicenseExpiryDate: people.medicalLicenseExpiryDate,
        medicalLicenseDocumentUrl: people.medicalLicenseDocumentUrl,
        workPermitNo: people.workPermitNo,
        workPermitIssueDate: people.workPermitIssueDate,
        workPermitExpiryDate: people.workPermitExpiryDate,
        workPermitDocumentUrl: people.workPermitDocumentUrl,
        residenceIdNo: people.residenceIdNo,
        residenceIdIssueDate: people.residenceIdIssueDate,
        residenceIdExpiryDate: people.residenceIdExpiryDate,
        residenceIdDocumentUrl: people.residenceIdDocumentUrl,
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
  } catch (error) {
    console.error("Error fetching people:", error)
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

    return {
      success: true,
      data: {
        person,
        guardian,
        dependents,
        documents,
        permits: personPermits,
      },
    }
  } catch (error) {
    console.error("Error fetching person:", error)
    return { success: false, error: "Failed to fetch person details" }
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
  passportDocumentUrl?: string
  medicalLicenseNo?: string
  medicalLicenseIssueDate?: Date
  medicalLicenseExpiryDate?: Date
  medicalLicenseDocumentUrl?: string
  workPermitNo?: string
  workPermitIssueDate?: Date
  workPermitExpiryDate?: Date
  workPermitDocumentUrl?: string
  residenceIdNo?: string
  residenceIdIssueDate?: Date
  residenceIdExpiryDate?: Date
  residenceIdDocumentUrl?: string
  phone?: string
  email?: string
  guardianId?: string
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
        .select({ id: people.id })
        .from(people)
        .where(eq(people.passportNo, data.passportNo))
        .limit(1)

      if (existingPerson.length > 0) {
        return { success: false, error: "A person with this passport number already exists" }
      }
    }

    const result = await db
      .insert(people)
      .values(data)
      .returning()

    revalidatePath("/people")
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
    passportDocumentUrl: string
    medicalLicenseNo: string
    medicalLicenseIssueDate: Date
    medicalLicenseExpiryDate: Date
    medicalLicenseDocumentUrl: string
    workPermitNo: string
    workPermitIssueDate: Date
    workPermitExpiryDate: Date
    workPermitDocumentUrl: string
    residenceIdNo: string
    residenceIdIssueDate: Date
    residenceIdExpiryDate: Date
    residenceIdDocumentUrl: string
    phone: string
    email: string
    guardianId: string
  }>
) {
  try {
    // Check if person exists
    const existing = await db
      .select({ id: people.id })
      .from(people)
      .where(eq(people.id, personId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Person not found" }
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

    const result = await db
      .update(people)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(people.id, personId))
      .returning()

    revalidatePath("/people")
    revalidatePath(`/people/${personId}`)
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
export async function deletePerson(personId: string) {
  try {
    // Check if person has dependents
    const dependents = await db
      .select({ id: people.id })
      .from(people)
      .where(eq(people.guardianId, personId))
      .limit(1)

    if (dependents.length > 0) {
      return {
        success: false,
        error: "Cannot delete person with dependents. Please remove or reassign dependents first.",
      }
    }

    // Check if person has active permits
    const activePermits = await db
      .select({ id: permits.id })
      .from(permits)
      .where(eq(permits.personId, personId))
      .limit(1)

    if (activePermits.length > 0) {
      return {
        success: false,
        error: "Cannot delete person with active permits. Please remove permits first.",
      }
    }

    const result = await db
      .delete(people)
      .where(eq(people.id, personId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Person not found" }
    }

    revalidatePath("/people")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting person:", error)
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
  } catch (error) {
    console.error("Error fetching dependents:", error)
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
  } catch (error) {
    console.error("Error fetching people stats:", error)
    return { success: false, error: "Failed to fetch statistics" }
  }
}
