"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReportFormData {
  id?: string
  title: string
  description: string
  status: string
  frequency: string
  format: string
  department: string
  category: string
}

interface ReportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (report: ReportFormData) => void
  report?: ReportFormData | null
}

export function ReportSheet({ open, onOpenChange, onSubmit, report }: ReportSheetProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    title: "",
    description: "",
    status: "DRAFT",
    frequency: "MONTHLY",
    format: "PDF",
    department: "",
    category: "",
  })

  // Populate form when editing
  useEffect(() => {
    if (report) {
      setFormData({
        id: report.id,
        title: report.title || "",
        description: report.description || "",
        status: report.status || "DRAFT",
        frequency: report.frequency || "MONTHLY",
        format: report.format || "PDF",
        department: report.department || "",
        category: report.category || "",
      })
    } else {
      // Reset for create mode
      setFormData({
        title: "",
        description: "",
        status: "DRAFT",
        frequency: "MONTHLY",
        format: "PDF",
        department: "",
        category: "",
      })
    }
  }, [report, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  const departments = [
    { value: "Administration", label: "Administration" },
    { value: "Finance", label: "Finance" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Quality", label: "Quality" },
    { value: "Supply Chain", label: "Supply Chain" },
    { value: "Operations", label: "Operations" },
    { value: "Pharmacy", label: "Pharmacy" },
    { value: "Facilities", label: "Facilities" },
    { value: "Compliance", label: "Compliance" },
    { value: "IT", label: "IT" },
  ]

  const categories = [
    { value: "Patient", label: "Patient Statistics" },
    { value: "Financial", label: "Financial Performance" },
    { value: "Staff", label: "Staff & HR" },
    { value: "Quality", label: "Quality Indicators" },
    { value: "Inventory", label: "Inventory & Supply" },
    { value: "Operations", label: "Operations" },
    { value: "Compliance", label: "Compliance & Regulatory" },
    { value: "Equipment", label: "Equipment & Facilities" },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{report?.id ? "Edit Report" : "Create New Report"}</SheetTitle>
          <SheetDescription>
            {report?.id ? "Update report details and configuration." : "Create a new report template for generating analytics."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Monthly Patient Statistics"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this report covers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
              required
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="GENERATED">Generated</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
                <SelectItem value="ON_DEMAND">On Demand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Format *</Label>
            <Select
              value={formData.format}
              onValueChange={(value) => setFormData({ ...formData, format: value })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="EXCEL">Excel</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
                <SelectItem value="DASHBOARD">Dashboard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {report?.id ? "Update Report" : "Create Report"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
