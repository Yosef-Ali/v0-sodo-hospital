"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { ChatWidget } from "@/components/ui/chat-widget"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      {/* Animated gradient background effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.15),transparent_50%)] animate-gradient-x"></div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.15),transparent_70%)] animate-gradient-x animation-delay-1000"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        </div>
      </div>

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
