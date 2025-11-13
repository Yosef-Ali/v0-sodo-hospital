"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NewEventSheet } from "@/components/calendar/new-event-sheet"
import { getCalendarEvents } from "@/lib/actions/v2/calendar-events"
import type { CalendarEvent } from "@/lib/db/schema"

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

      const result = await getCalendarEvents({ startDate, endDate })
      if (result.success && result.data) {
        setEvents(result.data)
      }
      setIsLoading(false)
    }

    fetchEvents()
  }, [currentDate])

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
      <div className="border-b border-gray-700 bg-gray-800/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <NewEventSheet selectedDate={currentDate} />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="h-full bg-gray-800 rounded-lg border border-gray-700">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-700">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-400 border-r border-gray-700 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7" style={{ gridAutoRows: "1fr" }}>
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="min-h-[120px] border-r border-b border-gray-700 bg-gray-900/30"
              />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const dayEvents = eventsByDay[day] || []

              return (
                <div
                  key={day}
                  className={`min-h-[120px] border-r border-b border-gray-700 p-2 hover:bg-gray-700/30 transition-colors ${
                    (firstDayOfMonth + index) % 7 === 6 ? "border-r-0" : ""
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday(day)
                        ? "inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500 text-white"
                        : "text-gray-300"
                    }`}
                  >
                    {day}
                  </div>

                  {/* Events for this day */}
                  <div className="space-y-1">
                    {isLoading ? (
                      <div className="text-xs text-gray-500">Loading...</div>
                    ) : (
                      dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1.5 rounded border ${getEventColor(
                            event.type
                          )} cursor-pointer hover:opacity-80 transition-opacity`}
                          title={event.description || ""}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75">
                            {event.allDay ? "All Day" : event.startTime || ""}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-700 bg-gray-800/50 p-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-400">Event Types:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500/40 border border-blue-500/50" />
            <span className="text-gray-300">Permit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500/50" />
            <span className="text-gray-300">Deadline</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500/40 border border-green-500/50" />
            <span className="text-gray-300">Meeting</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-500/40 border border-purple-500/50" />
            <span className="text-gray-300">Interview</span>
          </div>
        </div>
      </div>
    </div>
  )
}
