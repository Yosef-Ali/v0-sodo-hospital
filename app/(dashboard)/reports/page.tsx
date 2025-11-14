import { ReportsPage } from "@/components/pages/reports-page"
import { getReportStats } from "@/lib/actions/v2/reports"

export default async function ReportsRoute() {
  const statsResult = await getReportStats()
  const stats = statsResult.success ? statsResult.data : null

  return <ReportsPage stats={stats} />
}
