"use client"

import { useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Filter, Loader2, MoreVertical, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface ActivityEntry {
  id: string
  actor: string
  actorEmail?: string | null
  action: string
  department?: string | null
  entityType?: string
  status?: string | null
  createdAt: string | Date
}

interface ActivityTableProps {
  activities: ActivityEntry[]
  isLoading?: boolean
  onRefresh?: () => void
  lastUpdated?: Date | null
  error?: string | null
  onRetry?: () => void
}

export function ActivityTable({
  activities,
  isLoading = false,
  onRefresh,
  lastUpdated,
  error,
  onRetry,
}: ActivityTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const statuses = useMemo(() => {
    const unique = new Set<string>()
    activities.forEach((activity) => {
      if (activity.status) {
        unique.add(activity.status.toLowerCase())
      }
    })
    return Array.from(unique.values()).sort()
  }, [activities])

  const filteredActivities = useMemo(() => {
    if (statusFilter === "all") {
      return activities
    }
    return activities.filter((activity) => activity.status?.toLowerCase() === statusFilter)
  }, [activities, statusFilter])

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-300",
    completed: "bg-emerald-500/10 text-emerald-300",
    "in-progress": "bg-sky-500/10 text-sky-300",
    approved: "bg-emerald-500/10 text-emerald-300",
    rejected: "bg-rose-500/10 text-rose-300",
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 shadow-lg shadow-black/10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Live workflow activity</h3>
          <p className="mt-1 text-sm text-gray-400">
            Updates from tasks, permits, and document reviews in the last few minutes
          </p>
          {lastUpdated ? (
            <p className="mt-1 text-xs text-gray-500">Synced {formatDistanceToNow(lastUpdated, { addSuffix: true })}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-gray-800 bg-gray-900 text-xs font-medium uppercase tracking-wide text-gray-400">
              <Filter className="mr-1 h-3 w-3" />
              {statusFilter === "all" ? "All statuses" : statusFilter}
            </Badge>
            {statuses.map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={
                  statusFilter === status
                    ? "border-green-500/40 bg-green-500/10 text-xs font-medium text-green-300 hover:bg-green-500/20"
                    : "border-gray-800 bg-gray-900 text-xs text-gray-300 hover:bg-gray-800"
                }
              >
                {status}
              </Button>
            ))}
            {statuses.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={
                  statusFilter === "all"
                    ? "border-green-500/40 bg-green-500/10 text-xs font-medium text-green-300 hover:bg-green-500/20"
                    : "border-gray-800 bg-gray-900 text-xs text-gray-300 hover:bg-gray-800"
                }
              >
                All
              </Button>
            ) : null}
          </div>
          {onRefresh ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="border-gray-800 bg-gray-900 text-xs font-medium text-gray-200 hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
              Refresh
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-4 border-b border-red-500/20 bg-red-500/5 px-6 py-3 text-sm text-red-300">
          <span>{error}</span>
          {onRetry ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="border-red-500/30 bg-transparent text-red-200 hover:bg-red-500/10"
            >
              Try again
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900/70">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Context</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">When</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">More</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading && filteredActivities.length === 0
              ? Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-8 w-40 bg-gray-800" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-56 bg-gray-800" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-32 bg-gray-800" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-20 bg-gray-800" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 bg-gray-800" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="ml-auto h-6 w-6 bg-gray-800" />
                    </td>
                  </tr>
                ))
              : filteredActivities.map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} statusColors={statusColors} />
                ))}
          </tbody>
        </table>
      </div>

      {filteredActivities.length === 0 && !isLoading && !error ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">
          No activity entries match the selected filters.
        </div>
      ) : null}
    </div>
  )
}

interface ActivityRowProps {
  activity: ActivityEntry
  statusColors: Record<string, string>
}

function ActivityRow({ activity, statusColors }: ActivityRowProps) {
  const initials = activity.actor
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)

  const createdAt = typeof activity.createdAt === "string" ? new Date(activity.createdAt) : activity.createdAt
  const relativeTime = formatDistanceToNow(createdAt, { addSuffix: true })

  const statusKey = activity.status?.toLowerCase() ?? "update"
  const statusBadgeClass = statusColors[statusKey] ?? "bg-slate-500/10 text-slate-300"

  return (
    <tr className="bg-transparent">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm font-semibold text-gray-200">
            {initials || "--"}
          </Avatar>
          <div>
            <div className="text-sm font-semibold text-white">{activity.actor}</div>
            {activity.actorEmail ? <div className="text-xs text-gray-500">{activity.actorEmail}</div> : null}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-200">{activity.action}</div>
        {activity.entityType ? (
          <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">{activity.entityType}</div>
        ) : null}
      </td>
      <td className="px-6 py-4">
        {activity.department ? (
          <span className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300">{activity.department}</span>
        ) : (
          <span className="text-xs text-gray-500">—</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-400">{relativeTime}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass}`}>
          {statusKey.replace("-", " ")}
        </span>
      </td>
      <td className="px-6 py-4 text-right text-sm text-gray-500">
        <button className="rounded-full p-1 text-gray-500 transition hover:bg-gray-800 hover:text-gray-200">
          <MoreVertical className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}
