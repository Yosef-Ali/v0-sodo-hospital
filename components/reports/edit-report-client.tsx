"use client"

import { ReportForm, type ReportFormData } from "@/components/reports/report-form"
import { updateReport } from "@/lib/actions/v2/reports"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditReportClientProps {
  report: any // Type from DB schema
}

export function EditReportClient({ report }: EditReportClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ReportFormData) => {
    setIsLoading(true)
    try {
      const result = await updateReport(report.id, {
        title: data.title,
        description: data.description,
        status: data.status as any,
        frequency: data.frequency as any,
        format: data.format as any,
        department: data.department,
        category: data.category,
      })

      if (result.success) {
        toast.success("Report updated successfully")
        router.push(`/reports/${report.id}`)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update report")
      }
    } catch (error) {
      console.error("Error updating report:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4 pl-0 hover:bg-transparent text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Report
        </Button>
        <h1 className="text-2xl font-bold text-white">Edit Report</h1>
        <p className="text-gray-400">Update report details and settings.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <ReportForm
          initialData={{
            id: report.id,
            title: report.title,
            description: report.description || "",
            status: report.status,
            frequency: report.frequency,
            format: report.format,
            department: report.department || "",
            category: report.category || "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={isLoading}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}
