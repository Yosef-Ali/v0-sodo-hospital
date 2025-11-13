"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { TaskCard } from "@/components/ui/task-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, Calendar, SortAsc, Loader2 } from "lucide-react"
import { TaskSheet } from "@/components/sheets/task-sheet"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getTasks, getTaskStats, createTask } from "@/lib/actions/v2/tasks"

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

export function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [taskCounts, setTaskCounts] = useState({
    all: 0,
    pending: 0,
    "in-progress": 0,
    completed: 0,
    urgent: 0,
  })
  const { toast } = useToast()

  // Load tasks and stats on mount and when tab changes
  useEffect(() => {
    loadTasks()
    loadStats()
  }, [activeTab])

  const loadTasks = async () => {
    setLoading(true)

    const filters: any = { limit: 100 }
    if (activeTab !== "all") {
      filters.status = activeTab
    }

    const result = await getTasks(filters)
    if (result.success) {
      setTasks(result.data)
    }

    setLoading(false)
  }

  const loadStats = async () => {
    const result = await getTaskStats()
    if (result.success) {
      setTaskCounts({
        all: result.data.total,
        pending: result.data.byStatus.pending,
        "in-progress": result.data.byStatus["in-progress"],
        completed: result.data.byStatus.completed,
        urgent: result.data.byStatus.urgent,
      })
    }
  }

  // Filter tasks based on search query (tabs filtered by server)
  const filteredTasks = tasks.filter((item) => {
    const task = item.task
    const person = item.person
    const assignee = item.assignee

    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()

    return (
      task.title?.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      assignee?.name?.toLowerCase().includes(searchLower) ||
      person?.firstName?.toLowerCase().includes(searchLower) ||
      person?.lastName?.toLowerCase().includes(searchLower)
    )
  })

  // Handle adding a new task
  const handleAddTask = async (newTaskData: Omit<Task, "id" | "createdAt">) => {
    try {
      const result = await createTask({
        title: newTaskData.title,
        description: newTaskData.description,
        status: newTaskData.status,
        priority: newTaskData.priority,
        dueDate: new Date(newTaskData.dueDate),
        // Note: assigneeId would need to be mapped from the person value
        // For now, we'll leave it null - you can enhance this later
        assigneeId: undefined,
      })

      if (result.success) {
        toast({
          title: "Task Created",
          description: `"${newTaskData.title}" has been created successfully.`,
        })
        setIsSheetOpen(false)
        loadTasks()
        loadStats()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create task",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-8">
      <PageHeader title="Tasks" description="Manage and track all your hospital administrative tasks in one place." />

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-gray-800 border border-gray-700 w-full md:w-auto grid grid-cols-5">
            <TabsTrigger value="all" className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              All <Badge className="ml-1 bg-gray-600 text-xs">{taskCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Pending <Badge className="ml-1 bg-gray-600 text-xs">{taskCounts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              In Progress <Badge className="ml-1 bg-gray-600 text-xs">{taskCounts["in-progress"]}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Completed <Badge className="ml-1 bg-gray-600 text-xs">{taskCounts.completed}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="urgent"
              className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Urgent <Badge className="ml-1 bg-red-600 text-xs">{taskCounts.urgent}</Badge>
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredTasks.length === 0 ? (
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
          {filteredTasks.map((item) => {
            const task = item.task
            const assignee = item.assignee
            const person = item.person

            return (
              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description || ""}
                status={task.status}
                dueDate={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                assignee={assignee?.name || "Unassigned"}
                category={person ? `${person.firstName} ${person.lastName}` : "General"}
                priority={task.priority}
              />
            )
          })}
        </div>
      )}

      <TaskSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} onSubmit={handleAddTask} />
      <Toaster />
    </div>
  )
}
