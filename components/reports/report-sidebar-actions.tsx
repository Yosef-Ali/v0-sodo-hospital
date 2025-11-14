"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Eye, RefreshCw, Edit } from "lucide-react"
import Link from "next/link"
import { ReportPreviewModal } from "./report-preview-modal"
import type { ReportData } from "./report-template-a4"

interface ReportSidebarActionsProps {
  report: ReportData
  reportId: string
}

export function ReportSidebarActions({ report, reportId }: ReportSidebarActionsProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Report
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
        {report.fileUrl && (
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href={report.fileUrl} download>
              <Download className="h-4 w-4 mr-2" />
              Download File
            </a>
          </Button>
        )}
        <Link href={`/reports/${reportId}/edit`} className="block">
          <Button variant="outline" className="w-full justify-start">
            <Edit className="h-4 w-4 mr-2" />
            Edit Report
          </Button>
        </Link>
      </div>

      <ReportPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        report={report}
      />
    </>
  )
}
