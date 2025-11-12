"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { cn } from "@/lib/utils"
import { Building2, Users, ClipboardList, FileText } from "lucide-react"

const settingsNavItems = [
  {
    title: "Organization",
    href: "/settings",
    icon: Building2,
    exact: true,
  },
  {
    title: "Users & Roles",
    href: "/settings/users",
    icon: Users,
  },
  {
    title: "Checklists",
    href: "/settings/checklists",
    icon: ClipboardList,
    adminOnly: true,
  },
  {
    title: "Templates",
    href: "/settings/templates",
    icon: FileText,
  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="p-8">
      <PageHeader title="Settings" description="Manage your organization, users, and system preferences." />

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {/* Sub-navigation */}
        <div className="border-b border-gray-700 bg-gray-800/50">
          <nav className="flex space-x-1 p-1" aria-label="Settings navigation">
            {settingsNavItems.map((item) => {
              const Icon = item.icon
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) && item.href !== "/settings"

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-gray-700 text-white border-b-2 border-green-500"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.title}
                  {item.adminOnly && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded">
                      Admin
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Content area */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
