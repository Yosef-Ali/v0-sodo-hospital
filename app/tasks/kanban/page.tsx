import { KanbanBoard } from "@/components/kanban/kanban-board"
import { PageHeader } from "@/components/ui/page-header"
import { Toaster } from "@/components/ui/toaster"

export default function KanbanPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <PageHeader title="Kanban Board" description="Manage tasks with an interactive drag-and-drop Kanban board" />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
      <Toaster />
    </div>
  )
}
