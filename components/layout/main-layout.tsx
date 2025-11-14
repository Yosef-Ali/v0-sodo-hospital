"use client"

import type React from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ChatWidget } from "@/components/ui/chat-widget"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700/50 px-4 bg-gray-900/40 backdrop-blur-md sticky top-0 z-10">
          <SidebarTrigger className="-ml-1 text-gray-400 hover:text-white" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-700/50" />
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium text-white">SODO Hospital</span>
            <span>|</span>
            <span>Permit Management System</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>

      {/* Customer Support Chat Widget */}
      <ChatWidget />
    </SidebarProvider>
  )
}
