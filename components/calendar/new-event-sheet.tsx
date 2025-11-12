"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

interface NewEventSheetProps {
  selectedDate?: Date
}

export function NewEventSheet({ selectedDate }: NewEventSheetProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
    time: "",
    relatedTo: "",
    relatedItem: "",
    notes: "",
  })

  const eventTypes = [
    { value: "permit", label: "Permit Review" },
    { value: "deadline", label: "Deadline" },
    { value: "meeting", label: "Meeting" },
    { value: "interview", label: "Interview" },
    { value: "training", label: "Training" },
  ]

  const quickTitles = {
    permit: [
      "Work Permit Review",
      "Residence ID Review",
      "License Application Review",
      "Permit Renewal",
      "Document Verification",
    ],
    deadline: [
      "Permit Expiry Deadline",
      "Document Submission Deadline",
      "Application Deadline",
      "Renewal Deadline",
    ],
    meeting: [
      "Team Meeting",
      "HR Review Meeting",
      "Department Meeting",
      "One-on-One Meeting",
      "Status Update Meeting",
    ],
    interview: [
      "Candidate Interview",
      "Exit Interview",
      "Performance Review",
    ],
    training: [
      "Onboarding Session",
      "Compliance Training",
      "Skills Workshop",
    ],
  }

  const times = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
  ]

  // Sample people - you can fetch from database
  const people = [
    { value: "person1", label: "Dr. Sarah Johnson" },
    { value: "person2", label: "Nurse Maria Garcia" },
    { value: "person3", label: "Dr. Ahmed Hassan" },
    { value: "person4", label: "Admin John Doe" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Event created:", formData)
    // TODO: Save to database
    setOpen(false)
    // Reset form
    setFormData({
      title: "",
      type: "",
      date: "",
      time: "",
      relatedTo: "",
      relatedItem: "",
      notes: "",
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">Create New Event</SheetTitle>
          <SheetDescription className="text-gray-400">
            Fill in the details below. Use dropdowns for quick selection.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-gray-300">
              Event Type *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value, title: "" })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Title Selection (based on type) */}
          {formData.type && (
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Event Title *
              </Label>
              <Select
                value={formData.title}
                onValueChange={(value) => setFormData({ ...formData, title: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select or type custom title" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {quickTitles[formData.type as keyof typeof quickTitles]?.map((title) => (
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-gray-300">
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-gray-300">
              Time *
            </Label>
            <Select
              value={formData.time}
              onValueChange={(value) => setFormData({ ...formData, time: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all-day" className="text-white">
                  All Day
                </SelectItem>
                {times.map((time) => (
                  <SelectItem key={time} value={time} className="text-white">
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Related Person */}
          <div className="space-y-2">
            <Label htmlFor="relatedItem" className="text-gray-300">
              Related Person (Optional)
            </Label>
            <Select
              value={formData.relatedItem}
              onValueChange={(value) => setFormData({ ...formData, relatedItem: value })}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-300">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details..."
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.type || !formData.title || !formData.date || !formData.time}
            >
              Create Event
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
