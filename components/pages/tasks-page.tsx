"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { TaskCard } from "@/components/ui/task-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, Calendar, SortAsc } from "lucide-react"
import { TaskSheet } from "@/components/sheets/task-sheet"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Task type definition
export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "urgent"
  dueDate: string
  assignee: string
  category: string
  priority: "low" | "medium" | "high"
  createdAt: string
}

interface TasksPageProps {
  initialData: {
    tasks: any[]
  }
}

export function TasksPage({ initialData }: TasksPageProps) {
  // Map database tasks to Task interface
  const mappedTasks = useMemo(() => {
    return initialData.tasks.map((item) => ({
      id: item.task.id,
      title: item.task.title,
      description: item.task.description || "",
      status: item.task.status,
      dueDate: item.task.dueDate ? new Date(item.task.dueDate).toISOString().split("T")[0] : "",
      assignee: item.assignee?.name || "Unassigned",
      category: item.permit?.category ? item.permit.category.replace(/_/g, " ") : "General",
      priority: item.task.priority,
      createdAt: new Date(item.task.createdAt).toISOString().split("T")[0],
    }))
  }, [initialData.tasks])

  const [tasks, setTasks] = useState<Task[]>(mappedTasks)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Filter tasks based on active tab and search query
  const filteredTasks = tasks.filter((task) => {
    // Filter by tab
    if (activeTab !== "all" && task.status !== activeTab) {
      return false
    }

    // Filter by search query
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    return true
  })

  // Count tasks by status
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    "in-progress": tasks.filter((task) => task.status === "in-progress").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    urgent: tasks.filter((task) => task.status === "urgent").length,
  }

  // Handle adding a new task
  const handleAddTask = (newTask: Omit<Task, "id" | "createdAt">) => {
    const id = `task-${tasks.length + 1}`
    const createdAt = new Date().toISOString().split("T")[0]

    setTasks([...tasks, { id, createdAt, ...newTask }])
    setIsSheetOpen(false)

    toast({
      title: "Task Created",
      description: `"${newTask.title}" has been created successfully.`,
    })
  }

  return (
    <div className="p-8">
      <PageHeader title="Tasks" description="Manage and track all your hospital administrative tasks in one place." />

      <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-gray-800 border border-gray-700 w-full md:w-auto grid grid-cols-5">
            <TabsTrigger value="all" className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              All <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">{taskCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Pending <Badge className="ml-1 bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">{taskCounts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              In Progress <Badge className="ml-1 bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">{taskCounts["in-progress"]}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Completed <Badge className="ml-1 bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">{taskCounts.completed}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="urgent"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Urgent <Badge className="ml-1 bg-red-500/20 text-red-300 text-xs border border-red-500/30">{taskCounts.urgent}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-gray-300"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-sm font-normal border-gray-700 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700 text-gray-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800/90 backdrop-blur-md border-gray-700 text-gray-300">
              <DropdownMenuItem className="hover:bg-gray-700/50">
                <Calendar className="h-4 w-4 mr-2" />
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700/50">
                <SortAsc className="h-4 w-4 mr-2" />
                Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            className="text-sm font-normal bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            onClick={() => setIsSheetOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery
              ? "No tasks match your search criteria. Try adjusting your search."
              : "There are no tasks in this category. Create a new task to get started."}
          </p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
              dueDate={task.dueDate}
              assignee={task.assignee}
              category={task.category}
              priority={task.priority}
            />
          ))}
        </div>
      )}

      <TaskSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} onSubmit={handleAddTask} />
      <Toaster />
    </div>
  )
}
