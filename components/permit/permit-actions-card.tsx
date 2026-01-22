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
  Send, 
  ThumbsUp, 
  ThumbsDown,
  CheckCircle 
} from "lucide-react"
import { deletePermit as deletePermitAction, transitionPermitStatus } from "@/lib/actions/v2/permits"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "react-i18next"

interface PermitActionsCardProps {
  permitId: string
  status: string
  onEdit?: () => void
  onStatusChange?: () => void
}

export function PermitActionsCard({ permitId, status, onEdit, onStatusChange }: PermitActionsCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleStatusTransition = async (
    toStatus: "SUBMITTED" | "APPROVED" | "REJECTED",
    notes?: string
  ) => {
    setIsLoading(true)
    // TODO: Get real user ID
    const userId = "mock-user-id" 
    const result = await transitionPermitStatus(permitId, toStatus, userId, notes)

    if (result.success) {
      toast({ title: "Status Updated", description: `Permit ${toStatus.toLowerCase()}` })
      if (onStatusChange) onStatusChange()
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deletePermitAction(permitId)

    if (result.success) {
      toast({
        title: "Permit Deleted",
        description: "The permit has been permanently removed.",
      })
      router.push("/permits")
      router.refresh()
    } else {
      toast({
        title: "Delete Failed",
        description: result.error || "Could not delete permit.",
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
      router.push(`/permits/${permitId}/edit`)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

      <div className="space-y-4">
        {status === "PENDING" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Approval
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-800 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Submit Permit?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This will submit the permit for approval.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleStatusTransition("SUBMITTED", "Submitted for approval")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {status === "SUBMITTED" && (
          <div className="space-y-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Approve Permit?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This will mark the permit as approved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleStatusTransition("APPROVED", "Permit approved")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-red-700 text-red-400 hover:bg-red-900/20"
                  disabled={isLoading}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Reject Permit?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This will reject the permit.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleStatusTransition("REJECTED", "Permit rejected")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        <Separator className="bg-gray-700" />
        
        <Button
          variant="outline"
          className="w-full border-gray-700 hover:bg-gray-700 text-gray-200"
          onClick={handleEdit}
          disabled={isLoading}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Permit
        </Button>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-red-900/30 text-red-400 hover:bg-red-900/20 hover:border-red-900/50"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Permit?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently remove this permit.
              </AlertDialogDescription>
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
