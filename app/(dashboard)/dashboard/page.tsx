import { DashboardPage } from "@/components/pages/dashboard-page"
import { getTaskStats } from "@/lib/actions/v2/tasks"
import { getPermitStats, getPermits } from "@/lib/actions/v2/permits"
import { unstable_cache } from "next/cache"

// Cache dashboard data for 60 seconds
const getCachedDashboardData = unstable_cache(
  async () => {
    const [taskStatsResult, permitStatsResult, permitsResult] = await Promise.all([
      getTaskStats(),
      getPermitStats(),
      getPermits({ limit: 5 })
    ])

    return {
      taskStats: taskStatsResult.success ? taskStatsResult.data : { byStatus: {}, total: 0 },
      permitStats: permitStatsResult.success ? permitStatsResult.data : { byStatus: {}, byCategory: {}, total: 0 },
      permits: permitsResult.success ? permitsResult.data : []
    }
  },
  ['dashboard-data'],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['dashboard']
  }
)

export default async function Dashboard() {
  const dashboardData = await getCachedDashboardData()

  return <DashboardPage initialData={dashboardData} />
}
