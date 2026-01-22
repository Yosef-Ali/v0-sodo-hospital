"use client"

import type React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ReportForm, type ReportFormData } from "@/components/reports/report-form"

interface ReportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (report: ReportFormData) => void
  report?: ReportFormData | null
}

export function ReportSheet({ open, onOpenChange, onSubmit, report }: ReportSheetProps) {
  const handleSubmit = (data: ReportFormData) => {
    onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-[500px] bg-gray-900 border-gray-800">
        <SheetHeader>
          <SheetTitle className="text-white">{report?.id ? "Edit Report" : "Create New Report"}</SheetTitle>
          <SheetDescription className="text-gray-400">
            {report?.id ? "Update report details and configuration." : "Create a new report template for generating analytics."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <ReportForm
            initialData={report}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
