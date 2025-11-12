"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { ChatWidget } from "@/components/ui/chat-widget"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background Effects - Match landing page */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-400/10 via-transparent to-transparent pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/5 via-transparent to-transparent pointer-events-none z-0"></div>

      <TopBar />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Customer Support Chat Widget */}
      <ChatWidget />
    </div>
  )
}
