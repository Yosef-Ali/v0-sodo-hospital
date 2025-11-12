import { Clock, CheckCircle, AlertCircle, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TaskCardProps {
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "urgent"
  dueDate: string
  assignee: string
  category: string
  priority?: "low" | "medium" | "high"
}

export function TaskCard({
  title,
  description,
  status,
  dueDate,
  assignee,
  category,
  priority = "medium",
}: TaskCardProps) {
  const statusColors = {
    pending: "bg-gray-600",
    "in-progress": "bg-green-600",
    completed: "bg-green-600",
    urgent: "bg-red-600",
  }

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    "in-progress": <AlertCircle className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />,
    urgent: <AlertCircle className="h-4 w-4" />,
  }

  const priorityColors = {
    low: "bg-green-900 text-green-300",
    medium: "bg-yellow-900 text-yellow-300",
    high: "bg-red-900 text-red-300",
  }

  // Format the due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <Badge className={`${statusColors[status]} text-xs font-medium flex items-center gap-1`}>
            {statusIcons[status]}
            {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
          </Badge>
          <Badge className={`${priorityColors[priority]} text-xs font-medium`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </Badge>
        </div>
        <h3 className="font-medium text-lg mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Due:</span>
            <span className="text-gray-400">{formatDueDate(dueDate)}</span>
          </div>
          <div className="flex justify-between">
            <span>Assignee:</span>
            <span className="text-gray-400">{assignee}</span>
          </div>
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="text-gray-400">{category}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center bg-gray-800/30">
        <button className="text-xs text-green-400 hover:text-green-300 font-medium">View Details</button>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-xs text-gray-400 hover:text-gray-300 font-medium flex items-center">
            <MoreHorizontal size={14} className="mr-1" />
            Actions
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800/90 backdrop-blur-md border-gray-700 text-gray-300">
            <DropdownMenuItem className="hover:bg-gray-700/50 text-sm">Edit Task</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700/50 text-sm">Mark as Completed</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700/50 text-sm text-red-400">Delete Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
