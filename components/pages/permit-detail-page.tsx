"use client"

import { useState, useTransition } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Shield,
  User,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  History,
  Eye,
  Download,
  Check
} from "lucide-react"
import { getPermitById } from "@/lib/actions/v2/permits" // We don't need transitionPermitStatus here anymore, handled in card
import { formatEC, gregorianToEC } from "@/lib/dates/ethiopian"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChecklistPanel } from "@/components/permit/checklist-panel"
import { DocumentUploader } from "@/components/ui/document-uploader"
import { PermitActionsCard } from "@/components/permit/permit-actions-card"
import { toast } from "sonner"

interface PermitDetailPageProps {
  initialData: any
}

export function PermitDetailPage({ initialData }: PermitDetailPageProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [permit, setPermit] = useState<any>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reload function if needed for checklist updates
  const loadPermit = async () => {
    setLoading(true)
    setError(null)
    const result = await getPermitById(permit.permit.id)
    if (result.success) {
      setPermit(result.data)
      startTransition(() => {
        router.refresh()
      })
    } else {
      setError(result.error || "Failed to load permit")
    }
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />
      case "SUBMITTED": return <AlertCircle className="h-4 w-4" />
      case "APPROVED": return <CheckCircle className="h-4 w-4" />
      case "REJECTED": return <XCircle className="h-4 w-4" />
      case "EXPIRED": return <XCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "SUBMITTED": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "APPROVED": return "bg-green-500/10 text-green-400 border-green-500/20"
      case "REJECTED": return "bg-red-500/10 text-red-400 border-red-500/20"
      case "EXPIRED": return "bg-gray-500/10 text-gray-400 border-gray-500/20"
      default: return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      WORK_PERMIT: t("permit.workPermit") || "Work Permit",
      RESIDENCE_ID: t("permit.residenceId") || "Residence ID",
      LICENSE: t("permit.license") || "License",
      PIP: t("permit.pip") || "PIP",
    }
    return labels[category] || category
  }

  const formatDueDate = (dueDate: string | null, dueDateEC: string | null) => {
    if (!dueDate) return null
    try {
      const date = new Date(dueDate)
      const ec = dueDateEC || formatEC(gregorianToEC(date), i18n.language as "en" | "am", "long")
      const gregorian = date.toLocaleDateString(i18n.language, {
        year: "numeric", month: "long", day: "numeric",
      })
      return { ec, gregorian }
    } catch { return null }
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push("/permits")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Permits
          </Button>
        </div>
      </div>
    )
  }

  const permitData = permit.permit
  const person = permit.person
  const checklist = permit.checklist
  const history = permit.history || []
  const tasks = permit.tasks || []
  const documents = permit.documents || []
  const dueDate = formatDueDate(permitData.dueDate, permitData.dueDateEC)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/permits")}
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-600/20 flex items-center justify-center text-green-500 border-2 border-green-500/30 flex-shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="flex items-center gap-2">
                   {getCategoryLabel(permitData.category)}
                </span>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    {person && <span>For: {person.firstName} {person.lastName}</span>}
                    {permitData.ticketNumber && <span className="font-mono text-green-400">#{permitData.ticketNumber}</span>}
                </div>
              </div>
            </h1>
          </div>
        </div>

        <Badge className={`${getStatusColor(permitData.status)} text-sm flex items-center gap-2 px-3 py-1 border`}>
          {getStatusIcon(permitData.status)}
          {t(`permit.${permitData.status.toLowerCase()}`) || permitData.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permit Information */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Permit Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Category</p>
                <p className="text-white font-medium mt-1">{getCategoryLabel(permitData.category)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Status</p>
                <div className="mt-1">
                   <Badge className={`${getStatusColor(permitData.status)} text-xs`}>
                    {t(`permit.${permitData.status.toLowerCase()}`) || permitData.status}
                  </Badge>
                </div>
              </div>

              {dueDate && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Due Date</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-white font-medium">{dueDate.ec}</p>
                      <p className="text-xs text-gray-500">{dueDate.gregorian}</p>
                    </div>
                  </div>
                </div>
              )}

              {permitData.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <div className="bg-gray-900/30 p-3 rounded-md border border-gray-700/50">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{permitData.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Person Information */}
          {person && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                Person Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <Link
                    href={`/foreigners/${person.id}`}
                    className="text-white font-medium hover:text-green-400 transition-colors mt-1 block"
                  >
                    {person.firstName} {person.lastName}
                  </Link>
                </div>

                {person.nationality && (
                  <div>
                    <p className="text-sm text-gray-400">Nationality</p>
                    <p className="text-white mt-1">{person.nationality}</p>
                  </div>
                )}

                {person.passportNo && (
                  <div>
                    <p className="text-sm text-gray-400">Passport No</p>
                    <p className="text-white mt-1">{person.passportNo}</p>
                  </div>
                )}

                {(person.email || person.phone) && (
                  <div>
                    <p className="text-sm text-gray-400">Contact</p>
                    <div className="mt-1 space-y-1">
                       {person.email && <p className="text-white text-sm">{person.email}</p>}
                       {person.phone && <p className="text-white text-sm">{person.phone}</p>}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Checklist */}
          {checklist && (
            <ChecklistPanel
              checklist={checklist}
              permitId={permit.permit.id}
              userRole="USER"
              canEdit={true}
              onItemUpdate={async (itemId, updates) => {
                await loadPermit()
              }}
            />
          )}

          {/* Document Uploader */}
          <DocumentUploader
            ticketNumber={permitData.ticketNumber}
            personId={permitData.personId || person?.id}
            permitId={permitData.id}
            onUploadComplete={loadPermit}
          />

          {/* Documents */}
          {documents.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Uploaded Documents ({documents.length})
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-800 rounded-md border border-gray-700 group-hover:border-blue-500/50 transition-colors">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                         <p className="text-sm font-medium text-white truncate">
                          {doc.title || doc.type}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-700 h-5 px-1.5 uppercase">
                                {doc.type}
                            </Badge>
                            {doc.fileSize && (
                                <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                            )}
                             {doc.issuedBy && (
                                <span className="text-xs text-gray-500 border-l border-gray-700 pl-2">By: {doc.issuedBy}</span>
                            )}
                        </div>
                      </div>
                    </div>
                    
                    {doc.fileUrl && (
                        <div className="flex items-center gap-2">
                           <Link href={doc.fileUrl} target="_blank" prefetch={false}>
                             <Button variant="ghost" size="sm" className="h-8 text-green-400 hover:text-green-300 hover:bg-green-900/20">
                                View
                             </Button>
                           </Link>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-green-500" />
                Audit Trail
              </h3>

              <div className="space-y-3">
                {history.map((entry: any) => (
                  <div
                    key={entry.history.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700"
                  >
                    <div className="w-full">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={`${getStatusColor(entry.history.fromStatus)} text-xs border`}>
                          {entry.history.fromStatus}
                        </Badge>
                        <span className="text-gray-500">→</span>
                        <Badge className={`${getStatusColor(entry.history.toStatus)} text-xs border`}>
                          {entry.history.toStatus}
                        </Badge>
                      </div>
                      {entry.history.notes && (
                        <p className="text-sm text-gray-300 mb-2 mt-2 bg-gray-800 p-2 rounded border border-gray-700/50">{entry.history.notes}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                           {entry.user && <span>by {entry.user.name || entry.user.email}</span>}
                        </div>
                         <span className="text-xs text-gray-500">{new Date(entry.history.changedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <PermitActionsCard 
             permitId={permit.permit.id}
             status={permitData.status}
             onStatusChange={loadPermit}
          />

          {/* Related Tasks */}
          <Card className="bg-gray-800 border-gray-700 p-6">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Related Tasks
            </h3>
            
            {tasks.length > 0 ? (
                <div className="space-y-2">
                    {tasks.map((taskItem: any) => (
                    <Link
                        key={taskItem.task.id}
                        href={`/tasks/${taskItem.task.id}`}
                        className="block p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-green-500/50 transition-colors"
                    >
                        <p className="text-sm font-medium text-white">{taskItem.task.title}</p>
                        {taskItem.assignee && (
                        <p className="text-xs text-gray-500 mt-1">
                            Assigned to: {taskItem.assignee.name}
                        </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px] border-gray-600 text-gray-400">
                                {taskItem.task.status}
                            </Badge>
                             <span className="text-[10px] text-gray-500">
                                {new Date(taskItem.task.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </Link>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-400 italic text-center py-4">No related tasks</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
