"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import { Edit2, Trash2, AlertTriangle } from "lucide-react"
import { deletePerson } from "@/lib/actions/v2/people"
import { useToast } from "@/components/ui/use-toast"

interface PersonActionsCardProps {
  personId: string
  hasRelatedData: boolean // if true, show cascade warning
}

export function PersonActionsCard({ personId, hasRelatedData }: PersonActionsCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [cascadeDelete, setCascadeDelete] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    
    // Safety check: if related data exists but cascade not checked, server would error anyway, 
    // but good to check here or rely on server response.
    
    const result = await deletePerson(personId, { cascade: cascadeDelete })

    if (result.success) {
      toast({
        title: "Person Deleted",
        description: "The person and requested data have been permanently removed.",
      })
      router.push("/people")
      router.refresh()
    } else {
      toast({
        title: "Delete Failed",
        description: result.error || "Could not delete person.",
        variant: "destructive",
      })
      // Reset dialog if failed
      setOpen(false) 
    }

    setIsLoading(false)
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

      <div className="space-y-4">
        {/* Edit Button - Placeholder for now as route might not exist yet, 
            but good to have consistent UI */}
        <Button
          variant="outline"
          className="w-full border-gray-700 hover:bg-gray-700 text-gray-200"
          onClick={() => router.push(`/people/${personId}/edit`)} // Assuming edit route exists or will exist
          disabled={isLoading}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Person
        </Button>

        <Separator className="bg-gray-700" />

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-red-900/30 text-red-400 hover:bg-red-900/20 hover:border-red-900/50"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Person
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Person?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently remove this person record.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {hasRelatedData && (
              <div className="bg-red-900/20 border border-red-900/50 rounded-md p-4 my-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <p className="text-sm text-red-300 font-medium">
                      Warning: Associated Data Found
                    </p>
                    <p className="text-xs text-red-300/80 leading-relaxed">
                      This person has associated <strong>Permits, Tasks, or Dependents</strong>. 
                      Standard deletion is blocked to prevent data loss.
                    </p>
                    <div className="flex items-start space-x-2 pt-1">
                      <Checkbox 
                        id="cascade" 
                        checked={cascadeDelete}
                        onCheckedChange={(checked) => setCascadeDelete(checked as boolean)}
                        className="border-red-400 data-[state=checked]:bg-red-500 data-[state=checked]:text-white mt-0.5"
                      />
                      <label
                        htmlFor="cascade"
                        className="text-sm text-red-200 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Delete person AND all related data
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white">
                Cancel
              </AlertDialogCancel>
              {/* Disable delete if hasRelatedData but checkbox NOT checked */}
              <AlertDialogAction
                onClick={handleDelete}
                disabled={hasRelatedData && !cascadeDelete || isLoading}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
