"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Edit2,
  Trash2,
  User,
  Calendar,
  FileText,
  Shield,
} from "lucide-react"
import { completeTask, deleteTask } from "@/lib/actions/v2/tasks"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TaskDetailPageProps {
  initialData: any
}

export function TaskDetailPage({ initialData }: TaskDetailPageProps) {
  const router = useRouter()

  const [task, setTask] = useState(initialData)
  const [actionLoading, setActionLoading] = useState(false)

  const handleCompleteTask = async () => {
    setActionLoading(true)

    const result = await completeTask(task.task.id, "Task marked as completed")

    if (result.success) {
      // Update local state
      setTask({
        ...task,
        task: {
          ...task.task,
          status: "completed"
        }
      })
      router.refresh()
    }

    setActionLoading(false)
  }

  const handleDeleteTask = async () => {
    setActionLoading(true)

    const result = await deleteTask(task.task.id)

    if (result.success) {
      router.push("/tasks")
    }

    setActionLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />
      case "in-progress":
        return <AlertCircle className="h-5 w-5" />
      case "completed":
        return <CheckCircle className="h-5 w-5" />
      case "urgent":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      case "in-progress":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      case "urgent":
        return "bg-red-500/10 text-red-400 border border-red-500/20"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20"
      case "medium":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20"
      case "high":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const taskData = task.task
  const assignee = task.assignee
  const permit = task.permit
  const person = task.person

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/tasks")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <PageHeader
            title={taskData.title}
            description={`Task #${taskData.id.slice(0, 8)}`}
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(taskData.status)} text-sm flex items-center gap-2 px-3 py-1`}>
            {getStatusIcon(taskData.status)}
            {taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1).replace("-", " ")}
          </Badge>
          <Badge className={`${getPriorityColor(taskData.priority)} text-sm px-3 py-1`}>
            {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)} Priority
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Information */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-500" />
              Task Details
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Description</p>
                <p className="text-white">{taskData.description || "No description provided"}</p>
              </div>

              <Separator className="bg-gray-700" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <Badge className={`${getStatusColor(taskData.status)} text-xs mt-1`}>
                    {taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1).replace("-", " ")}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Priority</p>
                  <Badge className={`${getPriorityColor(taskData.priority)} text-xs mt-1`}>
                    {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Due Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-white text-sm">{formatDate(taskData.dueDate)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="text-white text-sm mt-1">{formatDate(taskData.createdAt)}</p>
                </div>

                {taskData.completedAt && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Completed</p>
                    <p className="text-white text-sm mt-1">{formatDate(taskData.completedAt)}</p>
                  </div>
                )}
              </div>

              {taskData.notes && (
                <>
                  <Separator className="bg-gray-700" />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Notes</p>
                    <p className="text-gray-300 text-sm">{taskData.notes}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Assignee Information */}
          {assignee && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-500" />
                Assigned To
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-white font-medium">{assignee.name}</p>
                </div>

                {assignee.email && (
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{assignee.email}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Related Permit */}
          {permit && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Related Permit
              </h3>

              <Link
                href={`/permits/${permit.id}`}
                className="block p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-green-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{permit.category.replace(/_/g, " ")}</p>
                  <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
                    {permit.status}
                  </Badge>
                </div>
                {person && (
                  <p className="text-sm text-gray-400">
                    For {person.firstName} {person.lastName}
                  </p>
                )}
              </Link>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

            <div className="space-y-2">
              {taskData.status !== "completed" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={actionLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-800 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Complete Task?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        This will mark the task as completed. You can always view it in the completed tasks section.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-700 text-white">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCompleteTask}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Complete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button
                variant="outline"
                className="w-full border-gray-700"
                onClick={() => router.push(`/tasks/${taskId}/edit`)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Task
              </Button>

              <Separator className="bg-gray-700" />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-700 text-red-400 hover:bg-red-900/20"
                    disabled={actionLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Task?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      This action cannot be undone. This will permanently delete the task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteTask}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>

          {/* Quick Info */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Created</span>
                <span className="text-sm text-white">{new Date(taskData.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Last Updated</span>
                <span className="text-sm text-white">{new Date(taskData.updatedAt).toLocaleDateString()}</span>
              </div>

              {taskData.dueDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Days Remaining</span>
                  <span className={`text-sm font-medium ${
                    new Date(taskData.dueDate) < new Date()
                      ? "text-red-400"
                      : "text-green-400"
                  }`}>
                    {Math.ceil((new Date(taskData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
