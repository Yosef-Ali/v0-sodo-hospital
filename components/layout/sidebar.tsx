"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CheckSquare,
  BarChart,
  Settings,
  LogIn,
  UserCircle,
  ClipboardCheck,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "relative border-r border-gray-700/50 flex flex-col transition-all duration-300 backdrop-blur-md bg-gray-900/40",
        open ? "w-64" : "w-0",
      )}
    >
      <div className="p-4 border-b border-gray-700/50 relative z-10">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-white mr-2"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span className="font-bold text-lg text-white">SODO HOSPITAL</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 relative z-10">
        <ul className="space-y-1 px-2">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={pathname === "/dashboard"} />
          <NavItem href="/people" icon={<UserCircle size={20} />} label="People" active={pathname === "/people"} />
          <NavItem
            href="/permits"
            icon={<ClipboardCheck size={20} />}
            label="Permits"
            active={pathname === "/permits"}
          />
          <NavItem href="/tasks" icon={<CheckSquare size={20} />} label="Tasks" active={pathname === "/tasks"} />
          <NavItem href="/calendar" icon={<Calendar size={20} />} label="Calendar" active={pathname === "/calendar"} />
          <NavItem href="/reports" icon={<BarChart size={20} />} label="Reports" active={pathname === "/reports"} />
          <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" active={pathname === "/settings"} />
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700/50 relative z-10">
        <div className="text-sm text-gray-400 mb-2">
          Sign in to unlock all features and access your personal dashboard.
        </div>
        <Link href="/login" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center">
          <LogIn className="mr-2" size={16} />
          SIGN IN
        </Link>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ReactNode
  active?: boolean
}

function NavItem({ href, label, icon, active }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-green-600/20 to-green-500/20 text-white border border-green-500/20"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
        }`}
      >
        <span className={`mr-3 ${active ? "text-green-400" : ""}`}>{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  )
}
