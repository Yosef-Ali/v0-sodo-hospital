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
  Package,
  ArrowLeft,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  Globe,
  ClipboardList,
  CheckCircle,
  Circle,
  DollarSign,
} from "lucide-react"
import { deleteImport } from "@/lib/actions/v2/imports"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ImportSheet } from "@/components/sheets/import-sheet"

interface ImportDetailPageProps {
  initialData: any
}

const STAGES: Record<string, { value: string; label: string }[]> = {
  pip: [
    { value: "SUPPORT_LETTER", label: "Support Letter" },
    { value: "PIP_APPLICATION", label: "PIP Application" },
    { value: "DOCUMENT_ARRANGEMENT", label: "Documents" },
    { value: "SUBMIT", label: "Submit" },
    { value: "APPROVED", label: "Approved" },
  ],
  single_window: [
    { value: "DOCUMENT_ARRANGEMENT", label: "Documents" },
    { value: "APPLY_ONLINE", label: "Apply Online" },
    { value: "SUBMIT", label: "Submit" },
    { value: "APPROVED", label: "Approved" },
  ],
}

export function ImportDetailPage({ initialData }: ImportDetailPageProps) {
  const router = useRouter()
  const [permit] = useState(initialData)
  const [actionLoading, setActionLoading] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)

  const handleDelete = async () => {
    setActionLoading(true)
    const result = await deleteImport(permit.id)
    if (result.success) {
      router.push("/import")
    }
    setActionLoading(false)
  }

  const handleEditSubmit = () => {
    router.refresh()
    setEditSheetOpen(false)
  }

  const getImportTypeLabel = (type: string) => {
    switch (type) {
      case "pip": return "PIP Certificate"
      case "single_window": return "Single Window"
      default: return type || "Not specified"
    }
  }

  const getImportTypeColor = (type: string) => {
    switch (type) {
      case "pip": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "single_window": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default: return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "SUPPORT_LETTER": case "DOCUMENT_ARRANGEMENT": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "PIP_APPLICATION": case "APPLY_ONLINE": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "SUBMIT": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "APPROVED": return "bg-green-500/10 text-green-400 border-green-500/20"
      default: return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  const stages = STAGES[permit.importType || permit.category] || []
  const currentStageIndex = stages.findIndex(s => s.value === permit.currentStage)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/import")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="h-6 w-6 text-green-500" />
              {permit.title || "Import Permit Details"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {permit.supplierName && `From ${permit.supplierName}`}
              {permit.supplierCountry && ` (${permit.supplierCountry})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${getImportTypeColor(permit.importType || permit.category)} text-sm px-3 py-1 border`}>
            {getImportTypeLabel(permit.importType || permit.category)}
          </Badge>
          {permit.currentStage && (
            <Badge className={`${getStageColor(permit.currentStage)} text-sm px-3 py-1 border`}>
              {stages.find(s => s.value === permit.currentStage)?.label || permit.currentStage}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Import Information */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-500" />
              Import Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Title</p>
                <p className="text-white font-medium mt-1">{permit.title || "N/A"}</p>
              </div>
              {permit.supplierName && (
                <div>
                  <p className="text-sm text-gray-400">Supplier</p>
                  <p className="text-white mt-1">{permit.supplierName}</p>
                </div>
              )}
              {permit.supplierCountry && (
                <div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Country
                  </p>
                  <p className="text-white mt-1">{permit.supplierCountry}</p>
                </div>
              )}
              {permit.estimatedValue && (
                <div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Estimated Value
                  </p>
                  <p className="text-white mt-1">{permit.estimatedValue} {permit.currency || "USD"}</p>
                </div>
              )}
            </div>

            {permit.itemDescription && (
              <>
                <Separator className="bg-gray-700 my-4" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Item Description</p>
                  <p className="text-gray-300 text-sm">{permit.itemDescription}</p>
                </div>
              </>
            )}

            {permit.notes && (
              <>
                <Separator className="bg-gray-700 my-4" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-gray-300 text-sm">{permit.notes}</p>
                </div>
              </>
            )}
          </Card>

          {/* Documents */}
          {permit.documents && permit.documents.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Documents ({permit.documents.length})
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {permit.documents.map((doc: any, idx: number) => (
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
                <span className="text-white font-medium">{permit.documents?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Created
                </span>
                <span className="text-white text-sm">{new Date(permit.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Updated</span>
                <span className="text-white text-sm">{new Date(permit.updatedAt).toLocaleDateString()}</span>
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
                Edit Import
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
                    Delete Import
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Import?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      This action cannot be undone. This will permanently delete the import record and all associated documents.
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
      <ImportSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSubmit={handleEditSubmit}
        permit={permit}
      />
    </div>
  )
}
