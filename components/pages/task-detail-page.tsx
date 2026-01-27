"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Shield,
  HelpCircle,
  Link as LinkIcon
} from "lucide-react"
import { updateTask } from "@/lib/actions/v2/tasks"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TaskSheet } from "@/components/sheets/task-sheet"
import { toast } from "sonner"
import { TaskActionsCard } from "@/components/tasks/task-actions-card"

interface TaskDetailPageProps {
  initialData: any
}

export function TaskDetailPage({ initialData }: TaskDetailPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [task, setTask] = useState(initialData)
  const [editSheetOpen, setEditSheetOpen] = useState(false)

  // Sync state with initialData if it changes (e.g. after router.refresh)
  useEffect(() => {
    setTask(initialData)
  }, [initialData])

  const handleEditSubmit = async (data: any) => {
    try {
      const result = await updateTask(task.task.id, {
        ...data,
        assigneeId: data.assignee // Map form field 'assignee' to 'assigneeId'
      })
      
      if (result.success) {
        toast.success("Task updated successfully")
        setEditSheetOpen(false)
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error("Failed to update task", { description: result.error })
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "in-progress": return <AlertCircle className="h-4 w-4" />
      case "completed": return <CheckCircle className="h-4 w-4" />
      case "urgent": return <AlertCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "in-progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "completed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "urgent": return "bg-red-500/10 text-red-400 border-red-500/20"
      default: return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-slate-500/10 text-slate-400 border-slate-500/20"
      case "medium": return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "high": return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default: return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    })
  }

  const taskData = task.task
  const assignee = task.assignee
  const permit = task.permit
  const person = task.person

  // Prepare task object for sheet
  const sheetTask = {
    ...taskData,
    permit: permit,
    linkedEntity: task.linkedEntity,
    // Ensure we pass necessary fields for pre-filling
    assigneeId: taskData.assigneeId,
    entityType: taskData.entityType,
    entityId: taskData.entityId
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/tasks")}
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-600/20 flex items-center justify-center text-green-500 border-2 border-green-500/30 flex-shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className="flex items-center gap-2">
                   {taskData.title}
                </span>
                <span className="flex items-center gap-2 mt-1 text-sm font-mono text-gray-500">
                    ID: {taskData.id.slice(0, 8)}
                </span>
              </div>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(taskData.status)} text-sm flex items-center gap-2 px-3 py-1 border`}>
            {getStatusIcon(taskData.status)}
            {taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1).replace("-", " ")}
          </Badge>
          <Badge className={`${getPriorityColor(taskData.priority)} text-sm px-3 py-1 border`}>
            {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)} Priority
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Information */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Task Details
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Description</p>
                <p className="text-white bg-gray-900/30 p-3 rounded-md border border-gray-700/50">
                    {taskData.description || "No description provided"}
                </p>
              </div>

              <Separator className="bg-gray-700/50" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <div className="mt-1">
                      <Badge className={`${getStatusColor(taskData.status)} text-xs`}>
                        {taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1).replace("-", " ")}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Priority</p>
                  <div className="mt-1">
                     <Badge className={`${getPriorityColor(taskData.priority)} text-xs`}>
                        {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}
                    </Badge>
                  </div>
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
                  <Separator className="bg-gray-700/50" />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Notes</p>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{taskData.notes}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Related Entity */}
          {task.linkedEntity && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-green-500" />
                Related {task.linkedEntity.type.charAt(0).toUpperCase() + task.linkedEntity.type.slice(1)}
              </h3>

              <Link
                href={`/${task.linkedEntity.type === 'person' ? 'foreigners' : task.linkedEntity.type === 'import' ? 'import' : task.linkedEntity.type === 'company' ? 'company' : task.linkedEntity.type === 'vehicle' ? 'vehicle' : task.linkedEntity.type}/${task.linkedEntity.data.id}`}
                className="block p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-green-500/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium group-hover:text-green-400 transition-colors">
                    {task.linkedEntity.type === 'vehicle' && (task.linkedEntity.data.plateNumber || task.linkedEntity.data.title)}
                    {task.linkedEntity.type === 'import' && task.linkedEntity.data.title}
                    {task.linkedEntity.type === 'company' && (task.linkedEntity.data.companyName || task.linkedEntity.data.title)}
                    {task.linkedEntity.type === 'person' && `${task.linkedEntity.data.firstName} ${task.linkedEntity.data.lastName}`}
                  </p>
                   {task.linkedEntity.type === 'import' && (
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                       {task.linkedEntity.data.category}
                    </Badge>
                  )}
                </div>
                 <div className="text-sm text-gray-400">
                    {task.linkedEntity.type === 'vehicle' && `Owner: ${task.linkedEntity.data.ownerName || 'Unknown'}`}
                    {task.linkedEntity.type === 'import' && `Status: ${task.linkedEntity.data.status}`}
                    {task.linkedEntity.type === 'company' && `TIN: ${task.linkedEntity.data.tinNumber || 'N/A'}`}
                    {task.linkedEntity.type === 'person' && `Passport: ${task.linkedEntity.data.passportNumber || 'N/A'}`}
                 </div>
              </Link>
            </Card>
          )}

          {/* Related Permit (Legacy Support) */}
          {!task.linkedEntity && permit && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Related Permit
              </h3>

              <Link
                href={`/permits/${permit.id}`}
                className="block p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-green-500/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium group-hover:text-green-400 transition-colors">{permit.category.replace(/_/g, " ")}</p>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
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
           <TaskActionsCard
                taskId={taskData.id}
                status={taskData.status}
                hasPermit={!!task.permit}
                permitCategory={task.permit?.category}
                onEdit={() => setEditSheetOpen(true)}
           />

           {/* Assignee Information */}
          {assignee ? (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Assigned To
              </h3>

              <div className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                    {assignee.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                   <p className="text-white font-medium text-sm">{assignee.name}</p>
                   {assignee.email && <p className="text-gray-400 text-xs">{assignee.email}</p>}
                </div>
              </div>
            </Card>
          ) : (
             <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    Assigned To
                </h3>
                <div className="flex items-center justify-center p-4 bg-gray-900/30 rounded-lg border border-dashed border-gray-700">
                    <span className="text-gray-500 text-sm">Unassigned</span>
                </div>
             </Card>
          )}

          {/* Quick Info */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-500" />
                Quick Info
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-900/50">
                <span className="text-sm text-gray-400">Created</span>
                <span className="text-xs text-white bg-gray-700 px-2 py-0.5 rounded-full">{new Date(taskData.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-900/50">
                <span className="text-sm text-gray-400">Last Updated</span>
                <span className="text-xs text-white bg-gray-700 px-2 py-0.5 rounded-full">{new Date(taskData.updatedAt).toLocaleDateString()}</span>
              </div>

              {taskData.dueDate && (
                <div className="flex justify-between items-center p-2 rounded-lg bg-gray-900/50">
                  <span className="text-sm text-gray-400">Days Remaining</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    new Date(taskData.dueDate) < new Date()
                      ? "bg-red-900/50 text-red-400 border border-red-900"
                      : "bg-green-900/50 text-green-400 border border-green-900"
                  }`}>
                    {Math.ceil((new Date(taskData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <TaskSheet 
        open={editSheetOpen} 
        onOpenChange={setEditSheetOpen} 
        onSubmit={handleEditSubmit} 
        task={sheetTask} 
      />
    </div>
  )
}
