"use server"

import { db, categories, NewCategory } from "@/lib/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Get all categories
export async function getCategories(type?: "task" | "document") {
  try {
    const result = type
      ? await db.select().from(categories).where(eq(categories.type, type))
      : await db.select().from(categories)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return { success: false, error: "Failed to fetch categories" }
  }
}

// Get a single category by ID
export async function getCategoryById(categoryId: string) {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: "Category not found" }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error fetching category:", error)
    return { success: false, error: "Failed to fetch category" }
  }
}

// Create a new category
export async function createCategory(data: {
  name: string
  type: "task" | "document"
  color?: string
}) {
  try {
    const result = await db
      .insert(categories)
      .values(data)
      .returning()

    revalidatePath("/tasks")
    revalidatePath("/documents")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, error: "Failed to create category" }
  }
}

// Update a category
export async function updateCategory(
  categoryId: string,
  data: Partial<{
    name: string
    color: string
  }>
) {
  try {
    const result = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, categoryId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Category not found" }
    }

    revalidatePath("/tasks")
    revalidatePath("/documents")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating category:", error)
    return { success: false, error: "Failed to update category" }
  }
}

// Delete a category
export async function deleteCategory(categoryId: string) {
  try {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Category not found" }
    }

    revalidatePath("/tasks")
    revalidatePath("/documents")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: "Failed to delete category" }
  }
}
