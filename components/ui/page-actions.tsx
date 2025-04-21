import { Search, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageActionsProps {
  searchPlaceholder: string
  buttonText: string
}

export function PageActions({ searchPlaceholder, buttonText }: PageActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-64 text-gray-300"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="text-sm font-normal border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
      <Button size="sm" className="text-sm font-normal bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  )
}
