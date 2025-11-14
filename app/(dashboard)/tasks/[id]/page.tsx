import { TaskDetailPage } from "@/components/pages/task-detail-page"

interface TaskPageProps {
  params: {
    id: string
  }
}

export default function TaskPage({ params }: TaskPageProps) {
  return <TaskDetailPage taskId={params.id} />
}
