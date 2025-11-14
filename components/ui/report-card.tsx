import { FileBarChart, MoreHorizontal, Download } from "lucide-react"

interface ReportCardProps {
  title: string
  description: string
  lastGenerated: string
  frequency: string
  format: string
  department: string
  onView?: () => void
  onEdit?: () => void
}

export function ReportCard({ title, description, lastGenerated, frequency, format, department, onView, onEdit }: ReportCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-gray-700 p-2 rounded-md">
            <FileBarChart className="h-5 w-5 text-gray-400" />
          </div>
          <button className="text-gray-500 hover:text-gray-300">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <h3 className="font-medium text-lg mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Last Generated:</span>
            <span className="text-gray-400">{lastGenerated}</span>
          </div>
          <div className="flex justify-between">
            <span>Frequency:</span>
            <span className="text-gray-400">{frequency}</span>
          </div>
          <div className="flex justify-between">
            <span>Format:</span>
            <span className="text-gray-400">{format}</span>
          </div>
          <div className="flex justify-between">
            <span>Department:</span>
            <span className="text-gray-400">{department}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
        <button
          onClick={onView}
          className="text-xs text-green-400 hover:text-green-300 font-medium"
        >
          View Details
        </button>
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
