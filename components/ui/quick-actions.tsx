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
    <div className="p-4 border-b border-gray-700">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map(action => {
          const Icon = iconMap[action.icon as keyof typeof iconMap]
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => onActionClick(action.prompt)}
              className="justify-start gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-blue-500 text-gray-300 hover:text-white transition-all h-auto py-3"
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{action.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
