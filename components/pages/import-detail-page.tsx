"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  ArrowLeft,
  FileText,
  Calendar,
  Globe,
  ClipboardList,
  CheckCircle,
  Circle,
  DollarSign,
  Copy,
  Check,
  RefreshCw,
  Info
} from "lucide-react"
import { updateImport } from "@/lib/actions/v2/imports"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ImportSheet } from "@/components/sheets/import-sheet"
import { toast } from "sonner"
import { ImportActionsCard } from "@/components/imports/import-actions-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DeleteDocumentButton } from "@/components/ui/delete-document-button"

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
  customs_clearance: [
    { value: "DOCUMENT_COLLECTION", label: "Document Collection" },
    { value: "SUBMISSION", label: "Submission" },
    { value: "ASSESSMENT", label: "Assessment" },
    { value: "RELEASE", label: "Release" },
  ],
}

export function ImportDetailPage({ initialData }: ImportDetailPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Use local state for permit data so we can update it after edit
  const [permit, setPermit] = useState(initialData)
  
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [ticketCopied, setTicketCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const copyTicketNumber = async () => {
    if (permit.ticketNumber) {
      await navigator.clipboard.writeText(permit.ticketNumber)
      setTicketCopied(true)
      setTimeout(() => setTicketCopied(false), 2000)
    }
  }

  const handleEditSubmit = async (data: any) => {
    setIsSaving(true)
    try {
      const result = await updateImport(permit.id, data)
      
      if (result.success && result.data) {
        setPermit(result.data)
        toast.success("Import updated successfully")
        setEditSheetOpen(false)
        
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error("Failed to update import", { description: result.error || "Unknown error" })
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const getImportTypeLabel = (type: string) => {
    switch (type) {
      case "pip": return "PIP Certificate"
      case "single_window": return "Single Window"
      case "customs_clearance": return "Customs Clearance"
      default: return type || "Not specified"
    }
  }

  const getImportTypeColor = (type: string) => {
    switch (type) {
      case "pip": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "single_window": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "customs_clearance": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      default: return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "SUPPORT_LETTER": case "DOCUMENT_ARRANGEMENT": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "PIP_APPLICATION": case "APPLY_ONLINE": case "SUBMISSION": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "SUBMIT": case "ASSESSMENT": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "APPROVED": case "RELEASE": return "bg-green-500/10 text-green-400 border-green-500/20"
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
            variant="outline"
            size="sm"
            onClick={() => router.push("/import")}
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-600/20 flex items-center justify-center text-green-500 border-2 border-green-500/30 flex-shrink-0">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <span className="flex items-center gap-2">
                  {permit.title || "Import Permit Details"}
                </span>
                {permit.ticketNumber && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono text-green-400">{permit.ticketNumber}</span>
                    <button
                      onClick={copyTicketNumber}
                      className="p-1 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                    >
                      {ticketCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {!permit.ticketNumber && permit.supplierName && (
                      <span className="text-gray-500 text-sm">• {permit.supplierName}</span>
                    )}
                  </div>
                )}
                {!permit.ticketNumber && (
                   <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                     {permit.supplierName && <span>{permit.supplierName}</span>}
                     {permit.supplierCountry && <span>({permit.supplierCountry})</span>}
                   </div>
                )}
              </div>
            </h1>
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
        {/* Left Column - Details & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Import Information */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
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
                <Separator className="bg-gray-700/50 my-4" />
                <div>
                  <p className="text-sm text-gray-400 mb-2">Item Description</p>
                  <div className="bg-gray-900/30 p-3 rounded-md border border-gray-700/50">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{permit.itemDescription}</p>
                  </div>
                </div>
              </>
            )}

            {permit.notes && (
              <>
                <Separator className="bg-gray-700/50 my-4" />
                <div>
                  <p className="text-sm text-gray-400 mb-2">Notes</p>
                  <div className="bg-gray-900/30 p-3 rounded-md border border-gray-700/50">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{permit.notes}</p>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Uploaded Documents */}
          {(() => {
             // Calculate total docs
             const totalDocs = permit.documentSections?.reduce((acc: number, section: any) => acc + (section.files?.length || 0), 0) || 0;
             const customDocs = permit.documents?.length || 0;
             
             if (totalDocs === 0 && customDocs === 0) return null;
             
             return (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Uploaded Documents
                  <Badge className="bg-blue-900/50 text-blue-300 text-xs ml-2">{totalDocs + customDocs}</Badge>
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {/* Section Documents */}
                  {permit.documentSections?.map((section: any, sectionIdx: number) => {
                    if (!section.files || section.files.length === 0) return null;
                    return section.files.map((fileUrl: string, fileIdx: number) => {
                      const handleDeleteParams = () => {
                        return async () => {
                           const { deleteEntityFile } = await import("@/lib/actions/v2/documents")
                           await deleteEntityFile("import", permit.id, fileUrl)
                           router.refresh()
                        }
                      }
                      
                      return (
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
                                {new Date(permit.updatedAt || permit.createdAt).toLocaleDateString()}
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
                           <DeleteDocumentButton 
                             itemName="Document"
                             onConfirm={handleDeleteParams()}
                           />
                        </div>
                      </div>
                    )});
                  })}
                  
                  {/* Custom Documents array (legacy/direct uploads) */}
                  {permit.documents?.map((fileUrl: string, fileIdx: number) => {
                    const handleDeleteParams = () => {
                        return async () => {
                           const { deleteEntityFile } = await import("@/lib/actions/v2/documents")
                           await deleteEntityFile("import", permit.id, fileUrl)
                           router.refresh()
                        }
                    }

                    return (
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
                         <DeleteDocumentButton 
                             itemName="Document"
                             onConfirm={handleDeleteParams()}
                         />
                      </div>
                    </div>
                  )})}
                </div>
              </Card>
             );
          })()}
        </div>

        {/* Right Column - Stats & Actions */}
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
                <span className="text-white font-semibold bg-gray-700 px-2.5 py-0.5 rounded-full text-sm">
                  {(permit.documentSections || []).reduce((acc: number, section: any) => acc + (section.files?.length || 0), 0) + (permit.documents?.length || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-purple-500/20">
                    <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-400">Created</span>
                </div>
                <span className="text-white text-xs text-right">
                  {new Date(permit.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-orange-500/20">
                    <RefreshCw className="h-3.5 w-3.5 text-orange-400" />
                  </div>
                  <span className="text-sm text-gray-400">Updated</span>
                </div>
                <span className="text-white text-xs text-right">
                  {new Date(permit.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-green-500/20">
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  <span className="text-sm text-gray-400">Status</span>
                </div>
                <Badge className="bg-green-900 text-green-300 text-xs font-medium px-2.5">
                  {(permit.status || "Active").replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <ImportActionsCard 
             importId={permit.id} 
             onEdit={() => setEditSheetOpen(true)}
          />
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
