"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PermitFormData {
  id?: string
  title: string
  category: string
  status: string
  personId: string
  issueDate: string
  expiryDate: string
  permitNumber: string
  notes: string
}

interface PermitSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (permit: PermitFormData) => void
  permit?: PermitFormData | null
}

export function PermitSheet({ open, onOpenChange, onSubmit, permit }: PermitSheetProps) {
  const [formData, setFormData] = useState<PermitFormData>({
    title: "",
    category: "",
    status: "pending",
    personId: "",
    issueDate: "",
    expiryDate: "",
    permitNumber: "",
    notes: "",
  })

  // Populate form when editing
  useEffect(() => {
    if (permit) {
      setFormData({
        id: permit.id,
        title: permit.title || "",
        category: permit.category || "",
        status: permit.status || "pending",
        personId: permit.personId || "",
        issueDate: permit.issueDate || "",
        expiryDate: permit.expiryDate || "",
        permitNumber: permit.permitNumber || "",
        notes: permit.notes || "",
      })
    } else {
      // Reset for create mode
      setFormData({
        title: "",
        category: "",
        status: "pending",
        personId: "",
        issueDate: "",
        expiryDate: "",
        permitNumber: "",
        notes: "",
      })
    }
  }, [permit, open])

  // Predefined options
  const categories = [
    { value: "WORK_PERMIT", label: "Work Permit" },
    { value: "RESIDENCE_ID", label: "Residence ID" },
    { value: "LICENSE", label: "Professional License" },
    { value: "PIP", label: "PIP (Practice ID)" },
  ]

  const quickTitles: Record<string, string[]> = {
    WORK_PERMIT: [
      "Work Permit - New Application",
      "Work Permit - Renewal",
      "Work Permit - Extension",
      "Temporary Work Authorization",
    ],
    RESIDENCE_ID: [
      "Residence ID - New Application",
      "Residence ID - Renewal",
      "Permanent Residence Application",
      "Temporary Residence Permit",
    ],
    LICENSE: [
      "Medical License - New",
      "Medical License - Renewal",
      "Nursing License - New",
      "Nursing License - Renewal",
      "Specialist License",
    ],
    PIP: [
      "PIP - New Application",
      "PIP - Renewal",
      "PIP - Update",
    ],
  }

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "approved", label: "Approved" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "rejected", label: "Rejected" },
  ]

  // Sample people - you can fetch from database
  const people = [
    { value: "person1", label: "Dr. Sarah Johnson" },
    { value: "person2", label: "Nurse Maria Garcia" },
    { value: "person3", label: "Dr. Ahmed Hassan" },
    { value: "person4", label: "Admin John Doe" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  const isEditMode = !!permit

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">
            {isEditMode ? "Edit Permit" : "Create New Permit"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode
              ? "Update the permit details below."
              : "Fill in the permit details below. Use dropdowns for quick selection."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300">
              Permit Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value, title: "" })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-white">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Title Selection (based on category) */}
          {formData.category && (
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Permit Title *
              </Label>
              <Select
                value={formData.title}
                onValueChange={(value) => setFormData({ ...formData, title: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select or type custom title" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {quickTitles[formData.category]?.map((title) => (
                    <SelectItem key={title} value={title} className="text-white">
                      {title}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-white">
                    + Custom Title
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Custom title input */}
              {formData.title === "custom" && (
                <Input
                  placeholder="Enter custom title"
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              )}
            </div>
          )}

          {/* Person */}
          <div className="space-y-2">
            <Label htmlFor="personId" className="text-gray-300">
              Assign to Person *
            </Label>
            <Select
              value={formData.personId}
              onValueChange={(value) => setFormData({ ...formData, personId: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {people.map((person) => (
                  <SelectItem key={person.value} value={person.value} className="text-white">
                    {person.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permit Number */}
          <div className="space-y-2">
            <Label htmlFor="permitNumber" className="text-gray-300">
              Permit Number
            </Label>
            <Input
              id="permitNumber"
              name="permitNumber"
              value={formData.permitNumber}
              onChange={handleChange}
              placeholder="Enter permit number (if known)"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-300">
              Status *
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-white">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate" className="text-gray-300">
                Issue Date
              </Label>
              <Input
                id="issueDate"
                name="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={handleChange}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-gray-300">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-300">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes or requirements"
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.category || !formData.title || !formData.personId}
            >
              {isEditMode ? "Update Permit" : "Create Permit"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
