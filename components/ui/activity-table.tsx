import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"

interface ActivityTableProps {
  activities: any[]
}

export function ActivityTable({ activities = [] }: ActivityTableProps) {
  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }

  // Map activity types to status badges
  const getActivityStatus = (action: string) => {
    if (action.includes("created") || action.includes("submitted")) return "pending"
    if (action.includes("completed") || action.includes("approved")) return "completed"
    return "in-progress"
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium text-white">Recent Activity</h3>
        <p className="text-sm text-gray-400 mt-1">{activities.length} recent activities</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Entity Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No recent activity
                </td>
              </tr>
            ) : (
              activities.map((item) => (
                <ActivityRow
                  key={item.activity.id}
                  avatar="/placeholder.svg?height=40&width=40"
                  name={item.user?.name || "Unknown User"}
                  action={item.activity.action}
                  department={item.activity.entityType}
                  time={formatTimeAgo(item.activity.createdAt)}
                  status={getActivityStatus(item.activity.action)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-700">
        <div className="text-sm text-gray-400">Showing {Math.min(activities.length, 10)} of {activities.length} activities</div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-sm font-normal border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
            disabled
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-sm font-normal border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
            disabled
          >
            Next
          </Button>
        </div>
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
            <div className="text-sm font-medium text-white">{name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-300">{action}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-300">{department}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-400">{time}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
            status === "pending"
              ? "bg-yellow-900 text-yellow-300"
              : status === "completed"
                ? "bg-green-900 text-green-300"
                : "bg-green-900 text-green-300"
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-gray-300">
          <MoreVertical className="h-5 w-5" />
        </button>
      </td>
    </tr>
  )
}
