"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface ImportTaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: any) => void
  task?: any
}

export function ImportTaskSheet({ open, onOpenChange, onSubmit, task }: ImportTaskSheetProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "pending",
    dueDate: new Date().toISOString().split("T")[0],
    assignee: "",
    documents: [] as string[],
  })

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        documents: task.documents || [],
      })
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        status: "pending",
        dueDate: new Date().toISOString().split("T")[0],
        assignee: "",
        documents: [],
      })
    }
  }, [task, open])

  // Document checklists per category
  const documentChecklists: Record<string, { label: string; required: boolean }[]> = {
    pip: [
      { label: "Support Letter from Region", required: true },
      { label: "Official Letter", required: true },
      { label: "Proforma Invoice", required: true },
      { label: "Donation Letter", required: false },
      { label: "COO (Certificate of Origin)", required: true },
      { label: "COC (Soddo)", required: true },
      { label: "COC", required: true },
    ],
    single_window: [
      { label: "PIP Certificate", required: true },
      { label: "Commercial Invoice", required: true },
      { label: "Packing List", required: true },
      { label: "Donation Letter", required: false },
      { label: "AWB-COO", required: true },
      { label: "GMP Certificate", required: true },
    ],
  }

  const assignees = [
    { value: "nicco", label: "Niccodimos Ezechiel" },
    { value: "bethel", label: "Bethel Ayalew" },
    { value: "kalkidan", label: "Kalkidan Folli" },
  ]

  const quickTitles: Record<string, string[]> = {
    pip: [
      "PIP Application - Medical Equipment",
      "PIP Application - Pharmaceutical Supplies",
      "PIP Application - Laboratory Equipment",
      "PIP Application - Donation Items",
    ],
    single_window: [
      "Single Window - Customs Declaration",
      "Single Window - Import Clearance",
      "Single Window - Pharmaceutical Import",
      "Single Window - Medical Supplies",
    ],
  }

  const handleDocumentToggle = (docLabel: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, documents: [...formData.documents, docLabel] })
    } else {
      setFormData({ ...formData, documents: formData.documents.filter((d) => d !== docLabel) })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(task ? { ...formData, id: task.id } : formData)
    onOpenChange(false)
  }

  const isEditMode = !!task

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">
            {isEditMode ? "Edit Import Task" : "Create Import Task"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode ? "Update the import task details." : "Fill in the details for the new import task."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Category */}
          <div className="space-y-2">
            <Label className="text-gray-300">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value, title: "", documents: [] })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="pip" className="text-white">Pre Import Permit (PIP)</SelectItem>
                <SelectItem value="single_window" className="text-white">Ethiopia Single Window</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Title */}
          {formData.category && (
            <div className="space-y-2">
              <Label className="text-gray-300">Task Title *</Label>
              <Select
                value={formData.title}
                onValueChange={(value) => setFormData({ ...formData, title: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select title" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {quickTitles[formData.category]?.map((title) => (
                    <SelectItem key={title} value={title} className="text-white">{title}</SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-white">+ Custom Title</SelectItem>
                </SelectContent>
              </Select>
              {formData.title === "custom" && (
                <Input
                  placeholder="Enter custom title"
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
            />
          </div>

          {/* Status and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="in-progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                  <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="text-gray-300">Assignee</Label>
            <Select
              value={formData.assignee}
              onValueChange={(value) => setFormData({ ...formData, assignee: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {assignees.map((a) => (
                  <SelectItem key={a.value} value={a.label} className="text-white">{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Checklist */}
          {formData.category && documentChecklists[formData.category] && (
            <div className="space-y-3">
              <Label className="text-gray-300">Required Documents</Label>
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 border border-gray-600">
                {documentChecklists[formData.category].map((doc) => (
                  <div key={doc.label} className="flex items-center space-x-3">
                    <Checkbox
                      id={doc.label}
                      checked={formData.documents.includes(doc.label)}
                      onCheckedChange={(checked) => handleDocumentToggle(doc.label, checked as boolean)}
                      className="border-gray-500 data-[state=checked]:bg-green-600"
                    />
                    <label htmlFor={doc.label} className="text-sm text-gray-300 cursor-pointer">
                      {doc.label}
                      {doc.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.category || !formData.title}>
              {isEditMode ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
