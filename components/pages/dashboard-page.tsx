"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { FileText, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ActivityTable } from "@/components/ui/activity-table"
import { getTaskStats, getTasks } from "@/lib/actions/v2/tasks"
import { getPermitStats, getPermits } from "@/lib/actions/v2/permits"
import Link from "next/link"

export function DashboardPage() {
  const [taskStats, setTaskStats] = useState<any>({ byStatus: {}, total: 0 })
  const [permitStats, setPermitStats] = useState<any>({ byStatus: {}, byCategory: {}, total: 0 })
  const [tasks, setTasks] = useState<any[]>([])
  const [permits, setPermits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)

    // Load task stats
    const taskStatsResult = await getTaskStats()
    if (taskStatsResult.success) {
      setTaskStats(taskStatsResult.data)
    }

    // Load permit stats
    const permitStatsResult = await getPermitStats()
    if (permitStatsResult.success) {
      setPermitStats(permitStatsResult.data)
    }

    // Load recent tasks
    const tasksResult = await getTasks({ limit: 5 })
    if (tasksResult.success) {
      setTasks(tasksResult.data)
    }

    // Load recent permits
    const permitsResult = await getPermits({ limit: 5 })
    if (permitsResult.success) {
      setPermits(permitsResult.data)
    }

    setLoading(false)
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900 text-yellow-300"
      case "in-progress":
        return "bg-blue-900 text-blue-300"
      case "completed":
        return "bg-green-900 text-green-300"
      case "urgent":
        return "bg-red-900 text-red-300"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  const getPermitStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-900 text-yellow-300"
      case "SUBMITTED":
        return "bg-blue-900 text-blue-300"
      case "APPROVED":
        return "bg-green-900 text-green-300"
      case "REJECTED":
        return "bg-red-900 text-red-300"
      case "EXPIRED":
        return "bg-gray-700 text-gray-400"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  return (
    <div className="p-8">
      <PageHeader title="Administrative Dashboard" description="Track document processing and administrative tasks" />

      {/* Task Stats Cards - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Pending Tasks</p>
            <Clock className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-white">{taskStats.byStatus?.pending || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Tasks waiting to start</p>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">In Progress</p>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{taskStats.byStatus?.["in-progress"] || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Currently being worked on</p>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Completed</p>
            <FileText className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white">{taskStats.byStatus?.completed || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Successfully finished</p>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Urgent</p>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-white">{taskStats.byStatus?.urgent || 0}</p>
          <p className="text-xs text-gray-500 mt-2">High priority items</p>
        </Card>
      </div>

      {/* Permit Stats Cards - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Total Permits</p>
          <p className="text-2xl font-bold text-white">{permitStats.total || 0}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{permitStats.byStatus?.PENDING || 0}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Submitted</p>
          <p className="text-2xl font-bold text-blue-400">{permitStats.byStatus?.SUBMITTED || 0}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-400">{permitStats.byStatus?.APPROVED || 0}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Rejected/Expired</p>
          <p className="text-2xl font-bold text-red-400">
            {(permitStats.byStatus?.REJECTED || 0) + (permitStats.byStatus?.EXPIRED || 0)}
          </p>
        </Card>
      </div>

      {/* Activity Table */}
      <div className="mb-8">
        <ActivityTable />
      </div>
    </div>
  )
}
