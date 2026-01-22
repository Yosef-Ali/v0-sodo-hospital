"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Car,
  ArrowLeft,
  FileText,
  Calendar,
  User,
  ClipboardList,
  CheckCircle,
  Circle,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react"
import { updateVehicle } from "@/lib/actions/v2/vehicles"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { VehicleSheet } from "@/components/sheets/vehicle-sheet"
import { toast } from "sonner"
import { VehicleActionsCard } from "@/components/vehicles/vehicle-actions-card"

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
  const [isPending, startTransition] = useTransition()
  
  const [vehicle, setVehicle] = useState(initialData)
  
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [ticketCopied, setTicketCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const copyTicketNumber = async () => {
    if (vehicle.ticketNumber) {
      await navigator.clipboard.writeText(vehicle.ticketNumber)
      setTicketCopied(true)
      setTimeout(() => setTicketCopied(false), 2000)
    }
  }

  const handleEditSubmit = async (data: any) => {
    setIsSaving(true)
    try {
      const result = await updateVehicle(vehicle.id, data)
      if (result.success && result.data) {
        setVehicle(result.data)
        toast.success("Vehicle updated successfully")
        setEditSheetOpen(false)
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error("Failed to update vehicle", { description: result.error })
      }
    } catch (error) {
       console.error("Update error:", error)
       toast.error("An error occurred while saving")
    } finally {
       setIsSaving(false)
    }
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
            variant="outline"
            size="sm"
            onClick={() => router.push("/vehicle")}
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-600/20 flex items-center justify-center text-green-500 border-2 border-green-500/30 flex-shrink-0">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <span className="flex items-center gap-2">
                   {vehicle.plateNumber || "Vehicle Details"}
                </span>
                {vehicle.ticketNumber && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono text-green-400">{vehicle.ticketNumber}</span>
                    <button
                      onClick={copyTicketNumber}
                      className="p-1 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                    >
                      {ticketCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {!vehicle.ticketNumber && (
                        <span className="text-gray-500 text-sm">
                            • {vehicle.vehicleModel} {vehicle.vehicleYear && `(${vehicle.vehicleYear})`}
                        </span>
                    )}
                  </div>
                )}
                {!vehicle.ticketNumber && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      {vehicle.vehicleModel && <span>{vehicle.vehicleModel}</span>}
                      {vehicle.vehicleYear && <span>({vehicle.vehicleYear})</span>}
                    </div>
                )}
              </div>
            </h1>
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
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Car className="h-5 w-5 text-green-500" />
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
                <Separator className="bg-gray-700/50 my-4" />
                <div>
                  <p className="text-sm text-gray-400 mb-2">Notes</p>
                   <div className="bg-gray-900/30 p-3 rounded-md border border-gray-700/50">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{vehicle.notes}</p>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Uploaded Documents */}
           {(() => {
             const totalDocs = vehicle.documentSections?.reduce((acc: number, section: any) => acc + (section.files?.length || 0), 0) || 0;
             const customDocs = vehicle.documents?.length || 0;
             
             if (totalDocs === 0 && customDocs === 0) return null;
             
             return (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Uploaded Documents
                  <Badge className="bg-blue-900/50 text-blue-300 text-xs ml-2">{totalDocs + customDocs}</Badge>
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {vehicle.documentSections?.map((section: any, sectionIdx: number) => {
                    if (!section.files || section.files.length === 0) return null;
                    return section.files.map((fileUrl: string, fileIdx: number) => (
                      <div key={`${sectionIdx}-${fileIdx}`} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-gray-800 rounded-md border border-gray-700 group-hover:border-blue-500/50 transition-colors">
                            <FileText className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {section.customTitle || section.type?.replace(/_/g, ' ').replace(/\b\w/g, (l:string)=>l.toUpperCase()) || `Document ${fileIdx + 1}`}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-700 h-5 px-1.5 uppercase">
                                {fileUrl.split('.').pop() || "FILE"}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(vehicle.updatedAt || vehicle.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Link href={fileUrl} target="_blank" prefetch={false}>
                             <Button variant="ghost" size="sm" className="h-8 text-green-400 hover:text-green-300 hover:bg-green-900/20">
                               View
                             </Button>
                           </Link>
                        </div>
                      </div>
                    ));
                  })}
                  
                  {/* Custom Documents array */}
                  {vehicle.documents?.map((fileUrl: string, fileIdx: number) => (
                    <div key={`custom-${fileIdx}`} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-md border border-gray-700 group-hover:border-blue-500/50 transition-colors">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Supporting Document {fileIdx + 1}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-700 h-5 px-1.5 uppercase">
                              {fileUrl.split('.').pop() || "FILE"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Link href={fileUrl} target="_blank" prefetch={false}>
                           <Button variant="ghost" size="sm" className="h-8 text-green-400 hover:text-green-300 hover:bg-green-900/20">
                             View
                           </Button>
                         </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
             );
          })()}
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

               <div className="space-y-3 relative">
                 {/* Connector Line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-700" style={{ zIndex: 0 }} />
                
                {stages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex
                  const isCurrent = idx === currentStageIndex

                  return (
                    <div key={stage.value} className="flex items-center gap-3 relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                        ${isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                          isCurrent ? 'bg-gray-800 border-green-500 text-green-500 ring-2 ring-green-500/20' : 'bg-gray-800 border-gray-600 text-gray-500'}`}>
                        {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : <div className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-green-500' : 'bg-transparent'}`} />}
                      </div>
                      <span className={`text-sm ${isCurrent ? 'text-green-400 font-medium' : isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
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
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Quick Stats
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-blue-500/20">
                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-400">Documents</span>
                </div>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-sm font-medium">
                  {(vehicle.documentSections || []).reduce((acc: number, section: any) => acc + (section.files?.length || 0), 0) + (vehicle.documents?.length || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-purple-500/20">
                    <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-400">Created</span>
                </div>
                <span className="text-white text-xs text-right">{new Date(vehicle.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-orange-500/20">
                     <RefreshCw className="h-3.5 w-3.5 text-orange-400" />
                  </div>
                  <span className="text-sm text-gray-400">Updated</span>
                </div>
                <span className="text-white text-xs text-right">{new Date(vehicle.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-green-500/20">
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  <span className="text-sm text-gray-400">Status</span>
                </div>
                <Badge className="bg-green-900 text-green-300 text-xs font-medium px-2.5">
                    {(vehicle.status || "Active").replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <VehicleActionsCard 
             vehicleId={vehicle.id} 
             onEdit={() => setEditSheetOpen(true)}
          />
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
