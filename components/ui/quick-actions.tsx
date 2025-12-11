"use client"

import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle, Map } from "lucide-react"
import { QUICK_ACTIONS } from "@/lib/chat-context"

interface QuickActionsProps {
  onActionClick: (prompt: string) => void
}

const iconMap = {
  FileText,
  Clock,
  CheckCircle,
  Map
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
        Suggested Actions
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {QUICK_ACTIONS.map(action => {
          const Icon = iconMap[action.icon as keyof typeof iconMap]
          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.prompt)}
              className="group flex items-center gap-4 p-3 rounded-xl glass-card hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-primary/50 text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 relative z-10">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 relative z-10">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Click to start this workflow
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
