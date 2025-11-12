import { Search, Bell } from "lucide-react"

export function Header() {
  return (
    <header className="bg-gray-900/40 backdrop-blur-md border-b border-gray-700/50 py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks, documents, and users..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-1 rounded-full text-gray-400 hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-gray-900" />
          </button>
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium text-white">Dr. Samuel</span>
            <button className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
