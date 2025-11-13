"use client"

import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { AlertCircle, AlertTriangle, Clock, FileText, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { StatusCard } from "@/components/ui/status-card"
import { MetricCard } from "@/components/ui/metric-card"
import { DocumentProcessingTable } from "@/components/ui/document-processing-table"
import { ActivityTable } from "@/components/ui/activity-table"
import { Button } from "@/components/ui/button"
import { getTaskStats, type TaskStatsSummary } from "@/lib/actions/v2/tasks"
import { getPermitStats, type PermitStatsSummary } from "@/lib/actions/v2/permits"
import { getRecentActivityLogs, type DashboardActivityEntry } from "@/lib/actions/v2/dashboard"

interface ActivityRowData {
  id: string
  actor: string
  actorEmail?: string | null
  action: string
  department?: string | null
  status?: string | null
  entityType?: string
  createdAt: Date | string
}

const numberFormatter = new Intl.NumberFormat("en-US")
const percentFormatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const formatNumber = (value?: number) => numberFormatter.format(value ?? 0)
const formatPercent = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return "–"
  if (value > 0) return `+${percentFormatter.format(Math.abs(value))}%`
  if (value < 0) return `-${percentFormatter.format(Math.abs(value))}%`
  return `${percentFormatter.format(0)}%`
}
const formatDelta = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return "–"
  if (value > 0) return `+${percentFormatter.format(Math.abs(value))}pp`
  if (value < 0) return `-${percentFormatter.format(Math.abs(value))}pp`
  return `${percentFormatter.format(0)}pp`
}
const changeTypeFromNumber = (value?: number) =>
  value === undefined || Number.isNaN(value)
    ? "neutral"
    : value > 0
      ? "positive"
      : value < 0
        ? "negative"
        : "neutral"
const percentShare = (part: number | undefined, total: number | undefined) => {
  if (!total || total === 0 || part === undefined) return 0
  return Math.min(100, Math.round((part / total) * 100))
}

export function DashboardPage() {
  const [taskStats, setTaskStats] = useState<TaskStatsSummary | null>(null)
  const [permitStats, setPermitStats] = useState<PermitStatsSummary | null>(null)
  const [activity, setActivity] = useState<ActivityRowData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (!isMounted) return
      await loadDashboardData(true)
    }

    fetchData()

    const interval = setInterval(() => {
      if (!isMounted) return
      loadDashboardData(false)
    }, 45000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const loadDashboardData = async (withSpinner = true) => {
    if (withSpinner) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)
    let activityErrorMessage: string | null = null

    try {
      const [taskStatsResult, permitStatsResult, activityResult] = await Promise.all([
        getTaskStats(),
        getPermitStats(),
        getRecentActivityLogs(8),
      ])

      const failures: string[] = []

      if (taskStatsResult.success) {
        setTaskStats(taskStatsResult.data)
      } else {
        failures.push("task metrics")
      }

      if (permitStatsResult.success) {
        setPermitStats(permitStatsResult.data)
      } else {
        failures.push("permit metrics")
      }

      if (activityResult.success) {
        const mapped = activityResult.data.map(mapActivityEntry)
        setActivity(mapped)
        activityErrorMessage = null
      } else {
        activityErrorMessage = activityResult.error || "Failed to fetch activity feed"
        failures.push("activity feed")
      }

      if (failures.length > 0) {
        setActivityError(activityErrorMessage)
        throw new Error(`Unable to load ${failures.join(", ")}`)
      }

      setActivityError(null)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh dashboard data")
      if (activityErrorMessage) {
        setActivityError(activityErrorMessage)
      }
    } finally {
      if (withSpinner) {
        setIsLoading(false)
      }
      setIsRefreshing(false)
    }
  }

  const taskCompletionRate = taskStats?.completionRate.current ?? 0
  const taskCompletionChange = taskStats?.completionRate.change ?? 0

  const permitCategoryItems = useMemo(
    () => [
      {
        label: "Work permits",
        value: formatNumber(permitStats?.byCategory?.WORK_PERMIT),
        hint: `${percentShare(permitStats?.byCategory?.WORK_PERMIT, permitStats?.total)}% of active`,
        progress: percentShare(permitStats?.byCategory?.WORK_PERMIT, permitStats?.total),
        action: { text: "Open", link: "/permits?category=WORK_PERMIT" },
      },
      {
        label: "Residence IDs",
        value: formatNumber(permitStats?.byCategory?.RESIDENCE_ID),
        hint: `${percentShare(permitStats?.byCategory?.RESIDENCE_ID, permitStats?.total)}% of active`,
        progress: percentShare(permitStats?.byCategory?.RESIDENCE_ID, permitStats?.total),
        action: { text: "Open", link: "/permits?category=RESIDENCE_ID" },
      },
      {
        label: "Licenses",
        value: formatNumber(permitStats?.byCategory?.LICENSE),
        hint: `${percentShare(permitStats?.byCategory?.LICENSE, permitStats?.total)}% of active`,
        progress: percentShare(permitStats?.byCategory?.LICENSE, permitStats?.total),
        action: { text: "Open", link: "/permits?category=LICENSE" },
      },
    ],
    [permitStats]
  )

  const permitStatusItems = useMemo(
    () => [
      {
        label: "Approved",
        value: formatNumber(permitStats?.byStatus?.APPROVED),
        hint: `${percentShare(permitStats?.byStatus?.APPROVED, permitStats?.total)}% of active`,
        progress: percentShare(permitStats?.byStatus?.APPROVED, permitStats?.total),
        action: { text: "Permits", link: "/permits?status=APPROVED" },
      },
      {
        label: "Rejected",
        value: formatNumber(permitStats?.byStatus?.REJECTED),
        hint: `${percentShare(permitStats?.byStatus?.REJECTED, permitStats?.total)}% of active`,
        progress: percentShare(permitStats?.byStatus?.REJECTED, permitStats?.total),
        action: { text: "Investigate", link: "/permits?status=REJECTED" },
      },
      {
        label: "Expired",
        value: formatNumber(permitStats?.byStatus?.EXPIRED),
        hint: `${percentShare(permitStats?.byStatus?.EXPIRED, permitStats?.total)}% of active`,
        progress: percentShare(permitStats?.byStatus?.EXPIRED, permitStats?.total),
        action: { text: "Renewals", link: "/permits?status=EXPIRED" },
      },
    ],
    [permitStats]
  )

  const taskPriorityItems = useMemo(
    () => [
      {
        label: "Urgent tasks",
        value: formatNumber(taskStats?.byStatus?.urgent),
        hint: "Requires escalation",
        progress: percentShare(taskStats?.byStatus?.urgent, taskStats?.total),
        action: { text: "View queue", link: "/tasks?status=urgent" },
      },
      {
        label: "High priority",
        value: formatNumber(taskStats?.byPriority?.high),
        hint: `${percentShare(taskStats?.byPriority?.high, taskStats?.total)}% of all work`,
        progress: percentShare(taskStats?.byPriority?.high, taskStats?.total),
        action: { text: "Filter", link: "/tasks?priority=high" },
      },
      {
        label: "In progress",
        value: formatNumber(taskStats?.byStatus?.["in-progress"]),
        hint: `${percentShare(taskStats?.byStatus?.["in-progress"], taskStats?.total)}% of workload`,
        progress: percentShare(taskStats?.byStatus?.["in-progress"], taskStats?.total),
        action: { text: "Monitor", link: "/tasks?status=in-progress" },
      },
    ],
    [taskStats]
  )

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Administrative Dashboard"
          description="Track document processing and administrative tasks"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadDashboardData(false)}
          className="border-gray-800 bg-gray-900 text-sm font-medium text-gray-200 hover:bg-gray-800"
          disabled={isRefreshing}
        >
          {isRefreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {lastUpdated ? (
        <p className="text-xs text-gray-500">
          Data updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </p>
      ) : null}

      {error ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/40 bg-transparent text-amber-100 hover:bg-amber-500/20"
            onClick={() => loadDashboardData(true)}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <StatusCard
          title="Pending tasks"
          subtitle="Awaiting assignment"
          value={formatNumber(taskStats?.byStatus?.pending)}
          change={formatPercent(taskStats?.trends?.pending)}
          changeType={changeTypeFromNumber(taskStats?.trends?.pending)}
          isLoading={isLoading}
        />
        <StatusCard
          title="In progress"
          subtitle="Actively being worked"
          value={formatNumber(taskStats?.byStatus?.["in-progress"])}
          change={formatPercent(taskStats?.trends?.["in-progress"])}
          changeType={changeTypeFromNumber(taskStats?.trends?.["in-progress"])}
          isLoading={isLoading}
        />
        <StatusCard
          title="Completed"
          subtitle="Closed in the last 7 days"
          value={formatNumber(taskStats?.byStatus?.completed)}
          change={formatPercent(taskStats?.trends?.completed)}
          changeType={changeTypeFromNumber(taskStats?.trends?.completed)}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          icon={<FileText className="h-5 w-5 text-gray-300" />}
          title="Document processing"
          value={formatNumber(permitStats?.total)}
          subtext="Active permits"
          change={formatPercent(permitStats?.trends?.total)}
          changeType={changeTypeFromNumber(permitStats?.trends?.total)}
          items={permitCategoryItems}
          footer={`${permitStats?.expiringSoonCount ?? 0} permits expiring within 14 days`}
          buttonText="Open permits"
          buttonLink="/permits"
          isLoading={isLoading}
        />
        <MetricCard
          icon={<Clock className="h-5 w-5 text-gray-300" />}
          title="Processing status"
          value={formatNumber(permitStats?.byStatus?.SUBMITTED)}
          subtext="Awaiting review"
          change={formatPercent(permitStats?.trends?.APPROVED)}
          changeType={changeTypeFromNumber(permitStats?.trends?.APPROVED)}
          items={permitStatusItems}
          footer={`${permitStats?.backlogOlderThan30Days ?? 0} requests older than 30 days`}
          buttonText="View pipeline"
          buttonLink="/permits"
          isLoading={isLoading}
        />
        <MetricCard
          icon={<AlertCircle className="h-5 w-5 text-gray-300" />}
          title="Task priority"
          value={`${percentFormatter.format(taskCompletionRate)}%`}
          subtext="Completion rate"
          change={formatDelta(taskCompletionChange)}
          changeType={changeTypeFromNumber(taskCompletionChange)}
          items={taskPriorityItems}
          footer={`${taskStats?.overdueCount ?? 0} overdue • ${taskStats?.dueSoonCount ?? 0} due in 3 days`}
          buttonText="Manage tasks"
          buttonLink="/tasks"
          isLoading={isLoading}
        />
      </div>

      <DocumentProcessingTable />

      <ActivityTable
        activities={activity}
        isLoading={isLoading && activity.length === 0}
        onRefresh={() => loadDashboardData(false)}
        lastUpdated={lastUpdated}
        error={activityError}
        onRetry={() => loadDashboardData(true)}
      />
    </div>
  )
}

function mapActivityEntry(entry: DashboardActivityEntry): ActivityRowData {
  const actorName = entry.actor.name || entry.actor.email || "System"
  const details = (entry.details || {}) as Record<string, unknown>
  const description =
    typeof details.description === "string"
      ? details.description
      : typeof details.summary === "string"
        ? details.summary
        : entry.action

  const department = typeof details.department === "string" ? details.department : null
  const status = typeof details.status === "string" ? details.status : entry.action

  return {
    id: entry.id,
    actor: actorName,
    actorEmail: entry.actor.email,
    action: description,
    department,
    status,
    entityType: entry.entityType,
    createdAt: entry.createdAt,
  }
}
