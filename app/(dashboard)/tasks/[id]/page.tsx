import { TaskDetailPage } from "@/components/pages/task-detail-page"
import { getTaskById } from "@/lib/actions/v2/tasks"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"

interface TaskPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id } = await params

  const getCachedTask = unstable_cache(
    async (taskId: string) => {
      const result = await getTaskById(taskId)
      return result.success ? result.data : null
    },
    [`task-${id}`],
    {
      revalidate: 60,
      tags: [`task-${id}`]
    }
  )

  const task = await getCachedTask(id)

  if (!task) {
    notFound()
  }

  return <TaskDetailPage initialData={task} />
}
