"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Task } from "@/components/pages/tasks-page"

interface TaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: Omit<Task, "id" | "createdAt">) => void
}

export function TaskSheet({ open, onOpenChange, onSubmit }: TaskSheetProps) {
  const [formData, setFormData] = useState<Omit<Task, "id" | "createdAt">>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    assignee: "",
    category: "",
  })
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setFormData((prev) => ({ ...prev, dueDate: format(date, "yyyy-MM-dd") }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)

    // Reset form
    setFormData({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      assignee: "",
      category: "",
    })
    setCurrentStep(1)
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.title.trim() !== "" && formData.description.trim() !== ""
    }
    if (currentStep === 2) {
      return formData.status !== "" && formData.priority !== "" && formData.dueDate !== ""
    }
    if (currentStep === 3) {
      return formData.assignee.trim() !== "" && formData.category.trim() !== ""
    }
    return true
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white">Create New Task</SheetTitle>
          <SheetDescription className="text-gray-400">
            Step {currentStep} of {totalSteps}:{" "}
            {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Task Details" : "Assignment"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6 relative z-10">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter task description"
                  className="bg-gray-700 border-gray-600 min-h-[100px]"
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 hover:bg-gray-600",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-700 border-gray-600">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                      className="bg-gray-700 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  placeholder="Enter assignee name"
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter category"
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="bg-transparent border-gray-600 hover:bg-gray-800/50 hover:border-gray-500 text-gray-300"
              >
                Previous
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:shadow-none disabled:from-gray-700 disabled:to-gray-700"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:shadow-none disabled:from-gray-700 disabled:to-gray-700"
              >
                Create Task
              </Button>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    currentStep > index
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                      : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
