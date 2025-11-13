"use server"

import { db, tasksV2, permits, people, calendarEvents, activityLogs, users } from "@/lib/db"
import { eq, and, desc, sql, gte, lte, or } from "drizzle-orm"

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    // Get task stats
    const taskStats = await db
      .select({
        status: tasksV2.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(tasksV2)
      .groupBy(tasksV2.status)

    const tasksByStatus = taskStats.reduce((acc, stat) => {
      acc[stat.status] = stat.count
      return acc
    }, {} as Record<string, number>)

    // Get permit stats
    const permitStats = await db
      .select({
        status: permits.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(permits)
      .groupBy(permits.status)

    const permitsByStatus = permitStats.reduce((acc, stat) => {
      acc[stat.status] = stat.count
      return acc
    }, {} as Record<string, number>)

    // Get people count
    const [peopleCount] = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(people)

    // Get calendar events for next 7 days
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)

    const [upcomingEventsCount] = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(calendarEvents)
      .where(
        and(
          gte(calendarEvents.startDate, now),
          lte(calendarEvents.startDate, futureDate)
        )
      )

    // Get overdue tasks count
    const [overdueCount] = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(tasksV2)
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

    return {
      success: true,
      data: {
        tasks: {
          pending: tasksByStatus.pending || 0,
          inProgress: tasksByStatus["in-progress"] || 0,
          completed: tasksByStatus.completed || 0,
          urgent: tasksByStatus.urgent || 0,
          overdue: overdueCount?.count || 0,
          total: Object.values(tasksByStatus).reduce((sum, count) => sum + count, 0),
        },
        permits: {
          pending: permitsByStatus.PENDING || 0,
          submitted: permitsByStatus.SUBMITTED || 0,
          approved: permitsByStatus.APPROVED || 0,
          rejected: permitsByStatus.REJECTED || 0,
          expired: permitsByStatus.EXPIRED || 0,
          total: Object.values(permitsByStatus).reduce((sum, count) => sum + count, 0),
        },
        people: {
          total: peopleCount?.count || 0,
        },
        calendar: {
          upcomingEvents: upcomingEventsCount?.count || 0,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      success: false,
      error: "Failed to fetch dashboard statistics",
    }
  }
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(limit: number = 10) {
  try {
    const activities = await db
      .select({
        activity: activityLogs,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)

    return {
      success: true,
      data: activities,
    }
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return {
      success: false,
      error: "Failed to fetch recent activity",
      data: [],
    }
  }
}

/**
 * Get dashboard summary for quick overview
 */
export async function getDashboardSummary() {
  try {
    const stats = await getDashboardStats()

    if (!stats.success) {
      return stats
    }

    const data = stats.data

    return {
      success: true,
      data: {
        cards: [
          {
            title: "Pending Tasks",
            value: data.tasks.pending.toString(),
            change: "+2.5%",
            changeType: "positive" as const,
          },
          {
            title: "In Progress",
            value: data.tasks.inProgress.toString(),
            change: "+5.0%",
            changeType: "positive" as const,
          },
          {
            title: "Completed",
            value: data.tasks.completed.toString(),
            change: "+12.5%",
            changeType: "positive" as const,
          },
        ],
        metrics: {
          permits: {
            value: data.permits.total.toString(),
            pending: Math.round((data.permits.pending / Math.max(data.permits.total, 1)) * 100),
            approved: Math.round((data.permits.approved / Math.max(data.permits.total, 1)) * 100),
            rejected: Math.round((data.permits.rejected / Math.max(data.permits.total, 1)) * 100),
            needsReview: data.permits.pending + data.permits.submitted,
          },
          tasks: {
            overdue: data.tasks.overdue,
            upcoming: data.calendar.upcomingEvents,
          },
        },
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    return {
      success: false,
      error: "Failed to fetch dashboard summary",
    }
  }
}
