import { getReportById } from "@/lib/actions/v2/reports"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { FileBarChart, Download, RefreshCw, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ReportDetailActions } from "@/components/reports/report-detail-actions"
import { ReportSidebarActions } from "@/components/reports/report-sidebar-actions"
import { MarkdownDisplay } from "@/components/ui/markdown-display"

interface ReportPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params

  const getCachedReport = unstable_cache(
    async (reportId: string) => {
      const result = await getReportById(reportId)
      return result.success ? result.data : null
    },
    [`report-${id}`],
    { revalidate: 60, tags: [`report-${id}`] }
  )

  const report = await getCachedReport(id)

  if (!report) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      GENERATED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      PUBLISHED: "bg-green-500/20 text-green-300 border-green-500/30",
      ARCHIVED: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    }
    return colors[status as keyof typeof colors] || colors.DRAFT
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/reports">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{report.title}</h1>
              <Badge className={`${getStatusColor(report.status)} border`}>
                {report.status}
              </Badge>
            </div>
            <div className="text-gray-400">
               <MarkdownDisplay content={report.description || "No description provided"} />
            </div>
          </div>

          <ReportDetailActions report={report} reportId={id} />
        </div>
      </div>

      {/* Report Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileBarChart className="h-5 w-5 mr-2" />
              Report Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Category</p>
                <p className="text-white">{report.category || "N/A"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Department</p>
                <p className="text-white">{report.department || "N/A"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Frequency</p>
                <p className="text-white">{report.frequency}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Format</p>
                <p className="text-white">{report.format}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Last Generated</p>
                <p className="text-white">{formatDate(report.lastGenerated)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <Badge className={`${getStatusColor(report.status)} border`}>
                  {report.status}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Description */}
          {report.description && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
              <MarkdownDisplay content={report.description} />
            </Card>
          )}

          {/* File Information */}
          {report.fileUrl && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Generated File</h2>
              <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div>
                  <p className="text-white font-medium">{report.title}.{report.format.toLowerCase()}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {report.fileSize ? `${(report.fileSize / 1024 / 1024).toFixed(2)} MB` : "Size unknown"}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={report.fileUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Created</span>
                <span className="text-sm text-white">{formatDate(report.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Last Updated</span>
                <span className="text-sm text-white">{formatDate(report.updatedAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Last Generated</span>
                <span className="text-sm text-white">{formatDate(report.lastGenerated)}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
            <ReportSidebarActions report={report} reportId={id} />
          </Card>
        </div>
      </div>
    </div>
  )
}
