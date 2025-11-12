"use server"

import { db, tasks, categories, users, NewTask } from "@/lib/db"
import { eq, and, desc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Get all tasks with related data
export async function getTasks() {
  try {
    const result = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        assignee: users.name,
        assigneeId: tasks.assigneeId,
        category: categories.name,
        categoryId: tasks.categoryId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        completedAt: tasks.completedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .leftJoin(categories, eq(tasks.categoryId, categories.id))
      .orderBy(desc(tasks.createdAt))

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return { success: false, error: "Failed to fetch tasks" }
  }
}

// Get a single task by ID
export async function getTaskById(taskId: string) {
  try {
    const result = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        assignee: users.name,
        assigneeId: tasks.assigneeId,
        category: categories.name,
        categoryId: tasks.categoryId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        completedAt: tasks.completedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .leftJoin(categories, eq(tasks.categoryId, categories.id))
      .where(eq(tasks.id, taskId))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: "Task not found" }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error fetching task:", error)
    return { success: false, error: "Failed to fetch task" }
  }
}

// Create a new task
export async function createTask(data: {
  title: string
  description?: string
  status: "pending" | "in-progress" | "completed" | "urgent"
  priority: "low" | "medium" | "high"
  dueDate?: Date
  assigneeId?: string
  categoryId?: string
  departmentId?: string
  createdById?: string
}) {
  try {
    const result = await db
      .insert(tasks)
      .values({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      })
      .returning()

    revalidatePath("/tasks")
    revalidatePath("/tasks/kanban")
    revalidatePath("/tasks/calendar")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating task:", error)
    return { success: false, error: "Failed to create task" }
  }
}

// Update a task
export async function updateTask(
  taskId: string,
  data: Partial<{
    title: string
    description: string
    status: "pending" | "in-progress" | "completed" | "urgent"
    priority: "low" | "medium" | "high"
    dueDate: Date
    assigneeId: string
    categoryId: string
    departmentId: string
  }>
) {
  try {
    const updateData: any = { ...data, updatedAt: new Date() }

    // If status is completed, set completedAt
    if (data.status === "completed") {
      updateData.completedAt = new Date()
    }

    const result = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Task not found" }
    }

    revalidatePath("/tasks")
    revalidatePath("/tasks/kanban")
    revalidatePath("/tasks/calendar")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating task:", error)
    return { success: false, error: "Failed to update task" }
  }
}

// Delete a task
export async function deleteTask(taskId: string) {
  try {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Task not found" }
    }

    revalidatePath("/tasks")
    revalidatePath("/tasks/kanban")
    revalidatePath("/tasks/calendar")
    revalidatePath("/dashboard")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: "Failed to delete task" }
  }
}

// Get tasks by status
export async function getTasksByStatus(status: "pending" | "in-progress" | "completed" | "urgent") {
  try {
    const result = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        assignee: users.name,
        assigneeId: tasks.assigneeId,
        category: categories.name,
        categoryId: tasks.categoryId,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .leftJoin(categories, eq(tasks.categoryId, categories.id))
      .where(eq(tasks.status, status))
      .orderBy(desc(tasks.createdAt))

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching tasks by status:", error)
    return { success: false, error: "Failed to fetch tasks" }
  }
}

// Get task statistics
export async function getTaskStats() {
  try {
    const stats = await db
      .select({
        status: tasks.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(tasks)
      .groupBy(tasks.status)

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.status] = stat.count
      return acc
    }, {} as Record<string, number>)

    return {
      success: true,
      data: {
        all: stats.reduce((sum, stat) => sum + stat.count, 0),
        pending: statsMap.pending || 0,
        "in-progress": statsMap["in-progress"] || 0,
        completed: statsMap.completed || 0,
        urgent: statsMap.urgent || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching task stats:", error)
    return { success: false, error: "Failed to fetch task statistics" }
  }
}
