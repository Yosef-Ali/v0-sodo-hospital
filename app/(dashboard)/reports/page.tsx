import { ReportsPage } from "@/components/pages/reports-page"
import { getReports, getReportStats } from "@/lib/actions/v2/reports"
import { unstable_cache } from "next/cache"

// Cache reports data for 60 seconds
const getCachedReportsData = unstable_cache(
  async () => {
    const [reportsResult, statsResult] = await Promise.all([
      getReports({ limit: 100 }),
      getReportStats()
    ])

    return {
      reports: reportsResult.success ? reportsResult.data : [],
      stats: statsResult.success ? statsResult.data : {
        total: 0,
        draft: 0,
        generated: 0,
        published: 0,
        archived: 0,
        lastUpdated: new Date()
      }
    }
  },
  ['reports-data'],
  {
    revalidate: 60,
    tags: ['reports']
  }
)

export default async function ReportsRoute() {
  const reportsData = await getCachedReportsData()
  return <ReportsPage initialData={reportsData} />
}
