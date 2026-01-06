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
  Car,
  ArrowLeft,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  User,
  ClipboardList,
  CheckCircle,
  Circle,
} from "lucide-react"
import { deleteVehicle, updateVehicle } from "@/lib/actions/v2/vehicles"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { VehicleSheet } from "@/components/sheets/vehicle-sheet"
import { toast } from "sonner"

interface VehicleDetailPageProps {
  initialData: any
}

// Stage configurations matching vehicle-sheet
const STAGES: Record<string, { value: string; label: string }[]> = {
  inspection: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "INSPECTION", label: "Inspection" },
    { value: "COMPLETED", label: "Completed" },
  ],
  road_fund: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "PAYMENT", label: "Payment" },
    { value: "APPLY", label: "Apply" },
    { value: "COMPLETED", label: "Completed" },
  ],
  insurance: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "APPLY", label: "Apply" },
    { value: "PAYMENT", label: "Payment" },
    { value: "COMPLETED", label: "Completed" },
  ],
  road_transport: [
    { value: "DOCUMENT_PREP", label: "Document Prep" },
    { value: "APPLY", label: "Apply" },
    { value: "APPROVED", label: "Approved" },
  ],
}

export function VehicleDetailPage({ initialData }: VehicleDetailPageProps) {
  const router = useRouter()
  const [vehicle, setVehicle] = useState(initialData)
  const [actionLoading, setActionLoading] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)

  const handleDelete = async () => {
    setActionLoading(true)
    const result = await deleteVehicle(vehicle.id)
    if (result.success) {
      router.push("/vehicle")
    }
    setActionLoading(false)
  }

  const handleEditSubmit = async (data: any) => {
    const result = await updateVehicle(vehicle.id, data)
    if (result.success && result.data) {
      setVehicle(result.data)
      toast.success("Vehicle updated successfully")
      router.refresh()
    } else {
      toast.error("Failed to update vehicle")
    }
    setEditSheetOpen(false)
  }

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case "inspection": return "Vehicle Inspection"
      case "road_fund": return "Road Fund"
      case "insurance": return "Insurance"
      case "road_transport": return "Road Transport"
      default: return type || "Not specified"
    }
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case "inspection": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "road_fund": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "insurance": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "road_transport": return "bg-green-500/10 text-green-400 border-green-500/20"
      default: return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "DOCUMENT_PREP": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "INSPECTION": case "APPLY": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "PAYMENT": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "COMPLETED": case "APPROVED": return "bg-green-500/10 text-green-400 border-green-500/20"
      default: return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  const stages = STAGES[vehicle.serviceType || vehicle.category] || []
  const currentStageIndex = stages.findIndex(s => s.value === vehicle.currentStage)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/vehicle")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Car className="h-6 w-6 text-green-500" />
              {vehicle.plateNumber || "Vehicle Details"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {vehicle.vehicleModel} {vehicle.vehicleYear && `(${vehicle.vehicleYear})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${getServiceTypeColor(vehicle.serviceType || vehicle.category)} text-sm px-3 py-1 border`}>
            {getServiceTypeLabel(vehicle.serviceType || vehicle.category)}
          </Badge>
          {vehicle.currentStage && (
            <Badge className={`${getStageColor(vehicle.currentStage)} text-sm px-3 py-1 border`}>
              {stages.find(s => s.value === vehicle.currentStage)?.label || vehicle.currentStage}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Information */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2 text-green-500" />
              Vehicle Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Plate Number</p>
                <p className="text-white font-medium mt-1">{vehicle.plateNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Vehicle Type</p>
                <p className="text-white mt-1">{vehicle.vehicleType || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Chassis Number</p>
                <p className="text-white mt-1">{vehicle.chassisNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Engine Number</p>
                <p className="text-white mt-1">{vehicle.engineNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Model</p>
                <p className="text-white mt-1">{vehicle.vehicleModel || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Year</p>
                <p className="text-white mt-1">{vehicle.vehicleYear || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <User className="h-3 w-3" /> Owner
                </p>
                <p className="text-white mt-1">{vehicle.ownerName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Mileage</p>
                <p className="text-white mt-1">{vehicle.currentMileage || "N/A"}</p>
              </div>
            </div>

            {vehicle.notes && (
              <>
                <Separator className="bg-gray-700 my-4" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-gray-300 text-sm">{vehicle.notes}</p>
                </div>
              </>
            )}
          </Card>

          {/* Documents */}
          {vehicle.documents && vehicle.documents.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Documents ({vehicle.documents.length})
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {vehicle.documents.map((doc: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-800 rounded-md border border-gray-700">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{doc.title || doc.type || `Document ${idx + 1}`}</p>
                        <p className="text-xs text-gray-500">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    {doc.fileUrl && (
                      <Link href={doc.fileUrl} target="_blank" prefetch={false}>
                        <Button variant="ghost" size="sm" className="h-8 text-green-400 hover:text-green-300 hover:bg-green-900/20">
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stage Progress */}
          {stages.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-green-500" />
                Stage Progress
              </h3>

              <div className="space-y-3">
                {stages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex
                  const isCurrent = idx === currentStageIndex

                  return (
                    <div key={stage.value} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 
                        ${isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                          isCurrent ? 'border-green-500 text-green-500' : 'border-gray-600 text-gray-500'}`}>
                        {isCompleted ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      </div>
                      <span className={`text-sm ${isCurrent ? 'text-green-400 font-medium' : isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                        {stage.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Documents</span>
                <span className="text-white font-medium">{vehicle.documents?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Created
                </span>
                <span className="text-white text-sm">{new Date(vehicle.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Updated</span>
                <span className="text-white text-sm">{new Date(vehicle.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-gray-700"
                onClick={() => setEditSheetOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Vehicle
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
                    Delete Vehicle
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Vehicle?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      This action cannot be undone. This will permanently delete the vehicle record and all associated documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Sheet */}
      <VehicleSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSubmit={handleEditSubmit}
        vehicle={vehicle}
      />
    </div>
  )
}
