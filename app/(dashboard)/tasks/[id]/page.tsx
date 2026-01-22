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
  
  // Fetch directly without cache to debug 404s and ensure fresh data
  const result = await getTaskById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <TaskDetailPage initialData={result.data} />
}
