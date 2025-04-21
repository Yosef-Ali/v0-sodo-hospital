import { FileText, FileCheck, FileWarning, MoreHorizontal, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DocumentCardProps {
  title: string
  description: string
  status: "pending" | "approved" | "review"
  category: string
  fileType: string
  fileSize: string
  lastUpdated: string
  owner: string
}

export function DocumentCard({
  title,
  description,
  status,
  category,
  fileType,
  fileSize,
  lastUpdated,
  owner,
}: DocumentCardProps) {
  const statusColors = {
    pending: "bg-yellow-600",
    approved: "bg-green-600",
    review: "bg-blue-600",
  }

  const statusIcons = {
    pending: <FileWarning className="h-4 w-4" />,
    approved: <FileCheck className="h-4 w-4" />,
    review: <FileText className="h-4 w-4" />,
  }

  const statusLabels = {
    pending: "Pending",
    approved: "Approved",
    review: "Under Review",
  }

  // Format the last updated date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <Badge className={`${statusColors[status]} text-xs font-medium flex items-center gap-1`}>
            {statusIcons[status]}
            {statusLabels[status]}
          </Badge>
          <Badge className="bg-gray-700 text-gray-300 text-xs">{fileType}</Badge>
        </div>
        <h3 className="font-medium text-lg mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="text-gray-400">{category}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="text-gray-400">{fileSize}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated:</span>
            <span className="text-gray-400">{formatDate(lastUpdated)}</span>
          </div>
          <div className="flex justify-between">
            <span>Owner:</span>
            <span className="text-gray-400">{owner}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center bg-gray-800/30">
        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">View Document</button>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-xs text-gray-400 hover:text-gray-300 font-medium flex items-center">
            <MoreHorizontal size={14} className="mr-1" />
            Actions
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800/90 backdrop-blur-md border-gray-700 text-gray-300">
            <DropdownMenuItem className="hover:bg-gray-700/50 text-sm">
              <Download size={14} className="mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700/50 text-sm">Share Document</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700/50 text-sm">Edit Details</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700/50 text-sm text-red-400">Delete Document</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
