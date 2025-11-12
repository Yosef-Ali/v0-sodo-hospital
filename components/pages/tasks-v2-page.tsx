"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ListTodo,
  Plus,
  User,
  Shield,
  Calendar,
  ArrowUpCircle,
} from "lucide-react"
import { getTasks, getTaskStats, completeTask } from "@/lib/actions/v2/tasks"
import { formatEC, gregorianToEC } from "@/lib/dates/ethiopian"
import { useRouter } from "next/navigation"

type TaskStatus = "pending" | "in-progress" | "completed" | "urgent"
type TaskPriority = "low" | "medium" | "high"

export function TasksV2Page() {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const [tasks, setTasks] = useState<any[]>([])
  const [stats, setStats] = useState<any>({ total: 0, byStatus: {}, byPriority: {} })
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL")
  const [includeCompleted, setIncludeCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
    loadStats()
  }, [statusFilter, priorityFilter, includeCompleted])

  const loadTasks = async () => {
    setLoading(true)
    setError(null)

    const filters: any = { includeCompleted }
    if (statusFilter !== "ALL") filters.status = statusFilter
    if (priorityFilter !== "ALL") filters.priority = priorityFilter

    const result = await getTasks(filters)
    if (result.success) {
      setTasks(result.data)
    } else {
      setError(result.error || "Failed to load tasks")
    }

    setLoading(false)
  }

  const loadStats = async () => {
    const result = await getTaskStats()
    if (result.success) {
      setStats(result.data)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    const result = await completeTask(taskId)
    if (result.success) {
      await loadTasks()
      await loadStats()
    } else {
      setError(result.error || "Failed to complete task")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in-progress":
        return <ArrowUpCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      case "urgent":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <ListTodo className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-700 text-gray-300"
      case "in-progress":
        return "bg-blue-900 text-blue-300"
      case "completed":
        return "bg-green-900 text-green-300"
      case "urgent":
        return "bg-red-900 text-red-300"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-700 text-gray-400"
      case "medium":
        return "bg-yellow-900 text-yellow-300"
      case "high":
        return "bg-red-900 text-red-300"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null

    try {
      const date = new Date(dueDate)
      const ec = formatEC(gregorianToEC(date), i18n.language as "en" | "am", "short")
      const gregorian = date.toLocaleDateString()

      const now = new Date()
      const isOverdue = date < now

      return { ec, gregorian, isOverdue }
    } catch {
      return null
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      WORK_PERMIT: "Work Permit",
      RESIDENCE_ID: "Residence ID",
      LICENSE: "License",
      PIP: "PIP",
    }
    return labels[category] || category
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title={t("task.tasks") || "Tasks"}
          description="Manage permit-related tasks and reminders"
        />

        <Button
          onClick={() => router.push("/tasks/new")}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("task.createTask") || "Create Task"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{t("common.total")}</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <ListTodo className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div>
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">
              {stats.byStatus.pending || 0}
            </p>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div>
            <p className="text-sm text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {stats.byStatus["in-progress"] || 0}
            </p>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div>
            <p className="text-sm text-gray-400">Urgent</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {stats.byStatus.urgent || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as any)}
        >
          <SelectTrigger className="w-[180px] bg-gray-800/60 backdrop-blur-sm border-gray-700 text-gray-300">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="ALL" className="text-gray-300">All Statuses</SelectItem>
            <SelectItem value="pending" className="text-gray-300">Pending</SelectItem>
            <SelectItem value="in-progress" className="text-gray-300">In Progress</SelectItem>
            <SelectItem value="urgent" className="text-gray-300">Urgent</SelectItem>
            <SelectItem value="completed" className="text-gray-300">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value as any)}
        >
          <SelectTrigger className="w-[180px] bg-gray-800/60 backdrop-blur-sm border-gray-700 text-gray-300">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="ALL" className="text-gray-300">All Priorities</SelectItem>
            <SelectItem value="low" className="text-gray-300">Low</SelectItem>
            <SelectItem value="medium" className="text-gray-300">Medium</SelectItem>
            <SelectItem value="high" className="text-gray-300">High</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={includeCompleted ? "default" : "outline"}
          onClick={() => setIncludeCompleted(!includeCompleted)}
          className={includeCompleted ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {includeCompleted ? "Hide Completed" : "Show Completed"}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-400 mt-4">{t("common.loading")}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={() => loadTasks()}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tasks.length === 0 && (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 p-12 text-center">
          <ListTodo className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
          <p className="text-gray-400 mb-6">
            {statusFilter !== "ALL" || priorityFilter !== "ALL"
              ? "No tasks match your filters."
              : "Get started by creating your first task."}
          </p>
          <Button
            onClick={() => router.push("/tasks/new")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("task.createTask") || "Create Task"}
          </Button>
        </div>
      )}

      {/* Tasks List */}
      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((item) => {
            const task = item.task
            const assignee = item.assignee
            const permit = item.permit
            const person = item.person
            const dueDate = formatDueDate(task.dueDate)

            return (
              <Card
                key={task.id}
                className="bg-gray-800 border-gray-700 p-5 hover:border-green-500/50 transition-all cursor-pointer"
                onClick={() => router.push(`/tasks/${task.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-white font-medium">{task.title}</h3>
                      <Badge className={`${getStatusColor(task.status)} text-xs flex items-center gap-1`}>
                        {getStatusIcon(task.status)}
                        {t(`task.statuses.${task.status}`) || task.status}
                      </Badge>
                      <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                        {t(`task.priorities.${task.priority}`) || task.priority}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      {dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className={dueDate.isOverdue ? "text-red-400" : ""}>
                            {dueDate.ec}
                          </span>
                        </div>
                      )}

                      {assignee && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{assignee.name || assignee.email}</span>
                        </div>
                      )}

                      {permit && (
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          <span>
                            {getCategoryLabel(permit.category)}
                            {person && ` - ${person.firstName} ${person.lastName}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {task.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-700 text-green-400 hover:bg-green-900/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCompleteTask(task.id)
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
