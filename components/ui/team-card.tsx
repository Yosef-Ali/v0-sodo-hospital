import { Users, MoreHorizontal } from "lucide-react"

interface TeamCardProps {
  name: string
  description: string
  memberCount: number
  leadName: string
  leadTitle: string
  tags: string[]
}

export function TeamCard({ name, description, memberCount, leadName, leadTitle, tags }: TeamCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-gray-700 p-2 rounded-md">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <button className="text-gray-500 hover:text-gray-300">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <h3 className="font-medium text-lg mb-2 text-white">{name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>

        <div className="flex items-center mb-4">
          <div className="flex -space-x-2 mr-3">
            {[...Array(Math.min(3, memberCount))].map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs text-white"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {memberCount > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-white">
                +{memberCount - 3}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-400">{memberCount} members</span>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Team Lead:</span>
            <span className="text-gray-400">{leadName}</span>
          </div>
          <div className="flex justify-between">
            <span>Lead Title:</span>
            <span className="text-gray-400">{leadTitle}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">View Team</button>
        <button className="text-xs text-gray-400 hover:text-gray-300 font-medium">Manage Members</button>
      </div>
    </div>
  )
}
