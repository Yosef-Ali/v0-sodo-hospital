"use server"

import { db, documentsV2, people, type DocumentV2, type NewDocumentV2 } from "@/lib/db"
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

    // Check if person exists if personId is provided
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
      .insert(documentsV2)
      .values(data)
      .returning()

    if (data.personId) {
      revalidatePath(`/people/${data.personId}`)
    }
    revalidatePath("/documents")

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
 * Delete a document
 * Note: This should also delete the physical file from storage
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

    if (result[0].personId) {
      revalidatePath(`/people/${result[0].personId}`)
    }
    revalidatePath("/documents")

    // TODO: Delete physical file from storage
    // if (result[0].fileUrl) {
    //   await deleteFileFromStorage(result[0].fileUrl)
    // }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting document:", error)
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

    // TODO: Implement actual file upload to S3 or local storage
    // For now, we'll create a placeholder file URL
    const fileUrl = `/uploads/${Date.now()}-${file.name}`
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
      personId: personId || undefined,
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
