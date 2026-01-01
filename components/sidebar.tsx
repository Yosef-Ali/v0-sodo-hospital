import type React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Calendar,
  Users,
  BarChart,
  Building2,
  MessageSquare,
  HelpCircle,
  Settings,
} from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-blue-600 mr-2"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span className="font-semibold text-lg">Soddo Hospital</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <SidebarItem icon={<CheckSquare size={20} />} label="Tasks" />
          <SidebarItem icon={<FileText size={20} />} label="Documents" />
          <SidebarItem icon={<Calendar size={20} />} label="Calendar" />
          <SidebarItem icon={<Users size={20} />} label="Teams" />
          <SidebarItem icon={<BarChart size={20} />} label="Reports" />
          <SidebarItem icon={<Building2 size={20} />} label="Departments" />
          <SidebarItem icon={<MessageSquare size={20} />} label="Chat" />
          <SidebarItem icon={<HelpCircle size={20} />} label="Help" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" />
        </ul>
      </nav>
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
}

function SidebarItem({ icon, label, active }: SidebarItemProps) {
  return (
    <li>
      <Link
        href="#"
        className={`flex items-center px-4 py-2 text-sm rounded-md ${
          active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <span className="mr-3 text-gray-500">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  )
}
