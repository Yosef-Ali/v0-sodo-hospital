"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { KanbanColumn } from "@/components/kanban/kanban-column"
import { KanbanItem } from "@/components/kanban/kanban-item"
import { TaskSheet } from "@/components/kanban/task-sheet"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Define task type
export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  assignee: string
  category: string
}

// Initial tasks data
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "License Renewal Processing",
    description: "Review and process hospital license renewal applications from various departments.",
    status: "pending",
    priority: "high",
    dueDate: "2023-05-15",
    assignee: "Dr. Samuel",
    category: "Administrative",
  },
  {
    id: "task-2",
    title: "Patient Record Verification",
    description: "Verify and update patient records in the system to ensure accuracy and completeness.",
    status: "in-progress",
    priority: "medium",
    dueDate: "2023-05-20",
    assignee: "Nurse Johnson",
    category: "Records",
  },
  {
    id: "task-3",
    title: "Medical Supply Inventory",
    description: "Conduct inventory check of medical supplies and update the procurement list.",
    status: "pending",
    priority: "low",
    dueDate: "2023-05-25",
    assignee: "Store Manager",
    category: "Inventory",
  },
  {
    id: "task-4",
    title: "Staff Training Documentation",
    description: "Update training records for all staff who completed the recent infection control workshop.",
    status: "completed",
    priority: "medium",
    dueDate: "2023-05-10",
    assignee: "HR Director",
    category: "Training",
  },
  {
    id: "task-5",
    title: "Equipment Maintenance Schedule",
    description: "Create maintenance schedule for all critical medical equipment for the next quarter.",
    status: "in-progress",
    priority: "high",
    dueDate: "2023-05-18",
    assignee: "Maintenance Head",
    category: "Maintenance",
  },
]

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { toast } = useToast()

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Get active task for drag overlay
  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null

  // Handle drag start
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    // If the item was dropped over a different container, update its status
    if (active.id !== over.id) {
      const activeTask = tasks.find((task) => task.id === active.id)

      if (activeTask) {
        // If dropped over a column
        if (over.id.startsWith("column-")) {
          const newStatus = over.id.replace("column-", "") as "pending" | "in-progress" | "completed"

          setTasks(tasks.map((task) => (task.id === active.id ? { ...task, status: newStatus } : task)))

          toast({
            title: "Task Updated",
            description: `"${activeTask.title}" moved to ${newStatus.replace("-", " ")}`,
            variant: "default",
          })
        }
      }
    }

    setActiveId(null)
  }

  // Add a new task
  const handleAddTask = (newTask: Omit<Task, "id">) => {
    const id = `task-${tasks.length + 1}`
    setTasks([...tasks, { id, ...newTask }])
    setIsSheetOpen(false)

    toast({
      title: "Task Created",
      description: `"${newTask.title}" has been created`,
      variant: "default",
    })
  }

  // Get tasks by status
  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status).map((task) => task.id)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Task Board</h2>
        <Button onClick={() => setIsSheetOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <KanbanColumn id="column-pending" title="Pending" tasks={getTasksByStatus("pending")} allTasks={tasks} />
          <KanbanColumn
            id="column-in-progress"
            title="In Progress"
            tasks={getTasksByStatus("in-progress")}
            allTasks={tasks}
          />
          <KanbanColumn
            id="column-completed"
            title="Completed"
            tasks={getTasksByStatus("completed")}
            allTasks={tasks}
          />
        </div>

        <DragOverlay>
          {activeId && activeTask ? (
            <div className="w-full opacity-80">
              <KanbanItem task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} onSubmit={handleAddTask} />
    </div>
  )
}
