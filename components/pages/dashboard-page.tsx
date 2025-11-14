"use client"

import { PageHeader } from "@/components/ui/page-header"
import { StatusCard } from "@/components/ui/status-card"
import { MetricCard } from "@/components/ui/metric-card"
import { DocumentProcessingTable } from "@/components/ui/document-processing-table"
import { FileText, Clock, AlertCircle } from "lucide-react"
import { ActivityTable } from "@/components/ui/activity-table"

interface DashboardPageProps {
  initialData: {
    taskStats: any
    permitStats: any
    permits: any[]
  }
}

export function DashboardPage({ initialData }: DashboardPageProps) {
  const { taskStats, permitStats, permits } = initialData

  return (
    <div className="p-8">
      <PageHeader title="Administrative Dashboard" description="Track document processing and administrative tasks" />

      {/* Status Cards Row - Real Data from Database */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatusCard
          title="Pending Tasks"
          value={String(taskStats.byStatus?.pending || 0)}
          change="+2.5%"
          changeType="positive"
        />
        <StatusCard
          title="In Progress"
          value={String(taskStats.byStatus?.["in-progress"] || 0)}
          change="+5.0%"
          changeType="positive"
        />
        <StatusCard
          title="Completed"
          value={String(taskStats.byStatus?.completed || 0)}
          change="+12.5%"
          changeType="positive"
        />
      </div>

      {/* Metric Cards Row - Real Data from Database */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MetricCard
          icon={<FileText className="h-5 w-5 text-gray-400" />}
          title="Document Processing"
          value={String(permitStats.total || 0)}
          subtext="Active permits"
          change="+12.5%"
          changeType="positive"
          items={[
            {
              label: "Work Permits",
              value: String(permitStats.byCategory?.WORK_PERMIT || 0),
              action: { text: "View", link: "/permits?category=WORK_PERMIT" }
            },
            {
              label: "Residence IDs",
              value: String(permitStats.byCategory?.RESIDENCE_ID || 0),
              action: { text: "View", link: "/permits?category=RESIDENCE_ID" }
            },
            {
              label: "Licenses",
              value: String(permitStats.byCategory?.LICENSE || 0),
              action: { text: "View", link: "/permits?category=LICENSE" }
            },
          ]}
          footer={`${permitStats.byStatus?.PENDING || 0} permits pending review`}
          buttonText="View Details"
          buttonLink="/permits"
        />

        <MetricCard
          icon={<Clock className="h-5 w-5 text-gray-400" />}
          title="Processing Status"
          value={String(permitStats.byStatus?.SUBMITTED || 0)}
          subtext="Currently submitted"
          change={String(permitStats.byStatus?.APPROVED || 0)}
          changeType="positive"
          items={[
            {
              label: "Approved",
              value: String(permitStats.byStatus?.APPROVED || 0),
              action: { text: "View", link: "/permits?status=APPROVED" }
            },
            {
              label: "Rejected",
              value: String(permitStats.byStatus?.REJECTED || 0),
              action: { text: "View", link: "/permits?status=REJECTED" }
            },
            {
              label: "Expired",
              value: String(permitStats.byStatus?.EXPIRED || 0),
              action: { text: "View", link: "/permits?status=EXPIRED" }
            },
          ]}
          footer={`${taskStats.byStatus?.urgent || 0} urgent tasks`}
          buttonText="View Details"
          buttonLink="/tasks"
        />

        <MetricCard
          icon={<AlertCircle className="h-5 w-5 text-gray-400" />}
          title="Task Priority"
          value={String(taskStats.byStatus?.urgent || 0)}
          subtext="High priority items"
          change={`-${Math.max(0, (taskStats.byStatus?.completed || 0))}%`}
          changeType="negative"
          items={[
            {
              label: "Urgent Tasks",
              value: String(taskStats.byStatus?.urgent || 0),
              action: { text: "View", link: "/tasks?status=urgent" }
            },
            {
              label: "In Progress",
              value: String(taskStats.byStatus?.["in-progress"] || 0),
              action: { text: "View", link: "/tasks?status=in-progress" }
            },
            {
              label: "Pending",
              value: String(taskStats.byStatus?.pending || 0),
              action: { text: "View", link: "/tasks?status=pending" }
            },
          ]}
          footer={`${Math.max(0, Math.floor((taskStats.byStatus?.completed || 0) / (taskStats.total || 1) * 100))}% tasks completed`}
          buttonText="View Details"
          buttonLink="/tasks"
        />
      </div>

      {/* Document Processing Status Table */}
      <div className="mb-12">
        <DocumentProcessingTable initialPermits={permits} />
      </div>

      <ActivityTable />
    </div>
  )
}
