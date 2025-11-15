"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Filter, FileBarChart } from "lucide-react"
import { ReportCard } from "@/components/ui/report-card"
import { ReportSheet } from "@/components/sheets/report-sheet"
import { getReports, createReport, updateReport, type Report } from "@/lib/actions/v2/reports"
import type { ReportStats } from "@/lib/actions/v2/reports"

interface ReportsPageProps {
  initialData: {
    reports: Report[]
    stats: ReportStats
  }
}

export function ReportsPage({ initialData }: ReportsPageProps) {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>(initialData.reports)
  const [stats, setStats] = useState(initialData.stats)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStatusTab, setActiveStatusTab] = useState<"all" | "draft" | "generated" | "published" | "archived">("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const loadReports = async (query?: string, status?: string) => {
    setLoading(true)
    setError(null)

    const result = await getReports({
      query,
      status: status === "all" ? undefined : status,
      limit: 100
    })

    if (result.success && result.data) {
      setReports(result.data as Report[])
    } else {
      setReports([])
      setError(result.error || "Failed to load reports")
    }

    setLoading(false)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    loadReports(query, activeStatusTab)
  }

  const handleStatusChange = (status: typeof activeStatusTab) => {
    setActiveStatusTab(status)
    loadReports(searchQuery, status)
  }

  const handleCreateReport = async (reportData: any) => {
    if (reportData.id) {
      // Edit mode
      const result = await updateReport(reportData.id, {
        title: reportData.title,
        description: reportData.description,
        status: reportData.status,
        frequency: reportData.frequency,
        format: reportData.format,
        department: reportData.department,
        category: reportData.category,
      })

      if (result.success) {
        await loadReports(searchQuery, activeStatusTab)
      }
    } else {
      // Create mode
      const result = await createReport({
        title: reportData.title,
        description: reportData.description,
        status: reportData.status,
        frequency: reportData.frequency,
        format: reportData.format,
        department: reportData.department,
        category: reportData.category,
      })

      if (result.success) {
        await loadReports(searchQuery, activeStatusTab)
      }
    }

    setSelectedReport(null)
  }

  const handleEditReport = (report: Report) => {
    setSelectedReport({
      id: report.id,
      title: report.title,
      description: report.description || "",
      status: report.status,
      frequency: report.frequency,
      format: report.format,
      department: report.department || "",
      category: report.category || "",
    })
    setSheetOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedReport(null)
    setSheetOpen(true)
  }

  const handleViewReport = (report: Report) => {
    router.push(`/reports/${report.id}`)
  }

  const formatLastGenerated = (date: Date | null) => {
    if (!date) return "Never"
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Reports"
        description="Create, manage, and generate analytical reports for hospital operations"
      />

      <div className="mt-8 md:mt-10 lg:mt-12 mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={activeStatusTab} onValueChange={(value) => handleStatusChange(value as any)} className="w-full md:w-auto">
            <div className="w-full overflow-x-auto">
              <TabsList className="bg-gray-800 border border-gray-700 inline-flex min-w-max gap-2 rounded-md">
                <TabsTrigger value="all" className="text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  All
                  <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="draft" className="text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  Draft
                  <Badge className="ml-1 bg-gray-500/20 text-gray-300 text-xs border border-gray-500/30">
                    {stats.draft}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="generated" className="text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  Generated
                  <Badge className="ml-1 bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                    {stats.generated}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="published" className="text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  Published
                  <Badge className="ml-1 bg-green-500/20 text-green-300 text-xs border border-green-500/30">
                    {stats.published}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="archived" className="text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  Archived
                  <Badge className="ml-1 bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">
                    {stats.archived}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
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
              Create Report
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-16 w-full mb-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={() => loadReports()}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reports.length === 0 && (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 p-12 text-center">
          <FileBarChart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No reports found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? "No reports match your search criteria."
              : "Get started by creating your first report template."}
          </p>
          <Button
            onClick={handleCreateNew}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      )}

      {/* Reports List */}
      {!loading && !error && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              title={report.title}
              description={report.description || ""}
              lastGenerated={formatLastGenerated(report.lastGenerated)}
              frequency={report.frequency}
              format={report.format}
              department={report.department || "N/A"}
              onView={() => handleViewReport(report)}
              onEdit={() => handleEditReport(report)}
            />
          ))}
        </div>
      )}

      {/* Pagination hint */}
      {reports.length >= 100 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Showing first 100 results. Use search to find specific reports.
          </p>
        </div>
      )}

      {/* Report Sheet */}
      <ReportSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={handleCreateReport}
        report={selectedReport}
      />
    </div>
  )
}
