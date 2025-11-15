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
  category: string
  personId: string
  dueDate: string
  checklistId?: string
  notes: string
}

interface PermitSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (permit: PermitFormData) => void
  permit?: PermitFormData | null
  people?: Array<{ id: string; firstName: string; lastName: string; email: string }>
}

export function PermitSheet({ open, onOpenChange, onSubmit, permit, people = [] }: PermitSheetProps) {
  const [formData, setFormData] = useState<PermitFormData>({
    category: "",
    personId: "",
    dueDate: "",
    checklistId: "",
    notes: "",
  })

  // Populate form when editing
  useEffect(() => {
    if (permit) {
      setFormData({
        id: permit.id,
        category: permit.category || "",
        personId: permit.personId || "",
        dueDate: permit.dueDate || "",
        checklistId: permit.checklistId || "",
        notes: permit.notes || "",
      })
    } else {
      // Reset for create mode - set default due date to 30 days from now
      const defaultDueDate = new Date()
      defaultDueDate.setDate(defaultDueDate.getDate() + 30)

      setFormData({
        category: "",
        personId: "",
        dueDate: defaultDueDate.toISOString().split('T')[0],
        checklistId: "",
        notes: "",
      })
    }
  }, [permit, open])

  // Predefined options
  const categories = [
    { value: "WORK_PERMIT", label: "Work Permit" },
    { value: "RESIDENCE_ID", label: "Residence ID" },
    { value: "LICENSE", label: "MOH License" },
    { value: "PIP", label: "Product Import Permit (PIP)" },
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
              onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                {people.length > 0 ? (
                  people.map((person) => (
                    <SelectItem key={person.id} value={person.id} className="text-white">
                      {person.firstName} {person.lastName} ({person.email})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled className="text-gray-500">
                    No people available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-gray-300">
              Due Date *
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-500">
              Target completion date for this permit (default: 30 days from today)
            </p>
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
              placeholder="Add any additional notes or requirements for this permit"
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
            />
          </div>

          {/* Ticket Number Info */}
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-300">
              ✓ A unique ticket number will be automatically generated upon creation
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Format: {formData.category ? formData.category.substring(0, 3).toUpperCase() : "XXX"}-2025-####
            </p>
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
              disabled={!formData.category || !formData.personId || !formData.dueDate}
            >
              {isEditMode ? "Update Permit" : "Create Permit"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
