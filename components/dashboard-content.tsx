import type React from "react"
import { FileText, Clock, AlertCircle, ChevronUp, ChevronDown, MoreVertical, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrative Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Track document processing and administrative tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="Pending Tasks" value="12" change="+2.5%" changeType="positive" />
        <StatusCard title="In Progress" value="24" change="+5.0%" changeType="positive" />
        <StatusCard title="Completed" value="45" change="+12.5%" changeType="positive" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={<FileText className="h-5 w-5 text-gray-600" />}
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
        />

        <MetricCard
          icon={<Clock className="h-5 w-5 text-gray-600" />}
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
        />

        <MetricCard
          icon={<AlertCircle className="h-5 w-5 text-gray-600" />}
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
        />
      </div>

      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-auto">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="all" className="text-sm data-[state=active]:bg-gray-100">
              All Tasks
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-sm data-[state=active]:bg-gray-100">
              Pending
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm data-[state=active]:bg-gray-100">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-3 pr-10 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button variant="outline" size="sm" className="flex items-center text-sm font-normal border-gray-200">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button size="sm" className="text-sm font-normal bg-blue-600 hover:bg-blue-700">
            New Task
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Document Processing Status</h3>
          <p className="text-sm text-gray-500 mt-1">45 documents in process</p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 text-gray-700">Authenticated</div>
              <div className="h-2 bg-blue-100 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full w-[40%]"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 text-gray-700">Under Review</div>
              <div className="h-2 bg-blue-100 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full w-[20%]"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 text-gray-700">Pending Submission</div>
              <div className="h-2 bg-blue-100 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full w-[10%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <ActivityRow
                avatar="/placeholder.svg?height=40&width=40"
                name="Bethel Admin"
                action="submitted license renewal application"
                department="License Processing"
                time="2 minutes ago"
                status="pending"
              />
              <ActivityRow
                avatar="/placeholder.svg?height=40&width=40"
                name="Kalkidan"
                action="generated support letter"
                department="Document Processing"
                time="1 hour ago"
                status="completed"
              />
              <ActivityRow
                avatar="/placeholder.svg?height=40&width=40"
                name="Samuel"
                action="uploaded authenticated documents"
                department="Document Authentication"
                time="3 hours ago"
                status="in-progress"
              />
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">Showing 1-10 of 45 tasks</div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-sm font-normal border-gray-200">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="text-sm font-normal border-gray-200">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatusCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
}

function StatusCard({ title, value, change, changeType }: StatusCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="text-sm text-gray-500 font-medium">{title}</div>
      <div className="flex items-baseline mt-2">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div
          className={`ml-2 text-xs font-medium ${
            changeType === "positive" ? "text-green-500" : changeType === "negative" ? "text-red-500" : "text-gray-500"
          }`}
        >
          {change}
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtext: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  items: { label: string; value: string }[]
  footer: string
  buttonText: string
}

function MetricCard({ icon, title, value, subtext, change, changeType, items, footer, buttonText }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="bg-gray-50 p-2 rounded-md">{icon}</div>
          <div
            className={`flex items-center text-xs font-medium ${
              changeType === "positive"
                ? "text-green-500"
                : changeType === "negative"
                  ? "text-red-500"
                  : "text-gray-500"
            }`}
          >
            {changeType === "positive" ? (
              <ChevronUp className="h-3 w-3 mr-1" />
            ) : changeType === "negative" ? (
              <ChevronDown className="h-3 w-3 mr-1" />
            ) : null}
            {change}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-500 font-medium">{title}</div>
          <div className="flex items-baseline mt-1">
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="ml-2 text-xs text-gray-500">{subtext}</div>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between py-1">
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="text-sm font-medium text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-amber-600 mb-3">{footer}</div>
        <button className="text-xs text-blue-600 font-medium hover:text-blue-800">{buttonText}</button>
      </div>
    </div>
  )
}

interface ActivityRowProps {
  avatar: string
  name: string
  action: string
  department: string
  time: string
  status: "pending" | "completed" | "in-progress"
}

function ActivityRow({ avatar, name, action, department, time, status }: ActivityRowProps) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 rounded-full">
            <img src={avatar || "/placeholder.svg"} alt={name} />
          </Avatar>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-700">{action}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-700">{department}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{time}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
            status === "pending"
              ? "bg-yellow-50 text-yellow-700"
              : status === "completed"
                ? "bg-green-50 text-green-700"
                : "bg-blue-50 text-blue-700"
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-gray-500">
          <MoreVertical className="h-5 w-5" />
        </button>
      </td>
    </tr>
  )
}
