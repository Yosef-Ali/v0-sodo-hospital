"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NewEventSheet } from "@/components/calendar/new-event-sheet"
import { EditEventSheet } from "@/components/calendar/edit-event-sheet"
import { getCalendarEvents } from "@/lib/actions/v2/calendar-events"
import type { CalendarEvent } from "@/lib/db/schema"

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<"month" | "year">("month")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isNewEventSheetOpen, setIsNewEventSheetOpen] = useState(false)
  const [newEventDate, setNewEventDate] = useState<Date>(new Date())

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleMonthChange = (month: string) => {
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(month), 1))
  }

  const handleYearChange = (year: string) => {
    setCurrentDate(new Date(parseInt(year), currentDate.getMonth(), 1))
  }

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  const today = new Date()
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  // Fetch events for the current month
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true)
      const startDate = view === "year" 
        ? new Date(currentDate.getFullYear(), 0, 1)
        : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      
      const endDate = view === "year"
        ? new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59)
        : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

      const result = await getCalendarEvents({ startDate, endDate })
      if (result.success && result.data) {
        setEvents(result.data)
      }
      setIsLoading(false)
    }

    fetchEvents()
  }, [currentDate, view])

  const handleEventDoubleClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEditSheetOpen(true)
  }

  const handleDayCellDoubleClick = (day: number, dayEvents: CalendarEvent[]) => {
    if (dayEvents.length > 0) {
      // If there are events, edit the first one
      setSelectedEvent(dayEvents[0])
      setIsEditSheetOpen(true)
    } else {
      // If no events, create a new one for this day
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      setNewEventDate(selectedDate)
      setIsNewEventSheetOpen(true)
    }
  }

  // Group events by day
  const eventsByDay: Record<number, CalendarEvent[]> = {}
  events.forEach((event) => {
    const eventDate = new Date(event.startDate)
    const day = eventDate.getDate()
    if (!eventsByDay[day]) {
      eventsByDay[day] = []
    }
    eventsByDay[day].push(event)
  })

  const getEventColor = (type: string) => {
    switch (type) {
      case "permit":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "deadline":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "meeting":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "interview":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50 p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Title, Month/Year Selectors, and Navigation */}
          <div className="flex flex-col gap-3">
            {/* Month and Year Selectors */}
            <div className="flex items-center gap-2">
              <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[130px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[100px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600 flex-1 sm:flex-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="sm:hidden ml-1">Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600 flex-1 sm:flex-none"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600 flex-1 sm:flex-none"
              >
                <ChevronRight className="w-4 h-4" />
                <span className="sm:hidden ml-1">Next</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView(view === "month" ? "year" : "month")}
                className="bg-primary/20 border-primary/30 hover:bg-primary/30 text-primary flex-1 sm:flex-none"
              >
                {view === "month" ? "Year" : "Month"}
              </Button>
            </div>
          </div>
          <NewEventSheet 
            selectedDate={newEventDate} 
            open={isNewEventSheetOpen}
            onOpenChange={setIsNewEventSheetOpen}
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-2 md:p-4">
        {view === "month" ? (
          <div className="h-full glass-card rounded-lg border border-white/5">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-700">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-2 md:p-3 text-center text-xs md:text-sm font-medium text-gray-400 border-r border-gray-700 last:border-r-0"
                >
                  {/* Mobile: Show S, M, T, W, T, F, S */}
                  <span className="sm:hidden">{day.charAt(0)}</span>
                  {/* Tablet: Show Sun, Mon, Tue, etc */}
                  <span className="hidden sm:inline md:hidden">{day}</span>
                  {/* Desktop: Show full names */}
                  <span className="hidden md:inline">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7" style={{ gridAutoRows: "1fr" }}>
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="min-h-[60px] sm:min-h-[80px] md:min-h-[120px] border-r border-b border-gray-700 bg-gray-900/30"
                />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const dayEvents = eventsByDay[day] || []

                return (
                  <div
                    key={day}
                    className={`min-h-[60px] sm:min-h-[80px] md:min-h-[120px] border-r border-b border-gray-700 p-1 sm:p-1.5 md:p-2 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                      (firstDayOfMonth + index) % 7 === 6 ? "border-r-0" : ""
                    }`}
                    onClick={() => handleDayCellDoubleClick(day, dayEvents)}
                    title="Click to create event or edit existing"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div
                        className={`text-xs sm:text-sm font-medium ${
                          isToday(day)
                            ? "inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground shadow-md"
                            : "text-gray-300"
                        }`}
                      >
                        {day}
                      </div>
                      {/* Show event count badge on mobile */}
                      {dayEvents.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="md:hidden text-[10px] px-1 py-0 h-4 bg-primary/20 text-primary border-primary/30"
                        >
                          {dayEvents.length}
                        </Badge>
                      )}
                    </div>

                    {/* Events for this day - hidden on mobile, shown on desktop */}
                    <div className="space-y-1 hidden md:block">
                      {isLoading ? (
                        <div className="text-xs text-gray-500">Loading...</div>
                      ) : (
                        dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1.5 rounded border ${getEventColor(
                              event.type
                            )} cursor-pointer hover:opacity-80 transition-opacity`}
                            title={event.description || "Click to edit"}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventDoubleClick(event)
                            }}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-[10px] opacity-75">
                              {event.allDay ? "All Day" : event.startTime || ""}
                            </div>
                          </div>
                        ))
                      )}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-gray-500 text-center">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Year View */
          <div className="h-full overflow-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {monthNames.map((monthName, monthIndex) => {
                const monthDate = new Date(currentDate.getFullYear(), monthIndex, 1)
                const monthDays = new Date(currentDate.getFullYear(), monthIndex + 1, 0).getDate()
                const monthFirstDay = monthDate.getDay()
                
                // Filter events for this month
                const monthEvents = events.filter(event => {
                  const eventDate = new Date(event.startDate)
                  return eventDate.getMonth() === monthIndex
                })

                // Group by day for this month
                const monthEventsByDay: Record<number, CalendarEvent[]> = {}
                monthEvents.forEach((event) => {
                  const eventDate = new Date(event.startDate)
                  const day = eventDate.getDate()
                  if (!monthEventsByDay[day]) {
                    monthEventsByDay[day] = []
                  }
                  monthEventsByDay[day].push(event)
                })

                return (
                  <div
                    key={monthIndex}
                    className="glass-card rounded-lg border border-white/5 p-2 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setCurrentDate(monthDate)
                      setView("month")
                    }}
                  >
                    <h3 className="text-sm font-semibold text-white mb-2 text-center">
                      {monthName}
                    </h3>
                    <div className="grid grid-cols-7 gap-px">
                      {/* Day headers - single letters */}
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <div key={i} className="text-[10px] text-gray-500 text-center p-0.5">
                          {day}
                        </div>
                      ))}
                      
                      {/* Empty cells */}
                      {Array.from({ length: monthFirstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}
                      
                      {/* Days */}
                      {Array.from({ length: monthDays }).map((_, i) => {
                        const day = i + 1
                        const hasEvents = monthEventsByDay[day]?.length > 0
                        const isCurrentMonth = monthIndex === new Date().getMonth()
                        const isCurrentDay = isCurrentMonth && day === new Date().getDate() && 
                                           currentDate.getFullYear() === new Date().getFullYear()
                        
                        return (
                          <div
                            key={day}
                            className={`aspect-square text-[10px] flex items-center justify-center rounded ${
                              isCurrentDay
                                ? "bg-primary text-primary-foreground font-semibold"
                                : hasEvents
                                  ? "bg-primary/20 text-primary font-medium"
                                  : "text-gray-400"
                            }`}
                          >
                            {day}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-700 bg-gray-800/50 p-2 md:p-3">
        <div className="flex items-center gap-2 md:gap-4 text-xs overflow-x-auto pb-1">
          <span className="text-gray-400 whitespace-nowrap">Events:</span>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <div className="w-3 h-3 rounded bg-blue-500/40 border border-blue-500/50" />
            <span className="text-gray-300">Permit</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500/50" />
            <span className="text-gray-300">Deadline</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <div className="w-3 h-3 rounded bg-green-500/40 border border-green-500/50" />
            <span className="text-gray-300">Meeting</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <div className="w-3 h-3 rounded bg-purple-500/40 border border-purple-500/50" />
            <span className="text-gray-300">Interview</span>
          </div>
        </div>
      </div>

      {/* Edit Event Sheet */}
      <EditEventSheet
        event={selectedEvent}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        onEventUpdated={() => {
          // Refresh events when an event is updated/deleted
          const fetchEvents = async () => {
            setIsLoading(true)
            const startDate = view === "year" 
              ? new Date(currentDate.getFullYear(), 0, 1)
              : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
            
            const endDate = view === "year"
              ? new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59)
              : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

            const result = await getCalendarEvents({ startDate, endDate })
            if (result.success && result.data) {
              setEvents(result.data)
            }
            setIsLoading(false)
          }
          fetchEvents()
        }}
      />
    </div>
  )
}
