"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Eye, RefreshCw, Edit } from "lucide-react"
import Link from "next/link"
import { ReportPreviewModal } from "./report-preview-modal"
import type { ReportData } from "./report-template-a4"

interface ReportDetailActionsProps {
  report: ReportData
  reportId: string
}

export function ReportDetailActions({ report, reportId }: ReportDetailActionsProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate
        </Button>
        {report.fileUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={report.fileUrl} download>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        )}
        <Link href={`/reports/${reportId}/edit`}>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit
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
