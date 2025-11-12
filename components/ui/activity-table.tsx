import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"

export function ActivityTable() {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium text-white">Document Processing Status</h3>
        <p className="text-sm text-gray-400 mt-1">45 documents in process</p>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="text-sm font-medium mb-1 text-gray-300">Authenticated</div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-2 bg-green-500 rounded-full w-[40%]"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-1 text-gray-300">Under Review</div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-2 bg-green-500 rounded-full w-[20%]"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-1 text-gray-300">Pending Submission</div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div className="h-2 bg-green-500 rounded-full w-[10%]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
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

      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-700">
        <div className="text-sm text-gray-400">Showing 1-10 of 45 tasks</div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-sm font-normal border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-sm font-normal border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
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
