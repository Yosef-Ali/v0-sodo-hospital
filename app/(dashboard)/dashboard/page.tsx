import { DashboardPage } from "@/components/pages/dashboard-page"
import { getTaskStats, getOverdueTasks, getTasks } from "@/lib/actions/v2/tasks"
import { getPermitStats } from "@/lib/actions/v2/permits"
import { getExpiringItems, syncAllExpirationsToCalendar } from "@/lib/actions/v2/calendar-events"
import { unstable_cache } from "next/cache"
import { getCurrentUser } from "@/lib/auth/permissions"

// Cache dashboard data for 60 seconds
const getCachedDashboardData = unstable_cache(
  async () => {
    const [taskStatsResult, overdueResult, permitStatsResult, expiringResult] = await Promise.all([
      getTaskStats(),
      getOverdueTasks(),
      getPermitStats(),
      getExpiringItems(30), // Get items expiring in next 30 days
    ])

    // Sync expirations to calendar (runs in background)
    syncAllExpirationsToCalendar().catch(console.error)

    return {
      taskStats: taskStatsResult.success ? taskStatsResult.data : { byStatus: {}, total: 0 },
      permitStats: permitStatsResult.success ? permitStatsResult.data : { byStatus: {}, byCategory: {}, total: 0 },
      permits: [],
      overdueCount: overdueResult.success && overdueResult.data ? overdueResult.data.length : 0,
      expiringItems: expiringResult.success ? expiringResult.data : [],
    }
  },
  ['dashboard-data'],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['dashboard']
  }
)

export default async function Dashboard() {
  const [dashboardData, currentUser] = await Promise.all([
    getCachedDashboardData(),
    getCurrentUser(),
  ])

  let myTasks: any[] = []
  if (currentUser) {
    const myTasksResult = await getTasks({
      assigneeId: currentUser.id,
      includeCompleted: false,
      limit: 5,
    })

    if (myTasksResult.success && myTasksResult.data) {
      myTasks = myTasksResult.data
    }
  }

  return (
    <DashboardPage
      initialData={{
        ...dashboardData,
        myTasks,
        expiringItems: dashboardData.expiringItems || [],
        currentUser: currentUser
          ? {
              id: currentUser.id,
              name: currentUser.name,
            }
          : null,
      }}
    />
  )
}
