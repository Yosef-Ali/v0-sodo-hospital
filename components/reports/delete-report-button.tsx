"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { deleteReport } from "@/lib/actions/v2/reports"

interface DeleteReportButtonProps {
  reportId: string
  reportTitle: string
}

export function DeleteReportButton({ reportId, reportTitle }: DeleteReportButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteReport(reportId)
      if (result.success) {
        toast.success("Report deleted successfully")
        router.push("/reports")
        router.refresh()
      } else {
        toast.error("Failed to delete report", { description: result.error })
        setIsDeleting(false) 
      }
    } catch (error) {
       console.error("Delete error:", error)
       toast.error("An error occurred while deleting")
       setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10 border-red-900/30">
          <Trash className="h-4 w-4 mr-2" />
          Delete Report
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This will permanently delete the report <span className="text-white font-semibold">"{reportTitle}"</span>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
