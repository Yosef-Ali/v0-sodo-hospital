"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface VehicleTaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: any) => void
  task?: any
}

export function VehicleTaskSheet({ open, onOpenChange, onSubmit, task }: VehicleTaskSheetProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "pending",
    dueDate: new Date().toISOString().split("T")[0],
    assignee: "",
    vehicleInfo: "",
    plateNumber: "",
    documents: [] as string[],
  })

  useEffect(() => {
    if (task) {
      setFormData({ ...task, documents: task.documents || [] })
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        status: "pending",
        dueDate: new Date().toISOString().split("T")[0],
        assignee: "",
        vehicleInfo: "",
        plateNumber: "",
        documents: [],
      })
    }
  }, [task, open])

  // Document checklists per category
  const documentChecklists: Record<string, { label: string; required: boolean }[]> = {
    inspection: [
      { label: "Libre (Vehicle Registration)", required: true },
      { label: "Previous Inspection Result", required: false },
    ],
    road_fund: [
      { label: "Libre", required: true },
      { label: "Bank Slip", required: true },
      { label: "Delegation with ID", required: true },
    ],
    insurance: [
      { label: "Libre", required: true },
      { label: "Bank Slip (Road Fund)", required: true },
      { label: "Insurance Policy", required: true },
      { label: "Road Fund Receipt", required: true },
      { label: "Delegation with ID", required: true },
    ],
    road_transport: [
      { label: "Inspection Result", required: true },
      { label: "Insurance Certificate", required: true },
      { label: "Road Fund Receipt", required: true },
      { label: "Libre", required: true },
      { label: "Delegation with ID", required: true },
    ],
  }

  const assignees = [
    { value: "nicco", label: "Niccodimos Ezechiel" },
    { value: "bethel", label: "Bethel Ayalew" },
    { value: "kalkidan", label: "Kalkidan Folli" },
  ]

  const quickTitles: Record<string, string[]> = {
    inspection: [
      "Annual Vehicle Inspection",
      "Pre-Registration Inspection",
      "Accident Damage Inspection",
    ],
    road_fund: [
      "Quarterly Road Fund Payment",
      "Annual Road Fund Payment",
      "Road Fund Renewal",
    ],
    insurance: [
      "Comprehensive Insurance Renewal",
      "Third Party Insurance",
      "Insurance Claim Processing",
    ],
    road_transport: [
      "Road Transport Permit Application",
      "Road Transport Permit Renewal",
      "Route Authorization",
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
            {isEditMode ? "Edit Vehicle Task" : "Create Vehicle Task"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode ? "Update the vehicle task details." : "Fill in the details for the new vehicle task."}
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
                <SelectItem value="inspection" className="text-white">Inspection</SelectItem>
                <SelectItem value="road_fund" className="text-white">Road Fund</SelectItem>
                <SelectItem value="insurance" className="text-white">Insurance</SelectItem>
                <SelectItem value="road_transport" className="text-white">Road Transport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Title */}
          {formData.category && (
            <div className="space-y-2">
              <Label className="text-gray-300">Task Title *</Label>
              <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
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
                <Input placeholder="Enter custom title" className="bg-gray-700 border-gray-600 text-white mt-2"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              )}
            </div>
          )}

          {/* Vehicle Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Vehicle Info</Label>
              <Input value={formData.vehicleInfo} onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
                placeholder="e.g. Toyota Ambulance" className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Plate Number</Label>
              <Input value={formData.plateNumber} onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="e.g. AA-12345" className="bg-gray-700 border-gray-600 text-white" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description" className="bg-gray-700 border-gray-600 text-white min-h-[80px]" />
          </div>

          {/* Status and Due Date */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label className="text-gray-300">Due Date</Label>
              <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white" />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="text-gray-300">Assignee</Label>
            <Select value={formData.assignee} onValueChange={(value) => setFormData({ ...formData, assignee: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Select assignee" /></SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {assignees.map((a) => (<SelectItem key={a.value} value={a.label} className="text-white">{a.label}</SelectItem>))}
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
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600">Cancel</Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={!formData.category || !formData.title}>
              {isEditMode ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
