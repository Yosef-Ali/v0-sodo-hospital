"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react"
import { formatEC, gregorianToEC } from "@/lib/dates/ethiopian"
import { useRouter } from "next/navigation"
import { PermitSheet } from "@/components/sheets/permit-sheet"

type PermitCategory = "WORK_PERMIT" | "RESIDENCE_ID" | "LICENSE" | "PIP"
type PermitStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "EXPIRED"

interface PermitsPageProps {
  initialData: {
    permits: any[]
    stats: any
  }
}

export function PermitsPage({ initialData }: PermitsPageProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const [permits] = useState<any[]>(initialData.permits)
  const [stats] = useState<any>(initialData.stats)
  const [categoryFilter, setCategoryFilter] = useState<PermitCategory | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<PermitStatus | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedPermit, setSelectedPermit] = useState<any>(null)

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

  const translateWithFallback = (key: string, fallback: string) => {
    const value = t(key)
    return !value || value === key ? fallback : value
  }

  const handleCreatePermit = (permitData: any) => {
    if (permitData.id) {
      // Edit mode
      console.log("Update permit data:", permitData)
      // TODO: Call updatePermit API action
    } else {
      // Create mode
      console.log("New permit data:", permitData)
      // TODO: Call createPermit API action
    }
    // After successful operation, refresh the page
    router.refresh()
    setSelectedPermit(null)
  }

  const handleEditPermit = (permit: any) => {
    setSelectedPermit(permit)
    setSheetOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedPermit(null)
    setSheetOpen(true)
  }

  const pageTitle = translateWithFallback("permit.permits", "Permits")
  const createButtonText = translateWithFallback("permit.createPermit", "Create Permit")

  const filteredPermits = permits.filter((item) => {
    const permit = item.permit
    const person = item.person

    if (categoryFilter !== "ALL" && permit.category !== categoryFilter) {
      return false
    }

    if (statusFilter !== "ALL" && permit.status !== statusFilter) {
      return false
    }

    if (searchQuery) {
      const searchValue = `${person?.firstName ?? ""} ${person?.lastName ?? ""} ${getCategoryLabel(permit.category)}`.toLowerCase()
      if (!searchValue.includes(searchQuery.toLowerCase())) {
        return false
      }
    }

    return true
  })

  return (
    <div className="p-8">
      <PageHeader
        title={pageTitle}
        description="Manage work permits, residence IDs, licenses, and import permits"
      />

      <div className="mt-[200px] mb-12 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as PermitStatus | "ALL")} className="w-full md:w-auto">
          <TabsList className="bg-gray-800 border border-gray-700 w-full md:w-auto grid grid-cols-6 gap-2">
              <TabsTrigger value="ALL" className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                All
                <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">
                  {stats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="PENDING" className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Pending
                <Badge className="ml-1 bg-yellow-500/20 text-yellow-300 text-xs border border-yellow-500/30">
                  {stats.byStatus?.PENDING || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="SUBMITTED" className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Submitted
                <Badge className="ml-1 bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                  {stats.byStatus?.SUBMITTED || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="APPROVED" className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Approved
                <Badge className="ml-1 bg-green-500/20 text-green-300 text-xs border border-green-500/30">
                  {stats.byStatus?.APPROVED || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="REJECTED" className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Rejected
                <Badge className="ml-1 bg-red-500/20 text-red-300 text-xs border border-red-500/30">
                  {stats.byStatus?.REJECTED || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="EXPIRED" className="text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Expired
                <Badge className="ml-1 bg-gray-500/20 text-gray-300 text-xs border border-gray-500/30">
                  {stats.byStatus?.EXPIRED || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <Input
                placeholder="Search permits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-gray-300"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-sm font-normal border-gray-700 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700 text-gray-300"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <Button
              onClick={handleCreateNew}
              className="text-sm font-normal bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
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
      </div>

      {/* Empty State */}
      {filteredPermits.length === 0 && (
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
            {createButtonText}
          </Button>
        </div>
      )}

      {/* Permits Grid */}
      {filteredPermits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPermits.map((item) => {
            const permit = item.permit
            const person = item.person
            const checklist = item.checklist
            const dueDate = formatDueDate(permit.dueDate, permit.dueDateEC)

            return (
              <div
                key={permit.id}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col"
              >
                <div className="p-5 flex-1">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-gray-700 p-2 rounded-md">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <Badge className={`${getStatusColor(permit.status)} text-xs flex items-center gap-1`}>
                      {getStatusIcon(permit.status)}
                      {t(`permit.${permit.status.toLowerCase()}`) || permit.status}
                    </Badge>
                  </div>

                  <h3 className="font-medium text-lg mb-2 text-white">
                    {getCategoryLabel(permit.category)}
                  </h3>
                  {person && (
                    <p className="text-sm text-gray-400 mb-4">
                      {person.firstName} {person.lastName}
                    </p>
                  )}

                  {/* Details */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {dueDate && (
                      <div className="flex justify-between">
                        <span>Due Date:</span>
                        <span className="text-gray-400">{dueDate.ec}</span>
                      </div>
                    )}
                    {checklist && (
                      <div className="flex justify-between">
                        <span>Checklist:</span>
                        <span className="text-gray-400 truncate ml-2">{checklist.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="text-gray-400">{new Date(permit.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
                  <button
                    onClick={() => router.push(`/permits/${permit.id}`)}
                    className="text-xs text-green-400 hover:text-green-300 font-medium"
                  >
                    View Permit
                  </button>
                  <button
                    onClick={() => handleEditPermit(permit)}
                    className="text-xs text-gray-400 hover:text-gray-300 font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Permit Sheet */}
      <PermitSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={handleCreatePermit}
        permit={selectedPermit}
      />
    </div>
  )
}
