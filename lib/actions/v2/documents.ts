"use server"

import { uploadFile, deleteFile, getFileUrl } from "@/lib/storage/s3"
import { db, documentsV2, people, permits, type DocumentV2, type NewDocumentV2 } from "@/lib/db"
import { eq, desc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/**
 * Get all documents for a person
 */
export async function getDocumentsByPerson(personId: string) {
  try {
    const result = await db
      .select()
      .from(documentsV2)
      .where(eq(documentsV2.personId, personId))
      .orderBy(desc(documentsV2.createdAt))

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching documents:", error)
    return { success: false, error: "Failed to fetch documents" }
  }
}

/**
 * Get a single document by ID
 */
export async function getDocumentById(documentId: string) {
  try {
    const result = await db
      .select({
        document: documentsV2,
        person: people,
      })
      .from(documentsV2)
      .leftJoin(people, eq(documentsV2.personId, people.id))
      .where(eq(documentsV2.id, documentId))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: "Document not found" }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error fetching document:", error)
    return { success: false, error: "Failed to fetch document" }
  }
}

/**
 * Create a new document
 * Note: File upload should be handled separately (e.g., to S3 or local storage)
 * This function expects the fileUrl to already be available
 */
export async function createDocument(data: {
  type: string
  title?: string
  issuedBy?: string
  number?: string
  issueDate?: Date
  expiryDate?: Date
  fileUrl?: string
  fileSize?: number
  mimeType?: string
  personId?: string
}) {
  try {
    // Validate required fields
    if (!data.type) {
      return { success: false, error: "Document type is required" }
    }

    let finalPersonId = data.personId

    // 1. If personId is missing but we have a ticket number, try to resolve the entity
    if (data.number) {
      const ticket = data.number.toUpperCase()

      // -- CASE 1: Generic Permits (Person based) --
      const permitPattern = /^[A-Z]{3}-\d{4}-\d{4}$/
      if (!finalPersonId && permitPattern.test(ticket)) {
        // Try to find a permit with this ticket number
        const permitMatch = await db
          .select({ personId: permits.personId, id: permits.id })
          .from(permits)
          .where(eq(permits.ticketNumber, ticket))
          .limit(1)

        if (permitMatch.length > 0) {
          finalPersonId = permitMatch[0].personId

          // CRITICAL: Automatically update permit status to 'SUBMITTED'
          try {
            const { transitionPermitStatus } = await import("./permits")
            await transitionPermitStatus(
              permitMatch[0].id,
              "SUBMITTED",
              "system",
              "Document uploaded via Chat Assistant: " + (data.title || data.type)
            )
          } catch (statusErr) {
            console.warn("Failed to auto-update permit status:", statusErr)
          }
        }
      }

      // -- CASE 2: Vehicles (VEH-...) --
      else if (ticket.startsWith("VEH-")) {
        const { vehicles } = await import("@/lib/db") // Dynamic import to avoid circular dep issues

        // Find vehicle
        const vehicleMatch = await db
          .select({ id: vehicles.id, documents: vehicles.documents })
          .from(vehicles)
          .where(eq(vehicles.ticketNumber, ticket))
          .limit(1)

        if (vehicleMatch.length > 0 && data.fileUrl) {
          // Update vehicle documents list
          const currentDocs = (vehicleMatch[0].documents as string[]) || []
          // Append new file Url
          const newDocs = [...currentDocs, data.fileUrl]

          await db
            .update(vehicles)
            .set({
              documents: newDocs,
              updatedAt: new Date()
              // Optional: Update status if needed, e.g., status: "in_review"
            })
            .where(eq(vehicles.id, vehicleMatch[0].id))

          revalidatePath("/vehicles")
          revalidatePath(`/vehicles/${ticket}`)
        }
      }

      // -- CASE 3: Import Permits (IMP-...) --
      else if (ticket.startsWith("IMP-")) {
        const { importPermits } = await import("@/lib/db")

        const impMatch = await db
          .select({ id: importPermits.id, documents: importPermits.documents })
          .from(importPermits)
          .where(eq(importPermits.ticketNumber, ticket))
          .limit(1)

        if (impMatch.length > 0 && data.fileUrl) {
          const currentDocs = (impMatch[0].documents as string[]) || []
          const newDocs = [...currentDocs, data.fileUrl]

          await db
            .update(importPermits)
            .set({
              documents: newDocs,
              updatedAt: new Date(),
              status: "processing" // Auto-update status for import permits
            })
            .where(eq(importPermits.id, impMatch[0].id))

          revalidatePath("/import-permits")
          revalidatePath(`/import-permits/${ticket}`)
        }
      }

      // -- CASE 4: Company Registrations (CMP-...) --
      else if (ticket.startsWith("CMP-")) {
        const { companyRegistrations } = await import("@/lib/db")

        const cmpMatch = await db
          .select({ id: companyRegistrations.id, documents: companyRegistrations.documents })
          .from(companyRegistrations)
          .where(eq(companyRegistrations.ticketNumber, ticket))
          .limit(1)

        if (cmpMatch.length > 0 && data.fileUrl) {
          const currentDocs = (cmpMatch[0].documents as string[]) || []
          const newDocs = [...currentDocs, data.fileUrl]

          await db
            .update(companyRegistrations)
            .set({
              documents: newDocs,
              updatedAt: new Date(),
              status: "in_review" // Auto-update status
            })
            .where(eq(companyRegistrations.id, cmpMatch[0].id))

          revalidatePath("/companies")
          revalidatePath(`/companies/${ticket}`)
        }
      }
    }

    // Check if person exists if personId is provided (or resolved)
    if (finalPersonId) {
      const personExists = await db
        .select({ id: people.id })
        .from(people)
        .where(eq(people.id, finalPersonId))
        .limit(1)

      if (personExists.length === 0) {
        return { success: false, error: "Person not found" }
      }
    }

    const result = await db
      .insert(documentsV2)
      .values({
        ...data,
        personId: finalPersonId // Use resolved ID
      })
      .returning()

    if (finalPersonId) {
      revalidatePath(`/people/${finalPersonId}`)
    }
    revalidatePath("/documents")

    // Revalidate permit page if number is a ticket number
    if (data.number) {
      const ticketPattern = /^[A-Z]{3}-\d{4}-\d{4}$/
      if (ticketPattern.test(data.number)) {
        revalidatePath(`/permits/${data.number}`)
      }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating document:", error)
    return { success: false, error: "Failed to create document" }
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  documentId: string,
  data: Partial<{
    type: string
    title: string
    issuedBy: string
    number: string
    issueDate: Date
    expiryDate: Date
    fileUrl: string
    fileSize: number
    mimeType: string
    personId: string
  }>
) {
  try {
    // Check if document exists
    const existing = await db
      .select({ id: documentsV2.id, personId: documentsV2.personId })
      .from(documentsV2)
      .where(eq(documentsV2.id, documentId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Document not found" }
    }

    // Check if person exists if personId is being updated
    if (data.personId) {
      const personExists = await db
        .select({ id: people.id })
        .from(people)
        .where(eq(people.id, data.personId))
        .limit(1)

      if (personExists.length === 0) {
        return { success: false, error: "Person not found" }
      }
    }

    const result = await db
      .update(documentsV2)
      .set(data)
      .where(eq(documentsV2.id, documentId))
      .returning()

    // Revalidate old and new person pages if person changed
    if (existing[0].personId) {
      revalidatePath(`/people/${existing[0].personId}`)
    }
    if (data.personId && data.personId !== existing[0].personId) {
      revalidatePath(`/people/${data.personId}`)
    }
    revalidatePath("/documents")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating document:", error)
    return { success: false, error: "Failed to update document" }
  }
}

/**
 * Delete a document from documentsV2 table
 */
export async function deleteDocument(documentId: string) {
  try {
    const result = await db
      .delete(documentsV2)
      .where(eq(documentsV2.id, documentId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Document not found" }
    }

    // Delete physically from S3
    if (result[0].fileUrl) {
      // Extract key from URL if possible, otherwise rely on helper
      // url: /api/files/uploads/filename.ext or https://domain/api/files/...
      try {
        const urlParts = result[0].fileUrl.split("/api/files/")
        if (urlParts.length > 1) {
          const key = decodeURIComponent(urlParts[1])
          await deleteFile(key)
        }
      } catch (err) {
        console.error("Failed to delete file from S3:", err)
      }
    }

    if (result[0].personId) {
      revalidatePath(`/people/${result[0].personId}`)
    }
    revalidatePath("/documents")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { success: false, error: "Failed to delete document" }
  }
}

/**
 * Delete a file from an entity's JSON list (vehicles, imports, companies, etc.)
 */
export async function deleteEntityFile(
  entityType: "person" | "vehicle" | "import" | "company",
  entityId: string,
  fileUrl: string
) {
  try {
    let success = false

    // Dynamic imports to avoid massive loading
    const { vehicles, importPermits, companyRegistrations, people } = await import("@/lib/db")

    // Helper to attempt S3 deletion
    const tryDeleteS3 = async (url: string) => {
      try {
        const urlParts = url.split("/api/files/")
        if (urlParts.length > 1) {
          const key = decodeURIComponent(urlParts[1])
          await deleteFile(key)
        }
      } catch (err) {
        console.warn("Failed to delete from S3:", err)
      }
    }

    if (entityType === "vehicle") {
      const existing = await db.select().from(vehicles).where(eq(vehicles.id, entityId)).limit(1)
      if (existing.length > 0) {
        const docs = (existing[0].documents as string[]) || []
        const newDocs = docs.filter(d => d !== fileUrl)

        // Also check documentSections if present
        const sections = (existing[0].documentSections as any[]) || []
        sections.forEach(section => {
          if (section.files && Array.isArray(section.files)) {
            section.files = section.files.filter((f: string) => f !== fileUrl)
          }
        })

        if (newDocs.length !== docs.length || JSON.stringify(sections) !== JSON.stringify(existing[0].documentSections)) {
          await db.update(vehicles)
            .set({ documents: newDocs, documentSections: sections, updatedAt: new Date() })
            .where(eq(vehicles.id, entityId))

          await tryDeleteS3(fileUrl)
          revalidatePath("/vehicle")
          revalidatePath(`/vehicle/${entityId}`)
          success = true
        }
      }
    }
    else if (entityType === "import") {
      const existing = await db.select().from(importPermits).where(eq(importPermits.id, entityId)).limit(1)
      if (existing.length > 0) {
        const docs = (existing[0].documents as string[]) || []
        const newDocs = docs.filter(d => d !== fileUrl)

        if (newDocs.length !== docs.length) {
          await db.update(importPermits)
            .set({ documents: newDocs, updatedAt: new Date() })
            .where(eq(importPermits.id, entityId))

          await tryDeleteS3(fileUrl)
          revalidatePath("/import")
          revalidatePath(`/import/${entityId}`)
          success = true
        }
      }
    }
    else if (entityType === "company") {
      const existing = await db.select().from(companyRegistrations).where(eq(companyRegistrations.id, entityId)).limit(1)
      if (existing.length > 0) {
        const docs = (existing[0].documents as string[]) || []
        const newDocs = docs.filter(d => d !== fileUrl)

        if (newDocs.length !== docs.length) {
          await db.update(companyRegistrations)
            .set({ documents: newDocs, updatedAt: new Date() })
            .where(eq(companyRegistrations.id, entityId))

          await tryDeleteS3(fileUrl)
          revalidatePath("/company")
          revalidatePath(`/company/${entityId}`)
          success = true
        }
      }
    }
    else if (entityType === "person") {
      const existing = await db.select().from(people).where(eq(people.id, entityId)).limit(1)
      if (existing.length > 0) {
        // People mainly use documentSections
        const sections = (existing[0].documentSections as any[]) || []
        let modified = false

        sections.forEach(section => {
          if (section.files && Array.isArray(section.files)) {
            const originalLen = section.files.length
            section.files = section.files.filter((f: string) => f !== fileUrl)
            if (section.files.length !== originalLen) modified = true
          }
        })

        if (modified) {
          await db.update(people)
            .set({ documentSections: sections, updatedAt: new Date() })
            .where(eq(people.id, entityId))

          await tryDeleteS3(fileUrl)
          revalidatePath("/foreigners")
          revalidatePath(`/foreigners/${entityId}`)
          success = true
        }
      }
    }

    if (success) {
      return { success: true }
    } else {
      return { success: false, error: "Document not found or could not be deleted" }
    }
  } catch (error) {
    console.error(`Error deleting ${entityType} document:`, error)
    return { success: false, error: "Failed to delete document" }
  }
}

/**
 * Upload a file and create document record
 * This is a placeholder - actual file upload logic depends on your storage solution
 */
export async function uploadDocument(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const personId = formData.get("personId") as string
    const title = formData.get("title") as string | undefined
    const issuedBy = formData.get("issuedBy") as string | undefined
    const number = formData.get("number") as string | undefined

    if (!file || !type) {
      return { success: false, error: "File and type are required" }
    }

    // Resolve personId from ticket number if not provided
    let resolvedPersonId: string | undefined = personId || undefined
    if (!resolvedPersonId && number) {
      const ticket = number.toUpperCase()
      const ticketPattern = /^[A-Z]{3}-\d{4}-\d{4}$/
      if (ticketPattern.test(ticket)) {
        const permitMatch = await db
          .select({ personId: permits.personId })
          .from(permits)
          .where(eq(permits.ticketNumber, ticket))
          .limit(1)

        if (permitMatch.length > 0) {
          resolvedPersonId = permitMatch[0].personId || undefined
        }
      }
    }

    // Upload to MinIO
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url: fileUrl } = await uploadFile(buffer, file.name, file.type, "documents")

    const fileSize = file.size
    const mimeType = file.type

    // Create document record
    return await createDocument({
      type,
      title,
      issuedBy,
      number,
      fileUrl,
      fileSize,
      mimeType,
      personId: resolvedPersonId,
    })
  } catch (error) {
    console.error("Error uploading document:", error)
    return { success: false, error: "Failed to upload document" }
  }
}

/**
 * Get documents expiring soon
 */
export async function getExpiringDocuments(daysAhead: number = 30) {
  try {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const result = await db
      .select({
        document: documentsV2,
        person: people,
      })
      .from(documentsV2)
      .leftJoin(people, eq(documentsV2.personId, people.id))
      .where(sql`${documentsV2.expiryDate} IS NOT NULL AND ${documentsV2.expiryDate} <= ${futureDate}`)
      .orderBy(documentsV2.expiryDate)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching expiring documents:", error)
    return { success: false, error: "Failed to fetch expiring documents" }
  }
}
