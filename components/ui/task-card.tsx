import { Clock, CheckCircle, AlertCircle, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface TaskCardProps {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "urgent"
  dueDate: string
  assignee: string
  category: string
  priority?: "low" | "medium" | "high"
  onEdit?: () => void
}

export function TaskCard({
  id,
  title,
  description,
  status,
  dueDate,
  assignee,
  category,
  priority = "medium",
  onEdit,
}: TaskCardProps) {
  const statusColors = {
    pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    "in-progress": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    urgent: "bg-red-500/10 text-red-400 border border-red-500/20",
  }

  const statusIcons = {
    pending: <Clock className="h-3.5 w-3.5" />,
    "in-progress": <AlertCircle className="h-3.5 w-3.5" />,
    completed: <CheckCircle className="h-3.5 w-3.5" />,
    urgent: <AlertCircle className="h-3.5 w-3.5" />,
  }

  const priorityColors = {
    low: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    medium: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    high: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  }

  // Format the due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-gray-700 p-2 rounded-md">
            <CheckCircle className="h-5 w-5 text-gray-400" />
          </div>
          <Badge className={`${statusColors[status]} text-xs font-medium flex items-center gap-1`}>
            {statusIcons[status]}
            {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
          </Badge>
        </div>
        <h3 className="font-medium text-lg mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Due Date:</span>
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
          <div className="flex justify-between">
            <span>Priority:</span>
            <span className={`${priorityColors[priority].includes('slate') ? 'text-slate-400' : priorityColors[priority].includes('orange') ? 'text-orange-400' : 'text-rose-400'}`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
        <Link href={`/tasks/${id}`} className="text-xs text-green-400 hover:text-green-300 font-medium">
          View Task
        </Link>
        <button
          onClick={onEdit}
          className="text-xs text-gray-400 hover:text-gray-300 font-medium"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
