import { TasksPage } from "@/components/pages/tasks-page"
import { getTasks } from "@/lib/actions/v2/tasks"
import { unstable_cache } from "next/cache"

export default async function TasksRoute() {
  const tasksResult = await getTasks({ limit: 100 })
  const tasksData = {
    tasks: tasksResult.success ? tasksResult.data : []
  }
  return <TasksPage initialData={tasksData} />
}
