import { Building2, MoreHorizontal } from "lucide-react"

interface DepartmentCardProps {
  name: string
  description: string
  staffCount: number
  headName: string
  location: string
  metrics: { label: string; value: string }[]
}

export function DepartmentCard({ name, description, staffCount, headName, location, metrics }: DepartmentCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-gray-700 p-2 rounded-md">
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <button className="text-gray-500 hover:text-gray-300">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <h3 className="font-medium text-lg mb-2 text-white">{name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>

        <div className="flex items-center mb-4">
          <div className="w-7 h-7 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs text-white mr-2">
            {staffCount}
          </div>
          <span className="text-sm text-gray-400">{staffCount} staff members</span>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Department Head:</span>
            <span className="text-gray-400">{headName}</span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="text-gray-400">{location}</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Key Metrics</h4>
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-gray-700 p-2 rounded">
              <div className="text-xs text-gray-400">{metric.label}</div>
              <div className="text-sm font-medium text-white">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
        <button className="text-xs text-green-400 hover:text-green-300 font-medium">View Department</button>
        <button className="text-xs text-gray-400 hover:text-gray-300 font-medium">Manage Staff</button>
      </div>
    </div>
  )
}
