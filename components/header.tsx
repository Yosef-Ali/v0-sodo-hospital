"use client"

import { Search, Bell } from "lucide-react"
import { useEffect, useState } from "react"
import { getExpiringItems } from "@/lib/actions/v2/calendar-events"
import { getOverdueTasks } from "@/lib/actions/v2/tasks"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface UrgentItem {
  id: string
  title: string
  type: string
  daysRemaining?: number
  status: "expired" | "urgent" | "overdue"
  link: string
}

export function Header() {
  const [urgentItems, setUrgentItems] = useState<UrgentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUrgentItems() {
      setIsLoading(true)
      const items: UrgentItem[] = []

      // Get overdue tasks
      const overdueResult = await getOverdueTasks()
      if (overdueResult.success && overdueResult.data) {
        overdueResult.data.forEach((item: any) => {
          items.push({
            id: item.task.id,
            title: item.task.title,
            type: "task",
            status: "overdue",
            link: `/tasks/${item.task.id}`
          })
        })
      }

      // Get expiring items (expired and urgent only)
      const expiringResult = await getExpiringItems(30)
      if (expiringResult.success && expiringResult.data) {
        expiringResult.data
          .filter(item => item.status === "expired" || item.status === "urgent")
          .forEach(item => {
            items.push({
              id: item.id,
              title: `${item.title} - ${item.entityName}`,
              type: item.type,
              daysRemaining: item.daysRemaining,
              status: item.status as "expired" | "urgent",
              link: item.personId ? `/foreigners/${item.personId}` : "/calendar"
            })
          })
      }

      setUrgentItems(items)
      setIsLoading(false)
    }

    fetchUrgentItems()
    // Refresh every 5 minutes
    const interval = setInterval(fetchUrgentItems, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const urgentCount = urgentItems.length
  const hasUrgent = urgentCount > 0

  return (
    <header className="bg-gray-900/40 backdrop-blur-md border-b border-gray-700/50 py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks, documents, and users..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`relative p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                  hasUrgent
                    ? "text-orange-400 hover:text-orange-300"
                    : "text-gray-400 hover:text-green-400"
                }`}
              >
                <Bell
                  size={22}
                  className={hasUrgent ? "animate-bell" : ""}
                />
                {hasUrgent && (
                  <>
                    {/* Animated ping effect */}
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    {/* Count badge */}
                    {urgentCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {urgentCount > 99 ? "99+" : urgentCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-gray-800 border-gray-700" align="end">
              <div className="p-3 border-b border-gray-700">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Bell size={16} className="text-orange-400" />
                  Urgent Notifications
                  {urgentCount > 0 && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      {urgentCount}
                    </span>
                  )}
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
                ) : urgentItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No urgent issues
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-700">
                    {urgentItems.slice(0, 10).map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.link}
                          className="block p-3 hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                              item.status === "expired"
                                ? "bg-red-500 animate-pulse"
                                : item.status === "overdue"
                                  ? "bg-orange-500 animate-pulse"
                                  : "bg-yellow-500"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{item.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {item.status === "expired" && "Expired"}
                                {item.status === "overdue" && "Overdue task"}
                                {item.status === "urgent" && item.daysRemaining !== undefined && (
                                  `${item.daysRemaining} day${item.daysRemaining !== 1 ? "s" : ""} left`
                                )}
                                <span className="ml-2 text-gray-500">{item.type}</span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {urgentItems.length > 10 && (
                <div className="p-2 border-t border-gray-700">
                  <Link
                    href="/dashboard"
                    className="block text-center text-sm text-blue-400 hover:text-blue-300"
                  >
                    View all {urgentItems.length} notifications
                  </Link>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium text-white">Dr. Samuel</span>
            <button className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
