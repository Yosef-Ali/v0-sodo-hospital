"use server"

import { db, activityLogs, users } from "@/lib/db"
import { desc, eq } from "drizzle-orm"

export interface DashboardActivityEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: Date
  details: Record<string, unknown>
  actor: {
    id: string | null
    name: string | null
    email: string | null
  }
}

export async function getRecentActivityLogs(limit = 8): Promise<
  | { success: true; data: DashboardActivityEntry[] }
  | { success: false; error: string }
> {
  try {
    const results = await db
      .select({
        log: activityLogs,
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

    const data = results.map((row) => ({
      id: row.log.id,
      action: row.log.action,
      entityType: row.log.entityType,
      entityId: row.log.entityId,
      createdAt: row.log.createdAt,
      details: row.log.details ?? {},
      actor: {
        id: row.user?.id ?? null,
        name: row.user?.name ?? null,
        email: row.user?.email ?? null,
      },
    }))

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching recent dashboard activity:", error)
    return { success: false, error: "Failed to fetch recent activity" }
  }
}
