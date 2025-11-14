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
    <Link href={`/tasks/${id}`} className="block">
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden hover:border-green-500/50 transition-all duration-200 flex flex-col cursor-pointer">
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
        <span className="text-xs text-gray-400">Click to view details</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.preventDefault()}
            className="text-xs text-gray-400 hover:text-gray-300 font-medium flex items-center"
          >
            <MoreHorizontal size={14} className="mr-1" />
            Actions
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800/90 backdrop-blur-md border-gray-700 text-gray-300">
            <Link href={`/tasks/${id}/edit`} onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem className="hover:bg-gray-700/50 text-sm">Edit Task</DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="hover:bg-gray-700/50 text-sm">Mark as Completed</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700/50 text-sm text-red-400">Delete Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    </Link>
  )
}
