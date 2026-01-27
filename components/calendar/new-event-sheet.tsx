"use client"

import { useState, useEffect } from "react"
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
import { Plus, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createCalendarEvent } from "@/lib/actions/v2/calendar-events"
import { toast } from "sonner"

interface NewEventSheetProps {
  selectedDate?: Date
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewEventSheet({ selectedDate, open: controlledOpen, onOpenChange }: NewEventSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTitleOpen, setIsTitleOpen] = useState(false)
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
    time: "",
    relatedTo: "",
    relatedItem: "",
    notes: "",
  })

  // Update form data when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split("T")[0]
      }))
    }
  }, [selectedDate])

  const eventTypes = [
    { value: "permit", label: "Permit Review" },
    { value: "deadline", label: "Deadline" },
    { value: "meeting", label: "Meeting" },
    { value: "interview", label: "Interview" },
    { value: "training", label: "Training" },
    { value: "other", label: "Other" },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Parse the date and time
      const startDate = new Date(formData.date)
      const allDay = formData.time === "all-day"

      // Create the event data
      const eventData = {
        title: formData.title,
        description: formData.notes || null,
        type: formData.type as "permit" | "deadline" | "meeting" | "interview" | "other",
        startDate,
        endDate: null, // For now, single time slot events
        startTime: allDay ? null : formData.time,
        endTime: null,
        allDay,
        location: null,
        relatedPersonId: formData.relatedItem || null,
        relatedPermitId: null,
        createdBy: null, // TODO: Add user ID from auth
      }

      const result = await createCalendarEvent(eventData)

      if (result.success) {
        toast.success("Event created successfully!")
        setOpen(false)
        // Reset form
        setFormData({
          title: "",
          type: "",
          date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
          time: "",
          relatedTo: "",
          relatedItem: "",
          notes: "",
        })
      } else {
        toast.error(result.error || "Failed to create event")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
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
              
              <Popover open={isTitleOpen} onOpenChange={setIsTitleOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isTitleOpen}
                    className="w-full justify-between bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:text-white"
                  >
                    {formData.title && quickTitles[formData.type as keyof typeof quickTitles]?.includes(formData.title)
                      ? formData.title
                      : formData.title ? formData.title : "Select or type custom title..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-gray-700 border-gray-600">
                  <Command className="bg-gray-700 text-white">
                    <CommandInput placeholder="Search or type new title..." className="text-white placeholder:text-gray-400" />
                    <CommandList>
                      <CommandEmpty className="py-2 px-4 text-sm text-gray-400">
                         No preset found. Type custom title.
                      </CommandEmpty>
                      <CommandGroup heading="Suggestions">
                        {quickTitles[formData.type as keyof typeof quickTitles]?.map((title) => (
                          <CommandItem
                            key={title}
                            value={title}
                            onSelect={(currentValue) => {
                              setFormData({ ...formData, title: currentValue })
                              setIsTitleOpen(false)
                            }}
                            className="text-white hover:bg-gray-600 aria-selected:bg-gray-600 aria-selected:text-white"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.title === title ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup heading="Custom">
                          <CommandItem
                            value="custom-title-option"
                            onSelect={() => {
                              setFormData({ ...formData, title: "" }) // Clear to show input
                              setIsTitleOpen(false)
                            }}
                            className="text-green-400 hover:bg-gray-600 aria-selected:bg-gray-600 aria-selected:text-green-400 font-medium"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Write custom title...
                          </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Custom title input: Show if title is not in presets or is explicitly cleared for custom entry */}
              {(!quickTitles[formData.type as keyof typeof quickTitles]?.includes(formData.title) || formData.title === "") && (
                 <div className="mt-2 transition-all duration-200">
                    {formData.title && !quickTitles[formData.type as keyof typeof quickTitles]?.includes(formData.title) && (
                         <Label className="text-xs text-green-400 mb-1.5 block">Custom Title Selected:</Label>
                    )}
                    <Input
                      value={formData.title}
                      placeholder="Enter custom title"
                      className="bg-gray-700 border-gray-600 text-white"
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      autoFocus={!quickTitles[formData.type as keyof typeof quickTitles]?.includes(formData.title)}
                    />
                 </div>
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.type || !formData.title || !formData.date || !formData.time || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
