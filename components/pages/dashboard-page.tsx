import { PageHeader } from "@/components/ui/page-header"
import { StatusCard } from "@/components/ui/status-card"
import { MetricCard } from "@/components/ui/metric-card"
import { FileText, Clock, AlertCircle } from "lucide-react"
import { ActivityTable } from "@/components/ui/activity-table"

export function DashboardPage() {
  return (
    <div className="p-8">
      <PageHeader title="Administrative Dashboard" description="Track document processing and administrative tasks" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatusCard title="Pending Tasks" value="12" change="+2.5%" changeType="positive" />
        <StatusCard title="In Progress" value="24" change="+5.0%" changeType="positive" />
        <StatusCard title="Completed" value="45" change="+12.5%" changeType="positive" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard
          icon={<FileText className="h-5 w-5 text-gray-400" />}
          title="Document Processing"
          value="156"
          subtext="Active documents"
          change="+12.5%"
          changeType="positive"
          items={[
            { label: "License Renewals", value: "45%" },
            { label: "Support Letters", value: "35%" },
            { label: "Authentication", value: "20%" },
          ]}
          footer="24 documents need review"
          buttonText="View Details"
          buttonLink="/documents"
        />

        <MetricCard
          icon={<Clock className="h-5 w-5 text-gray-400" />}
          title="Processing Time"
          value="4.2"
          subtext="Processing duration"
          change="-2.3"
          changeType="positive"
          items={[
            { label: "License Processing", value: "3.5 days" },
            { label: "Document Auth", value: "4.8 days" },
            { label: "Letter Generation", value: "1.2 days" },
          ]}
          footer="8 tasks overdue"
          buttonText="View Details"
          buttonLink="/tasks"
        />

        <MetricCard
          icon={<AlertCircle className="h-5 w-5 text-gray-400" />}
          title="Pending Approvals"
          value="32"
          subtext="Awaiting review"
          change="-4.3%"
          changeType="negative"
          items={[
            { label: "Ministry Of Labor", value: "12" },
            { label: "HERQA", value: "8" },
            { label: "Internal", value: "12" },
          ]}
          footer="5 urgent approvals needed"
          buttonText="View Details"
          buttonLink="/tasks"
        />
      </div>

      <ActivityTable />
    </div>
  )
}
