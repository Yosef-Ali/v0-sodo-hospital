"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface CompanyTaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: any) => void
  task?: any
}

export function CompanyTaskSheet({ open, onOpenChange, onSubmit, task }: CompanyTaskSheetProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stage: "document_prep",
    status: "pending",
    dueDate: new Date().toISOString().split("T")[0],
    assignee: "",
    companyName: "Soddo Christian Hospital",
    registrationType: "",
    documents: [] as string[],
  })

  useEffect(() => {
    if (task) {
      setFormData({ ...task, documents: task.documents || [] })
    } else {
      setFormData({
        title: "",
        description: "",
        stage: "document_prep",
        status: "pending",
        dueDate: new Date().toISOString().split("T")[0],
        assignee: "",
        companyName: "Soddo Christian Hospital",
        registrationType: "",
        documents: [],
      })
    }
  }, [task, open])

  const documentChecklist = [
    { label: "Official Letter", required: true },
    { label: "Business License", required: true },
    { label: "COC (Certificate of Competence)", required: true },
    { label: "Business Registration", required: true },
    { label: "TIN Number", required: true },
    { label: "Delegation with ID (Kebele & Work)", required: true },
  ]

  const assignees = [
    { value: "nicco", label: "Niccodimos Ezechiel" },
    { value: "bethel", label: "Bethel Ayalew" },
    { value: "kalkidan", label: "Kalkidan Folli" },
  ]

  const registrationTypes = [
    { value: "license_new", label: "New Business License" },
    { value: "license_renewal", label: "Business License Renewal" },
    { value: "tin_registration", label: "TIN Registration" },
    { value: "tin_update", label: "TIN Update" },
    { value: "coc_new", label: "New COC" },
    { value: "coc_renewal", label: "COC Renewal" },
    { value: "business_reg", label: "Business Registration Update" },
  ]

  const quickTitles = [
    "Business License Application",
    "Business License Renewal",
    "TIN Registration",
    "TIN Update",
    "COC Application",
    "COC Renewal",
    "Business Registration Update",
  ]

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
            {isEditMode ? "Edit Registration Task" : "Create Registration Task"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode ? "Update the registration task details." : "Fill in the details for company registration."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Registration Type */}
          <div className="space-y-2">
            <Label className="text-gray-300">Registration Type *</Label>
            <Select value={formData.registrationType} onValueChange={(value) => setFormData({ ...formData, registrationType: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {registrationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white">{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <Label className="text-gray-300">Task Title *</Label>
            <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Select title" /></SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {quickTitles.map((title) => (
                  <SelectItem key={title} value={title} className="text-white">{title}</SelectItem>
                ))}
                <SelectItem value="custom" className="text-white">+ Custom Title</SelectItem>
              </SelectContent>
            </Select>
            {formData.title === "custom" && (
              <Input placeholder="Enter custom title" className="bg-gray-700 border-gray-600 text-white mt-2"
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label className="text-gray-300">Company Name</Label>
            <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description" className="bg-gray-700 border-gray-600 text-white min-h-[80px]" />
          </div>

          {/* Stage and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Stage</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="document_prep" className="text-white">Document Preparation</SelectItem>
                  <SelectItem value="apply_online" className="text-white">Apply Online</SelectItem>
                  <SelectItem value="approval" className="text-white">Pending Approval</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="in-progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                  <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Due Date</Label>
              <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Assignee</Label>
              <Select value={formData.assignee} onValueChange={(value) => setFormData({ ...formData, assignee: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {assignees.map((a) => (<SelectItem key={a.value} value={a.label} className="text-white">{a.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Document Checklist */}
          <div className="space-y-3">
            <Label className="text-gray-300">Required Documents</Label>
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 border border-gray-600">
              {documentChecklist.map((doc) => (
                <div key={doc.label} className="flex items-center space-x-3">
                  <Checkbox id={doc.label} checked={formData.documents.includes(doc.label)}
                    onCheckedChange={(checked) => handleDocumentToggle(doc.label, checked as boolean)}
                    className="border-gray-500 data-[state=checked]:bg-green-600" />
                  <label htmlFor={doc.label} className="text-sm text-gray-300 cursor-pointer">
                    {doc.label}{doc.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600">Cancel</Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={!formData.registrationType || !formData.title}>
              {isEditMode ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
