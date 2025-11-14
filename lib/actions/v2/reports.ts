"use server"

import { db } from "@/lib/db"
import { permits, tasksV2, people } from "@/lib/db/schema"
import { count, sql, and, gte } from "drizzle-orm"
import { unstable_cache } from "next/cache"

export interface ReportStats {
  totalPermits: number
  totalTasks: number
  totalPeople: number
  expiringSoon: number
  lastUpdated: Date
}

export async function getReportStats() {
  try {
    const stats = await unstable_cache(
      async () => {
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const [permitCount, taskCount, peopleCount, expiringCount] = await Promise.all([
          db.select({ count: count() }).from(permits),
          db.select({ count: count() }).from(tasksV2),
          db.select({ count: count() }).from(people),
          db
            .select({ count: count() })
            .from(permits)
            .where(
              and(
                sql`${permits.dueDate} IS NOT NULL`,
                sql`${permits.dueDate} <= ${thirtyDaysFromNow.toISOString()}`
              )
            ),
        ])

        return {
          totalPermits: permitCount[0]?.count || 0,
          totalTasks: taskCount[0]?.count || 0,
          totalPeople: peopleCount[0]?.count || 0,
          expiringSoon: expiringCount[0]?.count || 0,
          lastUpdated: new Date(),
        }
      },
      ["report-stats"],
      { revalidate: 60 }
    )()

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error("Error fetching report stats:", error)
    return {
      success: false,
      error: "Failed to fetch report statistics",
    }
  }
}
