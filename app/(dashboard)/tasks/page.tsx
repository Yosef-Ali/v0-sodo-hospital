import { TasksPage } from "@/components/pages/tasks-page"
import { getTasks } from "@/lib/actions/v2/tasks"
import { unstable_cache } from "next/cache"

// Cache tasks data for 60 seconds
const getCachedTasksData = unstable_cache(
  async () => {
    const tasksResult = await getTasks({ limit: 100 })
    return {
      tasks: tasksResult.success ? tasksResult.data : []
    }
  },
  ['tasks-data'],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['tasks']
  }
)

export default async function TasksRoute() {
  const tasksData = await getCachedTasksData()
  return <TasksPage initialData={tasksData} />
}
