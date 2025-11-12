"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react"
import { getPermits, getPermitStats } from "@/lib/actions/v2/permits"
import { formatEC, gregorianToEC } from "@/lib/dates/ethiopian"
import Link from "next/link"
import { useRouter } from "next/navigation"

type PermitCategory = "WORK_PERMIT" | "RESIDENCE_ID" | "LICENSE" | "PIP"
type PermitStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "EXPIRED"

export function PermitsPage() {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const [permits, setPermits] = useState<any[]>([])
  const [stats, setStats] = useState<any>({ total: 0, byStatus: {}, byCategory: {} })
  const [categoryFilter, setCategoryFilter] = useState<PermitCategory | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<PermitStatus | "ALL">("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPermits()
    loadStats()
  }, [categoryFilter, statusFilter])

  const loadPermits = async () => {
    setLoading(true)
    setError(null)

    const filters: any = {}
    if (categoryFilter !== "ALL") filters.category = categoryFilter
    if (statusFilter !== "ALL") filters.status = statusFilter

    const result = await getPermits(filters)
    if (result.success) {
      setPermits(result.data)
    } else {
      setError(result.error || "Failed to load permits")
    }

    setLoading(false)
  }

  const loadStats = async () => {
    const result = await getPermitStats()
    if (result.success) {
      setStats(result.data)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "SUBMITTED":
        return <AlertCircle className="h-4 w-4" />
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />
      case "REJECTED":
        return <XCircle className="h-4 w-4" />
      case "EXPIRED":
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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
      const ec = dueDateEC ? dueDateEC : formatEC(gregorianToEC(date), i18n.language as "en" | "am", "short")

      return {
        ec,
        gregorian: date.toLocaleDateString(),
      }
    } catch {
      return null
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title={t("permit.permits") || "Permits"}
          description="Manage work permits, residence IDs, licenses, and import permits"
        />

        <Button
          onClick={() => router.push("/permits/new")}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("permit.createPermit") || "Create Permit"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{t("common.total")}</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div>
            <p className="text-sm text-gray-400">{t("permit.pending")}</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.byStatus.PENDING || 0}</p>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div>
            <p className="text-sm text-gray-400">{t("permit.submitted")}</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.byStatus.SUBMITTED || 0}</p>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div>
            <p className="text-sm text-gray-400">{t("permit.approved")}</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.byStatus.APPROVED || 0}</p>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div>
            <p className="text-sm text-gray-400">{t("permit.rejected")}</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{stats.byStatus.REJECTED || 0}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as any)}
        >
          <SelectTrigger className="w-[200px] bg-gray-800/60 backdrop-blur-sm border-gray-700 text-gray-300">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="ALL" className="text-gray-300">All Categories</SelectItem>
            <SelectItem value="WORK_PERMIT" className="text-gray-300">Work Permit</SelectItem>
            <SelectItem value="RESIDENCE_ID" className="text-gray-300">Residence ID</SelectItem>
            <SelectItem value="LICENSE" className="text-gray-300">License</SelectItem>
            <SelectItem value="PIP" className="text-gray-300">PIP</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as any)}
        >
          <SelectTrigger className="w-[200px] bg-gray-800/60 backdrop-blur-sm border-gray-700 text-gray-300">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="ALL" className="text-gray-300">All Statuses</SelectItem>
            <SelectItem value="PENDING" className="text-gray-300">Pending</SelectItem>
            <SelectItem value="SUBMITTED" className="text-gray-300">Submitted</SelectItem>
            <SelectItem value="APPROVED" className="text-gray-300">Approved</SelectItem>
            <SelectItem value="REJECTED" className="text-gray-300">Rejected</SelectItem>
            <SelectItem value="EXPIRED" className="text-gray-300">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-400 mt-4">{t("common.loading")}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={() => loadPermits()}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && permits.length === 0 && (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 p-12 text-center">
          <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No permits found</h3>
          <p className="text-gray-400 mb-6">
            {categoryFilter !== "ALL" || statusFilter !== "ALL"
              ? "No permits match your filters."
              : "Get started by creating your first permit."}
          </p>
          <Button
            onClick={() => router.push("/permits/new")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("permit.createPermit") || "Create Permit"}
          </Button>
        </div>
      )}

      {/* Permits Grid */}
      {!loading && !error && permits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {permits.map((item) => {
            const permit = item.permit
            const person = item.person
            const checklist = item.checklist
            const dueDate = formatDueDate(permit.dueDate, permit.dueDateEC)

            return (
              <Card
                key={permit.id}
                className="bg-gray-800 border-gray-700 p-5 hover:border-green-500/50 transition-all cursor-pointer"
                onClick={() => router.push(`/permits/${permit.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-full p-2">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {getCategoryLabel(permit.category)}
                      </h3>
                      {person && (
                        <p className="text-sm text-gray-400">
                          {person.firstName} {person.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge className={`${getStatusColor(permit.status)} text-xs flex items-center gap-1`}>
                    {getStatusIcon(permit.status)}
                    {t(`permit.${permit.status.toLowerCase()}`) || permit.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  {dueDate && (
                    <div className="flex items-start text-gray-300">
                      <Clock className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{dueDate.ec}</div>
                        <div className="text-xs text-gray-500">({dueDate.gregorian})</div>
                      </div>
                    </div>
                  )}

                  {checklist && (
                    <div className="flex items-center text-gray-300">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      {checklist.name}
                    </div>
                  )}

                  {permit.notes && (
                    <div className="text-gray-400 text-xs mt-2 line-clamp-2">
                      {permit.notes}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {t("common.createdAt")}: {new Date(permit.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:text-green-300 h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/permits/${permit.id}`)
                    }}
                  >
                    {t("actions.view")} →
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
