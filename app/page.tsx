import { LandingPage } from "@/components/pages/landing-page"
import { getPeople } from "@/lib/actions/v2/foreigners"
import { getTasks, getTaskStats, getUpcomingTasks } from "@/lib/actions/v2/tasks"
import { checkDbConnection } from "@/lib/db/check-connection"

export default async function Home() {
  const dbStatus = await checkDbConnection()
  
  const [peopleRes, urgentTasksRes, upcomingTasksRes, statsRes] = await Promise.all([
    getPeople({ limit: 10 }),
    getTasks({ status: "urgent", limit: 10, includeCompleted: false }),
    getUpcomingTasks(30), // Tasks due within 30 days
    getTaskStats()
  ])

  const people = peopleRes.success ? peopleRes.data : []
  const urgentTasks = urgentTasksRes.success ? urgentTasksRes.data : []
  const upcomingTasks = upcomingTasksRes.success ? upcomingTasksRes.data : []
  const stats = statsRes.success ? statsRes.data : null
  
  // Combine urgent and upcoming for a unified notification list
  const notifications = [
    ...(urgentTasks ?? []).map((t: any) => ({ ...t, notificationType: "urgent" as const })),
    ...(upcomingTasks ?? []).map((t: any) => ({ ...t, notificationType: "upcoming" as const }))
  ].slice(0, 6) // Limit to 6 notifications for display
  
  return (
    <LandingPage 
      initialPeople={people} 
      notifications={notifications}
      taskStats={stats}
      dbError={dbStatus.reachable ? undefined : dbStatus.error}
    />
  )
}
