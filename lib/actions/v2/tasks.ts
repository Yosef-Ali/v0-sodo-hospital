"use server"

import { db, tasksV2, users, permits, people, permitChecklistItems, checklists, documentsV2, vehicles, importPermits, companyRegistrations } from "@/lib/db"
import { eq, desc, and, gte, lte, sql, or, isNull, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { gregorianToEC, formatEC } from "@/lib/dates/ethiopian"
import { hospitalTaskCategories, getAllWorkflows, TaskWorkflow, DocumentItem } from "@/lib/data/hospital-tasks"
import { syncTaskToCalendar } from "@/lib/actions/v2/calendar-events"

/**
 * Get all tasks with optional filters and pagination
 */
export async function getTasks(params?: {
  assigneeId?: string
  permitId?: string
  status?: "pending" | "in-progress" | "completed" | "urgent"
  priority?: "low" | "medium" | "high"
  dueBefore?: Date
  dueAfter?: Date
  includeCompleted?: boolean
  limit?: number
  offset?: number
}) {
  const {
    assigneeId,
    permitId,
    status,
    priority,
    dueBefore,
    dueAfter,
    includeCompleted = true,
    limit = 50,
    offset = 0,
  } = params || {}

  try {
    let queryBuilder = db
      .select({
        task: tasksV2,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        permit: {
          id: permits.id,
          category: permits.category,
          status: permits.status,
        },
        person: {
          id: people.id,
          firstName: people.firstName,
          lastName: people.lastName,
        },
      })
      .from(tasksV2)
      .leftJoin(users, eq(tasksV2.assigneeId, users.id))
      .leftJoin(permits, eq(tasksV2.permitId, permits.id))
      .leftJoin(people, eq(permits.personId, people.id))

    // Build where conditions
    const conditions = []
    if (assigneeId) conditions.push(eq(tasksV2.assigneeId, assigneeId))
    if (permitId) conditions.push(eq(tasksV2.permitId, permitId))
    if (status) conditions.push(eq(tasksV2.status, status))
    if (priority) conditions.push(eq(tasksV2.priority, priority))
    if (dueBefore) conditions.push(lte(tasksV2.dueDate, dueBefore))
    if (dueAfter) conditions.push(gte(tasksV2.dueDate, dueAfter))
    if (!includeCompleted) {
      conditions.push(
        or(
          eq(tasksV2.status, "pending"),
          eq(tasksV2.status, "in-progress"),
          eq(tasksV2.status, "urgent")
        )
      )
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any
    }

    const result = await queryBuilder
      .orderBy(desc(tasksV2.createdAt))
      .limit(limit)
      .offset(offset)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return { success: false, error: "Failed to fetch tasks" }
  }
}

/**
 * Get a single task by ID with all related data
 */
export async function getTaskById(taskId: string) {
  try {
    const result = await db
      .select({
        task: tasksV2,
        assignee: users,
        permit: permits,
        person: people,
      })
      .from(tasksV2)
      .leftJoin(users, eq(tasksV2.assigneeId, users.id))
      .leftJoin(permits, eq(tasksV2.permitId, permits.id))
      .leftJoin(people, eq(permits.personId, people.id))
      .where(eq(tasksV2.id, taskId))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: "Task not found" }
    }

    const taskData = result[0]
    let entityData = null

    // Fetch linked entity if available
    if (taskData.task.entityType && taskData.task.entityId) {
      if (taskData.task.entityType === 'vehicle') {
        const vehicle = await db.query.vehicles.findFirst({
          where: eq(vehicles.id, taskData.task.entityId)
        })
        if (vehicle) entityData = { type: 'vehicle', data: vehicle }
      } else if (taskData.task.entityType === 'import') {
        const importPermit = await db.query.importPermits.findFirst({
          where: eq(importPermits.id, taskData.task.entityId)
        })
        if (importPermit) entityData = { type: 'import', data: importPermit }
      } else if (taskData.task.entityType === 'company') {
        const company = await db.query.companyRegistrations.findFirst({
          where: eq(companyRegistrations.id, taskData.task.entityId)
        })
        if (company) entityData = { type: 'company', data: company }
      } else if (taskData.task.entityType === 'person' && !taskData.person) {
        // If linked as 'person' but not via permit (fallback)
        const person = await db.query.people.findFirst({
          where: eq(people.id, taskData.task.entityId)
        })
        if (person) entityData = { type: 'person', data: person }
      }
    }

    return { success: true, data: { ...taskData, linkedEntity: entityData } }
  } catch (error) {
    console.error("Error fetching task:", error)
    return { success: false, error: "Failed to fetch task details" }
  }
}

/**
 * Create a new task
 */
export async function createTask(data: {
  title: string
  description?: string
  status?: "pending" | "in-progress" | "completed" | "urgent"
  priority?: "low" | "medium" | "high"
  dueDate?: Date
  assigneeId?: string
  permitId?: string
  entityType?: string  // 'person', 'vehicle', 'import', 'company'
  entityId?: string    // ID of the linked entity
  notes?: string
}) {
  try {
    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      return { success: false, error: "Task title is required" }
    }

    // Validate assignee exists if provided
    if (data.assigneeId) {
      const assigneeExists = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, data.assigneeId))
        .limit(1)

      if (assigneeExists.length === 0) {
        return { success: false, error: "Assignee not found" }
      }
    }

    // Validate permit exists if provided
    if (data.permitId) {
      const permitExists = await db
        .select({ id: permits.id })
        .from(permits)
        .where(eq(permits.id, data.permitId))
        .limit(1)

      if (permitExists.length === 0) {
        return { success: false, error: "Permit not found" }
      }
    }

    const result = await db
      .insert(tasksV2)
      .values({
        title: data.title.trim(),
        description: data.description,
        status: data.status || "pending",
        priority: data.priority || "medium",
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,
        permitId: data.permitId,
        entityType: data.entityType,
        entityId: data.entityId,
        notes: data.notes,
      })
      .returning()

    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    if (data.permitId) {
      revalidatePath(`/permits/${data.permitId}`)
    }
    // Revalidate linked entity page
    if (data.entityType && data.entityId) {
      const entityRoutes: Record<string, string> = {
        person: "foreigners",
        vehicle: "vehicle",
        import: "import",
        company: "company",
      }
      const route = entityRoutes[data.entityType]
      if (route) {
        revalidatePath(`/${route}/${data.entityId}`)
      }
    }

    // Sync to calendar
    if (data.dueDate) {
      await syncTaskToCalendar(result[0].id)
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating task:", error)
    return { success: false, error: "Failed to create task" }
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  data: Partial<{
    title: string
    description: string
    status: "pending" | "in-progress" | "completed" | "urgent"
    priority: "low" | "medium" | "high"
    dueDate: Date
    assigneeId: string
    notes: string
    entityType: string
    entityId: string
  }>
) {
  try {
    // Check if task exists
    const existing = await db
      .select({
        id: tasksV2.id,
        permitId: tasksV2.permitId,
        entityType: tasksV2.entityType,
        entityId: tasksV2.entityId
      })
      .from(tasksV2)
      .where(eq(tasksV2.id, taskId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Task not found" }
    }

    // Validate title if provided
    if (data.title !== undefined && data.title.trim().length === 0) {
      return { success: false, error: "Task title cannot be empty" }
    }

    // Validate assignee if provided
    if (data.assigneeId !== undefined && data.assigneeId !== "") {
      const assigneeExists = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, data.assigneeId))
        .limit(1)

      if (assigneeExists.length === 0) {
        return { success: false, error: "Assignee not found" }
      }
    }

    const updateData: any = { ...data, updatedAt: new Date() }
    if (data.title) updateData.title = data.title.trim()

    // If marking as completed, set completedAt
    if (data.status === "completed" && !updateData.completedAt) {
      updateData.completedAt = new Date()
    }

    const result = await db
      .update(tasksV2)
      .set(updateData)
      .where(eq(tasksV2.id, taskId))
      .returning()

    revalidatePath("/tasks")
    revalidatePath(`/tasks/${taskId}`)
    revalidatePath("/dashboard")
    if (existing[0].permitId) {
      revalidatePath(`/permits/${existing[0].permitId}`)
    }

    // Revalidate old entity path
    if (existing[0].entityType && existing[0].entityId) {
      const entityRoutes: Record<string, string> = {
        person: "foreigners",
        vehicle: "vehicle",
        import: "import",
        company: "company",
      }
      const route = entityRoutes[existing[0].entityType]
      if (route) {
        revalidatePath(`/${route}/${existing[0].entityId}`)
      }
    }

    // Revalidate new entity path if different
    if (data.entityType && data.entityId && (data.entityType !== existing[0].entityType || data.entityId !== existing[0].entityId)) {
      const entityRoutes: Record<string, string> = {
        person: "foreigners",
        vehicle: "vehicle",
        import: "import",
        company: "company",
      }
      const route = entityRoutes[data.entityType]
      if (route) {
        revalidatePath(`/${route}/${data.entityId}`)
      }
    }

    // Sync to calendar
    await syncTaskToCalendar(result[0].id)

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating task:", error)
    return { success: false, error: "Failed to update task" }
  }
}

/**
 * Complete a task
 */
export async function completeTask(taskId: string, notes?: string) {
  try {
    const existing = await db
      .select({ id: tasksV2.id, permitId: tasksV2.permitId })
      .from(tasksV2)
      .where(eq(tasksV2.id, taskId))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: "Task not found" }
    }

    const result = await db
      .update(tasksV2)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
        notes: notes || undefined,
      })
      .where(eq(tasksV2.id, taskId))
      .returning()

    revalidatePath("/tasks")
    revalidatePath(`/tasks/${taskId}`)
    revalidatePath("/dashboard")
    if (existing[0].permitId) {
      revalidatePath(`/permits/${existing[0].permitId}`)
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error completing task:", error)
    return { success: false, error: "Failed to complete task" }
  }
}

/**
 * Delete a task
 */
/**
 * Delete a task
 */
export async function deleteTask(taskId: string, options?: { deletePermit?: boolean }) {
  try {
    const { deletePermit = false } = options || {}

    // First check if task exists to get linked permitId
    const taskCheck = await db
      .select({ id: tasksV2.id, permitId: tasksV2.permitId })
      .from(tasksV2)
      .where(eq(tasksV2.id, taskId))
      .limit(1)

    if (taskCheck.length === 0) {
      return { success: false, error: "Task not found" }
    }

    const taskToDelete = taskCheck[0]

    // Delete task first
    const result = await db
      .delete(tasksV2)
      .where(eq(tasksV2.id, taskId))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Task not found" }
    }

    // Optional: Delete related permit
    if (deletePermit && taskToDelete.permitId) {
      // Delete checklist items for this permit first
      await db.delete(permitChecklistItems).where(eq(permitChecklistItems.permitId, taskToDelete.permitId))

      // Delete permit history if any (assuming schema exists but not imported, skip if causing issues or do it safe)
      // Ignoring history delete for now to be safe, or just cascading permit delete

      // Delete permit
      await db.delete(permits).where(eq(permits.id, taskToDelete.permitId))
      revalidatePath(`/permits/${taskToDelete.permitId}`)
    }

    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    if (result[0].permitId) {
      revalidatePath(`/permits/${result[0].permitId}`)
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: "Failed to delete task" }
  }
}

/**
 * Get tasks by permit ID
 */
export async function getTasksByPermit(permitId: string) {
  try {
    const result = await db
      .select({
        task: tasksV2,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(tasksV2)
      .leftJoin(users, eq(tasksV2.assigneeId, users.id))
      .where(eq(tasksV2.permitId, permitId))
      .orderBy(desc(tasksV2.dueDate))

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching tasks by permit:", error)
    return { success: false, error: "Failed to fetch permit tasks" }
  }
}

/**
 * Get task statistics
 */
export async function getTaskStats() {
  try {
    const stats = await db
      .select({
        status: tasksV2.status,
        priority: tasksV2.priority,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(tasksV2)
      .groupBy(tasksV2.status, tasksV2.priority)

    // Aggregate by status
    const byStatus = stats.reduce((acc, stat) => {
      acc[stat.status] = (acc[stat.status] || 0) + stat.count
      return acc
    }, {} as Record<string, number>)

    // Aggregate by priority
    const byPriority = stats.reduce((acc, stat) => {
      acc[stat.priority] = (acc[stat.priority] || 0) + stat.count
      return acc
    }, {} as Record<string, number>)

    const total = stats.reduce((sum, stat) => sum + stat.count, 0)

    return {
      success: true,
      data: {
        total,
        byStatus: {
          pending: byStatus.pending || 0,
          "in-progress": byStatus["in-progress"] || 0,
          completed: byStatus.completed || 0,
          urgent: byStatus.urgent || 0,
        },
        byPriority: {
          low: byPriority.low || 0,
          medium: byPriority.medium || 0,
          high: byPriority.high || 0,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching task stats:", error)
    return { success: false, error: "Failed to fetch task statistics" }
  }
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks() {
  try {
    const now = new Date()

    const result = await db
      .select({
        task: tasksV2,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        permit: {
          id: permits.id,
          category: permits.category,
        },
        person: {
          id: people.id,
          firstName: people.firstName,
          lastName: people.lastName,
        },
      })
      .from(tasksV2)
      .leftJoin(users, eq(tasksV2.assigneeId, users.id))
      .leftJoin(permits, eq(tasksV2.permitId, permits.id))
      .leftJoin(people, eq(permits.personId, people.id))
      .where(
        and(
          sql`${tasksV2.dueDate} IS NOT NULL`,
          lte(tasksV2.dueDate, now),
          or(
            eq(tasksV2.status, "pending"),
            eq(tasksV2.status, "in-progress"),
            eq(tasksV2.status, "urgent")
          )
        )
      )
      .orderBy(tasksV2.dueDate)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching overdue tasks:", error)
    return { success: false, error: "Failed to fetch overdue tasks" }
  }
}

/**
 * Generate reminder tasks for permits
 * Creates tasks at 90, 60, 30, and 7 days before permit due date
 */
export async function generateReminderTasks(permitId: string) {
  try {
    // Get permit details
    const permitResult = await db
      .select({
        permit: permits,
        person: people,
      })
      .from(permits)
      .leftJoin(people, eq(permits.personId, people.id))
      .where(eq(permits.id, permitId))
      .limit(1)

    if (permitResult.length === 0) {
      return { success: false, error: "Permit not found" }
    }

    const permit = permitResult[0].permit
    const person = permitResult[0].person

    if (!permit.dueDate) {
      return { success: false, error: "Permit has no due date" }
    }

    const dueDate = new Date(permit.dueDate)
    const now = new Date()

    // Define reminder windows: [days before due date, priority, title suffix]
    const reminderWindows: Array<[number, "low" | "medium" | "high", string]> = [
      [90, "low", "90 days"],
      [60, "medium", "60 days"],
      [30, "medium", "30 days"],
      [7, "high", "7 days"],
    ]

    const createdTasks = []

    for (const [daysBefore, priority, titleSuffix] of reminderWindows) {
      const reminderDate = new Date(dueDate)
      reminderDate.setDate(reminderDate.getDate() - daysBefore)

      // Only create task if reminder date is in the future
      if (reminderDate > now) {
        const categoryLabel = {
          WORK_PERMIT: "Work Permit",
          RESIDENCE_ID: "Residence ID",
          MEDICAL_LICENSE: "MOH License",
          PIP: "EFDA PIP",
          CUSTOMS: "Customs",
          CAR_BOLO_INSURANCE: "Bolo & Insurance"
        }[permit.category]

        const personName = person
          ? `${person.firstName} ${person.lastName}`
          : "Unknown"

        const title = `Reminder: ${categoryLabel} for ${personName} (${titleSuffix} before due)`

        const description = `This is an automated reminder that the ${categoryLabel} for ${personName} will be due in ${daysBefore} days.\n\nDue Date: ${dueDate.toLocaleDateString()}\nPermit Status: ${permit.status}`

        const result = await db
          .insert(tasksV2)
          .values({
            title,
            description,
            status: "pending",
            priority,
            dueDate: reminderDate,
            permitId,
            notes: `Auto-generated ${daysBefore}-day reminder`,
          })
          .returning()

        createdTasks.push(result[0])
      }
    }

    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    revalidatePath(`/permits/${permitId}`)

    return {
      success: true,
      data: createdTasks,
      message: `Created ${createdTasks.length} reminder task(s)`,
    }
  } catch (error) {
    console.error("Error generating reminder tasks:", error)
    return { success: false, error: "Failed to generate reminder tasks" }
  }
}

/**
 * Get upcoming tasks (due within specified days)
 */
export async function getUpcomingTasks(daysAhead: number = 7) {
  try {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const result = await db
      .select({
        task: tasksV2,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        permit: {
          id: permits.id,
          category: permits.category,
        },
        person: {
          id: people.id,
          firstName: people.firstName,
          lastName: people.lastName,
        },
      })
      .from(tasksV2)
      .leftJoin(users, eq(tasksV2.assigneeId, users.id))
      .leftJoin(permits, eq(tasksV2.permitId, permits.id))
      .leftJoin(people, eq(permits.personId, people.id))
      .where(
        and(
          sql`${tasksV2.dueDate} IS NOT NULL`,
          gte(tasksV2.dueDate, now),
          lte(tasksV2.dueDate, futureDate),
          or(
            eq(tasksV2.status, "pending"),
            eq(tasksV2.status, "in-progress"),
            eq(tasksV2.status, "urgent")
          )
        )
      )
      .orderBy(tasksV2.dueDate)

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error)
    return { success: false, error: "Failed to fetch upcoming tasks" }
  }
}
/**
 * Create a new task with full workflow support (Permits, Checklists, Document Linking)
 */
export async function createTaskWithWorkflow(data: {
  title: string
  description?: string
  status?: "pending" | "in-progress" | "completed" | "urgent"
  priority?: "low" | "medium" | "high"
  dueDate?: Date
  assigneeId?: string
  personId?: string
  category: string // e.g., "work-permit", "moh-licensing"
  subType?: string // e.g., "NEW", "RENEWAL"
  notes?: string
}) {
  try {
    // 1. Find matching workflow
    let workflow: TaskWorkflow | undefined
    if (data.category && data.subType) {
      const allWorkflows = getAllWorkflows()
      workflow = allWorkflows.find(
        (wf) => wf.category === data.category && wf.subcategory === data.subType
      )
    }

    // Default description if workflow found
    let finalDescription = data.description || ""
    if (workflow && !finalDescription) {
      finalDescription = workflow.description
    }

    // 2. Create Permit if applicable (requires personId)
    let permitId: string | undefined
    if (workflow && data.personId) {
      // Map frontend category to DB enum
      // "work-permit" -> "WORK_PERMIT"
      // "residence-id" -> "RESIDENCE_ID"
      // "moh-licensing" -> "MEDICAL_LICENSE"
      // "customs" -> "CUSTOMS"
      // "bolo-insurance" -> "CAR_BOLO_INSURANCE" (approximated)

      let dbCategory: "WORK_PERMIT" | "RESIDENCE_ID" | "MEDICAL_LICENSE" | "PIP" | "CUSTOMS" | "CAR_BOLO_INSURANCE" | null = null

      if (data.category === "work-permit") dbCategory = "WORK_PERMIT"
      else if (data.category === "residence-id") dbCategory = "RESIDENCE_ID"
      else if (data.category === "moh-licensing") dbCategory = "MEDICAL_LICENSE"
      else if (data.category === "customs" || "pip") dbCategory = "CUSTOMS" // Simplified mapping
      else if (data.category === "bolo-insurance") dbCategory = "CAR_BOLO_INSURANCE"

      if (dbCategory) {
        // Create Permit
        const [newPermit] = await db.insert(permits).values({
          category: dbCategory,
          subType: data.subType as any,
          personId: data.personId,
          status: "PENDING",
          dueDate: data.dueDate,
          createdAt: new Date(),
        }).returning()

        permitId = newPermit.id

        // 3. Create Checklist Items & Smart Document Linking
        // Check what docs the person ALREADY has
        const personDocs = await db.query.documentsV2.findMany({
          where: eq(documentsV2.personId, data.personId)
        })

        const personRecord = await db.query.people.findFirst({
          where: eq(people.id, data.personId)
        })

        if (workflow.documents.length > 0) {
          for (const doc of workflow.documents) {
            let isCompleted = false
            let fileUrls: string[] = []

            // SMART CHECK 1: Specific Person Columns
            if (personRecord) {
              if (doc.name.toLowerCase().includes("passport") && personRecord.passportDocuments?.length) {
                isCompleted = true
                fileUrls = personRecord.passportDocuments
              } else if (doc.name.toLowerCase().includes("work permit") && personRecord.workPermitDocuments?.length) {
                isCompleted = true
                fileUrls = personRecord.workPermitDocuments
              } else if (doc.name.toLowerCase().includes("residence id") && personRecord.residenceIdDocuments?.length) {
                isCompleted = true
                fileUrls = personRecord.residenceIdDocuments
              }
            }

            // SMART CHECK 2: Generic Documents
            if (!isCompleted) {
              // Fuzzy match document type/title
              // e.g. doc.name="Passport Copy" matches existing doc with title="Passport"
              const matchingDoc = personDocs.find(d =>
                (d.title && doc.name.toLowerCase().includes(d.title.toLowerCase())) ||
                (d.type && doc.name.toLowerCase().includes(d.type.toLowerCase()))
              )
              if (matchingDoc && matchingDoc.fileUrl) {
                isCompleted = true
                fileUrls = [matchingDoc.fileUrl]
              }
            }

            // Create Checklist Item
            await db.insert(permitChecklistItems).values({
              permitId: newPermit.id,
              label: doc.name,
              required: doc.required,
              completed: isCompleted,
              fileUrls: fileUrls,
              notes: doc.notes, // + (isCompleted ? " (Auto-linked from existing)" : ""),
            })
          }
        }
      }
    }

    // 4. Create Task
    const result = await db
      .insert(tasksV2)
      .values({
        title: data.title.trim(),
        description: finalDescription,
        status: data.status || "pending",
        priority: data.priority || "medium",
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,
        permitId: permitId, // Linked to newly created permit
        notes: data.notes || (workflow ? `Generated from ${workflow.title}` : ""),
      })
      .returning()

    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    if (permitId) {
      revalidatePath(`/permits/${permitId}`)
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating task with workflow:", error)
    return { success: false, error: "Failed to create task" }
  }
}
