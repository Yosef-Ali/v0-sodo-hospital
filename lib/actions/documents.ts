"use server"

import { db, documents, categories, users, NewDocument } from "@/lib/db"
import { eq, desc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Get all documents with related data
export async function getDocuments() {
  try {
    const result = await db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        status: documents.status,
        category: categories.name,
        categoryId: documents.categoryId,
        fileType: documents.fileType,
        fileSize: documents.fileSize,
        fileUrl: documents.fileUrl,
        owner: users.name,
        ownerId: documents.ownerId,
        tags: documents.tags,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .orderBy(desc(documents.updatedAt))

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching documents:", error)
    return { success: false, error: "Failed to fetch documents" }
  }
}

// Get a single document by ID
export async function getDocumentById(documentId: string) {
  try {
    const result = await db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        status: documents.status,
        category: categories.name,
        categoryId: documents.categoryId,
        fileType: documents.fileType,
        fileSize: documents.fileSize,
        fileUrl: documents.fileUrl,
        owner: users.name,
        ownerId: documents.ownerId,
        tags: documents.tags,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .where(eq(documents.id, documentId))
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

// Create a new document
export async function createDocument(data: {
  title: string
  description?: string
  status?: "pending" | "approved" | "review"
  categoryId?: string
  fileType?: string
  fileSize?: string
  fileUrl?: string
  ownerId?: string
  departmentId?: string
  tags?: string[]
}) {
  try {
    const result = await db
      .insert(documents)
      .values({
        ...data,
        status: data.status || "pending",
      })
      .returning()

    revalidatePath("/documents")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating document:", error)
    return { success: false, error: "Failed to create document" }
  }
}

// Update a document
export async function updateDocument(
  documentId: string,
  data: Partial<{
    title: string
    description: string
    status: "pending" | "approved" | "review"
    categoryId: string
    fileType: string
    fileSize: string
    fileUrl: string
    ownerId: string
    departmentId: string
    tags: string[]
  }>
) {
  try {
    const result = await db
      .update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documents.id, documentId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Document not found" }
    }

    revalidatePath("/documents")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating document:", error)
    return { success: false, error: "Failed to update document" }
  }
}

// Delete a document
export async function deleteDocument(documentId: string) {
  try {
    const result = await db
      .delete(documents)
      .where(eq(documents.id, documentId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Document not found" }
    }

    revalidatePath("/documents")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { success: false, error: "Failed to delete document" }
  }
}

// Get documents by status
export async function getDocumentsByStatus(status: "pending" | "approved" | "review") {
  try {
    const result = await db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        status: documents.status,
        category: categories.name,
        categoryId: documents.categoryId,
        fileType: documents.fileType,
        fileSize: documents.fileSize,
        owner: users.name,
        tags: documents.tags,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .where(eq(documents.status, status))
      .orderBy(desc(documents.updatedAt))

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching documents by status:", error)
    return { success: false, error: "Failed to fetch documents" }
  }
}

// Get document statistics
export async function getDocumentStats() {
  try {
    const stats = await db
      .select({
        status: documents.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(documents)
      .groupBy(documents.status)

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.status] = stat.count
      return acc
    }, {} as Record<string, number>)

    return {
      success: true,
      data: {
        all: stats.reduce((sum, stat) => sum + stat.count, 0),
        pending: statsMap.pending || 0,
        approved: statsMap.approved || 0,
        review: statsMap.review || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching document stats:", error)
    return { success: false, error: "Failed to fetch document statistics" }
  }
}
