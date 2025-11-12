"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { ChatWidget } from "@/components/ui/chat-widget"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex flex-col h-screen text-slate-100 relative">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto relative z-10">{children}</main>
      </div>

      {/* Customer Support Chat Widget */}
      <ChatWidget />
    </div>
  )
}
