"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, isSameDay, parseISO } from "date-fns"
import { Clock, User, AlertCircle } from "lucide-react"
import type { Task } from "@/components/pages/tasks-page"
import { cn } from "@/lib/utils"

interface TaskCalendarProps {
  tasks: Task[]
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      try {
        const taskDate = parseISO(task.dueDate)
        return isSameDay(taskDate, date)
      } catch {
        return false
      }
    })
  }

  // Get tasks for the selected date
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  // Priority colors matching the theme
  const priorityColors = {
    low: "bg-green-900 text-green-300 border-green-700",
    medium: "bg-yellow-900 text-yellow-300 border-yellow-700",
    high: "bg-red-900 text-red-300 border-red-700",
  }

  const priorityIcons = {
    low: <Clock className="h-3 w-3" />,
    medium: <Clock className="h-3 w-3" />,
    high: <AlertCircle className="h-3 w-3" />,
  }

  const statusColors = {
    pending: "bg-gray-600",
    "in-progress": "bg-green-600",
    completed: "bg-green-600",
    urgent: "bg-red-600",
  }

  // Get all dates that have tasks
  const datesWithTasks = tasks.map((task) => {
    try {
      return parseISO(task.dueDate)
    } catch {
      return null
    }
  }).filter((date): date is Date => date !== null)

  // Custom day content renderer to show task indicators
  const modifiers = {
    hasTasks: datesWithTasks,
  }

  const modifiersStyles = {
    hasTasks: {
      fontWeight: "bold",
      position: "relative" as const,
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Calendar Section */}
      <div className="lg:col-span-2">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Task Calendar</h3>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border border-gray-700 bg-gray-900"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-white",
                caption_label: "text-sm font-medium text-white",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-400 hover:text-white"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected])]:bg-gray-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-700 rounded-md text-gray-300"
                ),
                day_range_end: "day-range-end",
                day_selected:
                  "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 focus:bg-gradient-to-r focus:from-green-600 focus:to-emerald-600",
                day_today: "bg-gray-700 text-white font-bold",
                day_outside:
                  "day-outside text-gray-600 opacity-50 aria-selected:bg-gray-800/50 aria-selected:text-gray-600 aria-selected:opacity-30",
                day_disabled: "text-gray-600 opacity-50",
                day_range_middle: "aria-selected:bg-gray-800 aria-selected:text-white",
                day_hidden: "invisible",
              }}
            />
          </div>

          {/* Task count legend */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-gray-400">Low Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span className="text-gray-400">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="text-gray-400">High Priority</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tasks for Selected Date */}
      <div className="lg:col-span-1">
        <Card className="bg-gray-800 border-gray-700 p-6 h-full">
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </h3>

          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No tasks scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[600px]">
              {selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-900 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      className={cn(
                        "text-xs font-medium flex items-center gap-1",
                        priorityColors[task.priority]
                      )}
                    >
                      {priorityIcons[task.priority]}
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                    <Badge className={cn("text-xs", statusColors[task.status])}>
                      {task.status === "in-progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </div>

                  <h4 className="font-medium text-white mb-2 text-sm">{task.title}</h4>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {task.assignee}
                    </div>
                    <Badge className="bg-gray-700 text-gray-300 text-xs">{task.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
