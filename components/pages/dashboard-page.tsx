"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { StatusCard } from "@/components/ui/status-card"
import { MetricCard } from "@/components/ui/metric-card"
import { FileText, Clock, AlertCircle, Loader2 } from "lucide-react"
import { ActivityTable } from "@/components/ui/activity-table"
import { getDashboardStats, getRecentActivity } from "@/lib/actions/v2/dashboard"

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)

    const [statsResult, activitiesResult] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(10)
    ])

    if (statsResult.success) {
      setStats(statsResult.data)
    }

    if (activitiesResult.success) {
      setActivities(activitiesResult.data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8">
        <PageHeader title="Administrative Dashboard" description="Track document processing and administrative tasks" />
        <div className="text-center py-12 text-gray-400">
          Failed to load dashboard data. Please refresh the page.
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <PageHeader title="Administrative Dashboard" description="Track document processing and administrative tasks" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatusCard
          title="Pending Tasks"
          value={stats.tasks.pending.toString()}
          change="+2.5%"
          changeType="positive"
        />
        <StatusCard
          title="In Progress"
          value={stats.tasks.inProgress.toString()}
          change="+5.0%"
          changeType="positive"
        />
        <StatusCard
          title="Completed"
          value={stats.tasks.completed.toString()}
          change="+12.5%"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard
          icon={<FileText className="h-5 w-5 text-gray-400" />}
          title="Permits Overview"
          value={stats.permits.total.toString()}
          subtext="Total permits"
          change="+12.5%"
          changeType="positive"
          items={[
            { label: "Pending", value: `${Math.round((stats.permits.pending / Math.max(stats.permits.total, 1)) * 100)}%` },
            { label: "Approved", value: `${Math.round((stats.permits.approved / Math.max(stats.permits.total, 1)) * 100)}%` },
            { label: "Submitted", value: `${Math.round((stats.permits.submitted / Math.max(stats.permits.total, 1)) * 100)}%` },
          ]}
          footer={`${stats.permits.pending + stats.permits.submitted} permits need review`}
          buttonText="View Details"
          buttonLink="/permits"
        />

        <MetricCard
          icon={<Clock className="h-5 w-5 text-gray-400" />}
          title="Tasks & Events"
          value={stats.tasks.total.toString()}
          subtext="Total tasks"
          change="-2.3"
          changeType="positive"
          items={[
            { label: "Pending Tasks", value: stats.tasks.pending.toString() },
            { label: "In Progress", value: stats.tasks.inProgress.toString() },
            { label: "Upcoming Events", value: stats.calendar.upcomingEvents.toString() },
          ]}
          footer={`${stats.tasks.overdue} tasks overdue`}
          buttonText="View Details"
          buttonLink="/tasks"
        />

        <MetricCard
          icon={<AlertCircle className="h-5 w-5 text-gray-400" />}
          title="People & Urgent"
          value={stats.people.total.toString()}
          subtext="Total people"
          change="-4.3%"
          changeType="negative"
          items={[
            { label: "Overdue Tasks", value: stats.tasks.overdue.toString() },
            { label: "Urgent Tasks", value: stats.tasks.urgent.toString() },
            { label: "Pending Permits", value: stats.permits.pending.toString() },
          ]}
          footer={`${stats.tasks.urgent} urgent tasks need attention`}
          buttonText="View Details"
          buttonLink="/people"
        />
      </div>

      <ActivityTable activities={activities} />
    </div>
  )
}
