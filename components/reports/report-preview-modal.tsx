"use client"

import React, { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Loader2, Printer, X } from "lucide-react"
import { ReportTemplateA4, type ReportData } from "./report-template-a4"
import { exportReportToPDF } from "@/lib/utils/pdf-export"
import { useReactToPrint } from "react-to-print"

interface ReportPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportData
  sampleData?: any
}

export function ReportPreviewModal({
  open,
  onOpenChange,
  report,
  sampleData,
}: ReportPreviewModalProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `${report.title} - Report`,
  })

  const handleExportPDF = async () => {
    if (!reportRef.current) return

    setIsExporting(true)
    try {
      await exportReportToPDF(reportRef.current, report.title)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 bg-gray-900 border-gray-700">
        <DialogHeader className="p-6 pb-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl text-white">{report.title}</DialogTitle>
              <DialogDescription className="text-gray-400 mt-1">
                Preview the report before downloading or printing
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={isExporting}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-auto p-6" style={{ maxHeight: "calc(95vh - 120px)" }}>
          <div className="flex justify-center">
            <div className="shadow-2xl">
              <ReportTemplateA4 ref={reportRef} report={report} sampleData={sampleData} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
