"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
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
  Edit2, 
  Trash2, 
  CheckCircle,
} from "lucide-react"
import { completeTask, deleteTask } from "@/lib/actions/v2/tasks"
import { useToast } from "@/components/ui/use-toast"

interface TaskActionsCardProps {
  taskId: string
  status: string
  hasPermit?: boolean
  permitCategory?: string
  onEdit?: () => void
}

export function TaskActionsCard({ taskId, status, hasPermit, permitCategory, onEdit }: TaskActionsCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePermit, setDeletePermit] = useState(false)

  const handleCompleteTask = async () => {
    setIsLoading(true)

    const result = await completeTask(taskId, "Task marked as completed")

    if (result.success) {
      toast({ title: "Task Completed", description: "The task has been marked as completed." })
      router.refresh()
    } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
    }

    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    
    const result = await deleteTask(taskId, { deletePermit })

    if (result.success) {
      toast({
        title: "Task Deleted",
        description: "The task has been permanently removed.",
      })
      router.push("/tasks")
      router.refresh()
    } else {
      toast({
        title: "Delete Failed",
        description: result.error || "Could not delete task.",
        variant: "destructive",
      })
      setDeleteOpen(false) 
    }

    setIsLoading(false)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      router.push(`/tasks/${taskId}/edit`)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

      <div className="space-y-4">
        {status !== "completed" && (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
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
          className="w-full border-gray-700 hover:bg-gray-700 text-gray-200"
          onClick={handleEdit}
          disabled={isLoading}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Task
        </Button>

        <Separator className="bg-gray-700" />

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-red-900/30 text-red-400 hover:bg-red-900/20 hover:border-red-900/50"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Task?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently remove this task.
              </AlertDialogDescription>
              
               {hasPermit && (
                <div className="flex items-center space-x-2 mt-4 p-3 bg-red-900/10 border border-red-900/30 rounded-md">
                    <Checkbox 
                        id="delete-permit" 
                        checked={deletePermit}
                        onCheckedChange={(c) => setDeletePermit(!!c)}
                        className="border-red-400/50 data-[state=checked]:bg-red-500 data-[state=checked]:text-white"
                    />
                    <label
                        htmlFor="delete-permit"
                        className="text-sm text-gray-300 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Also delete related <span className="text-white font-semibold">Permit ({permitCategory?.replace(/_/g, " ")})</span> and its history
                    </label>
                </div>
            )}
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Delete Permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  )
}
