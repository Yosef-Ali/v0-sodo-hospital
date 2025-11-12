"use client"

import { useState } from "react"
import { TaskCalendar } from "@/components/calendar/task-calendar"
import { PageHeader } from "@/components/ui/page-header"
import { Toaster } from "@/components/ui/toaster"
import { TaskSheet } from "@/components/sheets/task-sheet"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Task } from "@/components/pages/tasks-page"

// Sample tasks data - in production, this would come from a state management solution or API
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "License Renewal Processing",
    description: "Review and process hospital license renewal applications from various departments.",
    status: "urgent",
    dueDate: "2023-05-15",
    assignee: "Dr. Samuel",
    category: "Administrative",
    priority: "high",
    createdAt: "2023-05-01",
  },
  {
    id: "task-2",
    title: "Patient Record Verification",
    description: "Verify and update patient records in the system to ensure accuracy and completeness.",
    status: "in-progress",
    dueDate: "2023-05-20",
    assignee: "Nurse Johnson",
    category: "Records",
    priority: "medium",
    createdAt: "2023-05-02",
  },
  {
    id: "task-3",
    title: "Medical Supply Inventory",
    description: "Conduct inventory check of medical supplies and update the procurement list.",
    status: "pending",
    dueDate: "2023-05-25",
    assignee: "Store Manager",
    category: "Inventory",
    priority: "low",
    createdAt: "2023-05-03",
  },
  {
    id: "task-4",
    title: "Staff Training Documentation",
    description: "Update training records for all staff who completed the recent infection control workshop.",
    status: "completed",
    dueDate: "2023-05-10",
    assignee: "HR Director",
    category: "Training",
    priority: "medium",
    createdAt: "2023-05-04",
  },
  {
    id: "task-5",
    title: "Equipment Maintenance Schedule",
    description: "Create maintenance schedule for all critical medical equipment for the next quarter.",
    status: "pending",
    dueDate: "2023-05-18",
    assignee: "Maintenance Head",
    category: "Maintenance",
    priority: "high",
    createdAt: "2023-05-05",
  },
  {
    id: "task-6",
    title: "Insurance Claim Processing",
    description: "Process pending insurance claims for patients treated in the last month.",
    status: "in-progress",
    dueDate: "2023-05-22",
    assignee: "Finance Officer",
    category: "Finance",
    priority: "medium",
    createdAt: "2023-05-06",
  },
  {
    id: "task-7",
    title: "Department Budget Review",
    description: "Review and approve departmental budget proposals for the next fiscal year.",
    status: "pending",
    dueDate: "2023-06-15",
    assignee: "Finance Director",
    category: "Finance",
    priority: "high",
    createdAt: "2023-05-07",
  },
  {
    id: "task-8",
    title: "Medication Error Report",
    description: "Compile and analyze medication error reports from all departments for the quality committee.",
    status: "urgent",
    dueDate: "2023-05-16",
    assignee: "Quality Officer",
    category: "Quality",
    priority: "high",
    createdAt: "2023-05-08",
  },
  {
    id: "task-9",
    title: "New Staff Orientation",
    description: "Prepare orientation materials for new staff joining next week.",
    status: "in-progress",
    dueDate: "2023-05-19",
    assignee: "HR Assistant",
    category: "HR",
    priority: "medium",
    createdAt: "2023-05-09",
  },
]

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { toast } = useToast()

  // Handle adding a new task
  const handleAddTask = (newTask: Omit<Task, "id" | "createdAt">) => {
    const id = `task-${tasks.length + 1}`
    const createdAt = new Date().toISOString().split("T")[0]

    setTasks([...tasks, { id, createdAt, ...newTask }])
    setIsSheetOpen(false)

    toast({
      title: "Task Created",
      description: `"${newTask.title}" has been scheduled successfully.`,
    })
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title="Task Calendar"
          description="View and manage your tasks in a calendar format to better plan your schedule."
        />
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
        >
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <TaskCalendar tasks={tasks} />
      </div>

      <TaskSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} onSubmit={handleAddTask} />
      <Toaster />
    </div>
  )
}
