"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Edit2, Trash2 } from "lucide-react"
import { deleteVehicle } from "@/lib/actions/v2/vehicles"
import { useToast } from "@/components/ui/use-toast"

interface VehicleActionsCardProps {
  vehicleId: string
  onEdit?: () => void
}

export function VehicleActionsCard({ vehicleId, onEdit }: VehicleActionsCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    
    const result = await deleteVehicle(vehicleId)

    if (result.success) {
      toast({
        title: "Vehicle Deleted",
        description: "The vehicle record has been permanently removed.",
      })
      router.push("/vehicle")
      router.refresh()
    } else {
      toast({
        title: "Delete Failed",
        description: result.error || "Could not delete vehicle.",
        variant: "destructive",
      })
      setOpen(false) 
    }

    setIsLoading(false)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      router.push(`/vehicle`)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full border-gray-700 hover:bg-gray-700 text-gray-200"
          onClick={handleEdit}
          disabled={isLoading}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Vehicle
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
              Delete Vehicle
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Vehicle?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently remove this vehicle record and all associated documents.
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
