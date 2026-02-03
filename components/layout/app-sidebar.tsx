"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  CheckSquare,
  BarChart,
  Settings,
  UserCircle,
  ClipboardCheck,
  Calendar,
  Sparkles,
  BookOpen,
  Package,
  Car,
  Building2,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserButton } from "@/components/auth/user-button"

type MenuItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[] // If undefined, visible to all roles
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Foreigners",
    url: "/foreigners",
    icon: Users,
    roles: ["ADMIN", "HR_MANAGER", "HR"],
  },
  {
    title: "Import",
    url: "/import",
    icon: Package,
    roles: ["ADMIN", "HR_MANAGER", "LOGISTICS"],
  },
  {
    title: "Vehicle",
    url: "/vehicle",
    icon: Car,
    roles: ["ADMIN", "HR_MANAGER", "LOGISTICS"],
  },
  {
    title: "Company",
    url: "/company",
    icon: Building2,
    roles: ["ADMIN", "HR_MANAGER"],
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart,
  },
  {
    title: "Admin Guide",
    url: "/admin-guide",
    icon: BookOpen,
    roles: ["ADMIN"],
  },
  {
    title: "Widgets Demo",
    url: "/widgets-demo",
    icon: Sparkles,
    roles: ["ADMIN"],
  },
  {
    title: "Users",
    url: "/users",
    icon: UserCircle,
    roles: ["ADMIN"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
]

import { useOrganization } from "@/hooks/use-organization"

// ... (keep existing imports)

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const { data: session } = useSession()
  const { settings, isLoading } = useOrganization()

  // Get user role from session
  const userRole = (session?.user as { role?: string })?.role || "USER"

  console.log("Current User Role:", userRole)
  console.log("Session:", session)

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    // If no roles specified, item is visible to all
    if (!item.roles) return true
    
    // Check if user's role is in the allowed roles
    const hasAccess = item.roles.includes(userRole)
    if (!hasAccess && item.roles) {
      console.log(`Hiding ${item.title} (Requires: ${item.roles.join(", ")})`)
    }
    return hasAccess
  })

  console.log("Visible Menu Items:", filteredMenuItems.map(i => i.title))

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" onClick={handleNavClick}>
                {settings?.logoUrl ? (
                  <div className={`flex items-center justify-center ${state === "collapsed" ? "size-8" : "h-10"}`}>
                    <img 
                      src={settings.logoUrl} 
                      alt={settings.name} 
                      className={`object-contain ${state === "collapsed" ? "size-8" : "h-full w-auto max-w-[180px]"}`}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                )}
                {(!settings?.logoUrl || state === "expanded") && (
                   <div className={`grid flex-1 text-left text-sm leading-tight ${settings?.logoUrl && state === "expanded" ? "ml-2" : ""}`}>
                     <span className="truncate font-semibold">{settings?.name || "Soddo"}</span>
                     <span className="truncate text-xs text-muted-foreground">Permit Management</span>
                   </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url} className="flex items-center" onClick={handleNavClick}>
                      <item.icon className={pathname === item.url ? "text-green-500" : "text-gray-400"} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {session?.user && <UserButton user={session.user} />}
        <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border/50">
          Debug Role: <span className="font-mono font-bold text-yellow-500">{userRole}</span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
