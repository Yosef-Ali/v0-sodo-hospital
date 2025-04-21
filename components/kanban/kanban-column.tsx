"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableKanbanItem } from "@/components/kanban/sortable-kanban-item"
import type { Task } from "@/components/kanban/kanban-board"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  id: string
  title: string
  tasks: string[]
  allTasks: Task[]
}

export function KanbanColumn({ id, title, tasks, allTasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  // Get the full task objects for the IDs in this column
  const columnTasks = tasks.map((taskId) => allTasks.find((task) => task.id === taskId)).filter(Boolean) as Task[]

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden transition-colors",
        isOver && "border-blue-500 bg-gray-750",
      )}
    >
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium text-white flex items-center">
          {title}
          <span className="ml-2 text-sm bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
        </h3>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {columnTasks.map((task) => (
              <SortableKanbanItem key={task.id} task={task} />
            ))}

            {columnTasks.length === 0 && (
              <div className="h-24 border border-dashed border-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                Drop tasks here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
