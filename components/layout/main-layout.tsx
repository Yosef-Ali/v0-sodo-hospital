"use client"

import type React from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { A2UIChatWidget } from "@/components/a2ui"
import { UserMenu } from "@/components/layout/user-menu"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-400/10 via-transparent to-transparent pointer-events-none"></div>

        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700/50 px-4 bg-gray-900/40 backdrop-blur-md sticky top-0 z-10">
          <SidebarTrigger className="-ml-1 text-gray-400 hover:text-white" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-700/50" />
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium text-white">Soddo Christian Hospital</span>
            <span>|</span>
            <span>Permit Management System</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500"></span>
            </Button>
            <UserMenu />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto relative z-0">
          {children}
        </div>
      </SidebarInset>

      {/* AI Support Chat Widget - Pure Google A2UI + Gemini */}
      <A2UIChatWidget />
    </SidebarProvider>
  )
}
