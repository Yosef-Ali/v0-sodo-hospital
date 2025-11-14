"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/components/pages/tasks-page"

interface TaskFormData {
  id?: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  assignee: string
  category: string
}

interface TaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: TaskFormData) => void
  task?: TaskFormData | null
}

export function TaskSheet({ open, onOpenChange, onSubmit, task }: TaskSheetProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    assignee: "",
    category: "",
  })

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setFormData({
        id: task.id,
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        dueDate: task.dueDate || new Date().toISOString().split("T")[0],
        assignee: task.assignee || "",
        category: task.category || "",
      })
    } else {
      // Reset for create mode
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: new Date().toISOString().split("T")[0],
        assignee: "",
        category: "",
      })
    }
  }, [task, open])

  // Predefined options
  const categories = [
    { value: "work_permit", label: "Work Permit" },
    { value: "residence_id", label: "Residence ID" },
    { value: "license", label: "Professional License" },
    { value: "document_verification", label: "Document Verification" },
    { value: "interview", label: "Interview" },
    { value: "onboarding", label: "Onboarding" },
  ]

  const quickTitles: Record<string, string[]> = {
    work_permit: [
      "Review Work Permit Application",
      "Submit Work Permit Documents",
      "Follow up on Work Permit Status",
      "Renew Work Permit",
    ],
    residence_id: [
      "Review Residence ID Application",
      "Submit Residence ID Documents",
      "Follow up on Residence ID Status",
      "Renew Residence ID",
    ],
    license: [
      "Review License Application",
      "Submit License Documents",
      "Schedule License Exam",
      "Renew Professional License",
    ],
    document_verification: [
      "Verify Educational Certificates",
      "Verify Employment Contract",
      "Verify Health Certificate",
      "Verify Passport Copy",
    ],
    interview: [
      "Conduct Candidate Interview",
      "Conduct Exit Interview",
      "Conduct Performance Review",
    ],
    onboarding: [
      "Prepare Onboarding Materials",
      "Conduct Orientation Session",
      "Complete HR Paperwork",
    ],
  }

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

  const isEditMode = !!task

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditMode
              ? "Update the task details below."
              : "Fill in the details below. Use dropdowns for quick selection."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300">
              Category *
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
                Task Title *
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
              required
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="in-progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                  <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-gray-300">
                Priority *
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              required
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee" className="text-gray-300">
              Assignee *
            </Label>
            <Select
              value={formData.assignee}
              onValueChange={(value) => setFormData({ ...formData, assignee: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select assignee" />
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
              disabled={!formData.category || !formData.title || !formData.description || !formData.assignee}
            >
              {isEditMode ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
