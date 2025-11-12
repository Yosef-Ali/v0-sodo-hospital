"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Shield,
  User,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Send,
  ThumbsUp,
  ThumbsDown,
  History,
  ListTodo,
} from "lucide-react"
import { getPermitById, transitionPermitStatus } from "@/lib/actions/v2/permits"
import { formatEC, gregorianToEC } from "@/lib/dates/ethiopian"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PermitDetailPageProps {
  permitId: string
}

export function PermitDetailPage({ permitId }: PermitDetailPageProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const [permit, setPermit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadPermit()
  }, [permitId])

  const loadPermit = async () => {
    setLoading(true)
    setError(null)

    const result = await getPermitById(permitId)
    if (result.success) {
      setPermit(result.data)
    } else {
      setError(result.error || "Failed to load permit")
    }

    setLoading(false)
  }

  const handleStatusTransition = async (
    toStatus: "SUBMITTED" | "APPROVED" | "REJECTED" | "EXPIRED",
    notes?: string
  ) => {
    setActionLoading(true)

    // TODO: Get current user ID from auth context
    const userId = "mock-user-id"

    const result = await transitionPermitStatus(permitId, toStatus, userId, notes)

    if (result.success) {
      await loadPermit()
    } else {
      setError(result.error || "Failed to update permit status")
    }

    setActionLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5" />
      case "SUBMITTED":
        return <AlertCircle className="h-5 w-5" />
      case "APPROVED":
        return <CheckCircle className="h-5 w-5" />
      case "REJECTED":
        return <XCircle className="h-5 w-5" />
      case "EXPIRED":
        return <XCircle className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-900 text-yellow-300"
      case "SUBMITTED":
        return "bg-blue-900 text-blue-300"
      case "APPROVED":
        return "bg-green-900 text-green-300"
      case "REJECTED":
        return "bg-red-900 text-red-300"
      case "EXPIRED":
        return "bg-gray-700 text-gray-400"
      default:
        return "bg-gray-700 text-gray-300"
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
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      return { ec, gregorian }
    } catch {
      return null
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-400 mt-4">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || !permit) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-8 text-center">
          <p className="text-red-400 mb-4">{error || "Permit not found"}</p>
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
  const dueDate = formatDueDate(permitData.dueDate, permitData.dueDateEC)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/permits")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <PageHeader
            title={getCategoryLabel(permitData.category)}
            description={`Permit for ${person?.firstName} ${person?.lastName}`}
          />
        </div>

        <Badge className={`${getStatusColor(permitData.status)} text-sm flex items-center gap-2 px-3 py-1`}>
          {getStatusIcon(permitData.status)}
          {t(`permit.${permitData.status.toLowerCase()}`) || permitData.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permit Information */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Permit Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Category</p>
                <p className="text-white font-medium">{getCategoryLabel(permitData.category)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Status</p>
                <Badge className={`${getStatusColor(permitData.status)} text-xs`}>
                  {t(`permit.${permitData.status.toLowerCase()}`) || permitData.status}
                </Badge>
              </div>

              {dueDate && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Due Date</p>
                  <div className="flex items-center space-x-2">
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
                  <p className="text-gray-300 text-sm">{permitData.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Person Information */}
          {person && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-500" />
                Person Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <Link
                    href={`/people/${person.id}`}
                    className="text-white font-medium hover:text-green-400 transition-colors"
                  >
                    {person.firstName} {person.lastName}
                  </Link>
                </div>

                {person.nationality && (
                  <div>
                    <p className="text-sm text-gray-400">Nationality</p>
                    <p className="text-white">{person.nationality}</p>
                  </div>
                )}

                {person.passportNo && (
                  <div>
                    <p className="text-sm text-gray-400">Passport No</p>
                    <p className="text-white">{person.passportNo}</p>
                  </div>
                )}

                {person.email && (
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{person.email}</p>
                  </div>
                )}

                {person.phone && (
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white">{person.phone}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Checklist */}
          {checklist && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ListTodo className="h-5 w-5 mr-2 text-green-500" />
                {checklist.name}
              </h3>

              <div className="space-y-3">
                {checklist.items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700"
                  >
                    <Checkbox
                      id={`item-${index}`}
                      className="mt-1"
                      disabled
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`item-${index}`}
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        {item.label}
                        {item.required && (
                          <span className="text-red-400 ml-1">*</span>
                        )}
                      </label>
                      {item.hint && (
                        <p className="text-xs text-gray-500 mt-1">{item.hint}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <History className="h-5 w-5 mr-2 text-green-500" />
                Audit Trail
              </h3>

              <div className="space-y-3">
                {history.map((entry: any) => (
                  <div
                    key={entry.history.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={`${getStatusColor(entry.history.fromStatus)} text-xs`}>
                          {entry.history.fromStatus}
                        </Badge>
                        <span className="text-gray-500">→</span>
                        <Badge className={`${getStatusColor(entry.history.toStatus)} text-xs`}>
                          {entry.history.toStatus}
                        </Badge>
                      </div>
                      {entry.history.notes && (
                        <p className="text-sm text-gray-300 mb-2">{entry.history.notes}</p>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {entry.user && <span>by {entry.user.name || entry.user.email}</span>}
                        <span>•</span>
                        <span>{new Date(entry.history.changedAt).toLocaleString()}</span>
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
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

            <div className="space-y-2">
              {permitData.status === "PENDING" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={actionLoading}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-800 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Submit Permit?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        This will submit the permit for approval. You can still make changes if rejected.
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

              {permitData.status === "SUBMITTED" && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={actionLoading}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Approve Permit?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          This will mark the permit as approved. This action can be audited.
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
                        disabled={actionLoading}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Reject Permit?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          This will reject the permit. The submitter can make changes and resubmit.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleStatusTransition("REJECTED", "Permit rejected - please review")}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              <Separator className="bg-gray-700" />

              <Button
                variant="outline"
                className="w-full border-gray-700"
                onClick={() => router.push(`/permits/${permitId}/edit`)}
              >
                Edit Permit
              </Button>
            </div>
          </Card>

          {/* Related Tasks */}
          {tasks.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Related Tasks</h3>
              <div className="space-y-2">
                {tasks.map((taskItem: any) => (
                  <Link
                    key={taskItem.task.id}
                    href={`/tasks/${taskItem.task.id}`}
                    className="block p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-green-500/50 transition-colors"
                  >
                    <p className="text-sm text-white">{taskItem.task.title}</p>
                    {taskItem.assignee && (
                      <p className="text-xs text-gray-500 mt-1">
                        Assigned to {taskItem.assignee.name}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
