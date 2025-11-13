"use client"

import { cn } from "@/lib/utils"
import type { Message } from "@/lib/chat-context"
import { Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ActionCardWidget,
  ProgressWidget,
  ListWidget,
  DocumentCardWidget,
  MetricCardWidget,
  QuickActionButtonsWidget,
  StatusBadgeWidget,
  DatePickerWidget
} from "@/components/ui/chat-widgets"

interface ChatMessageProps {
  message: Message
  onSuggestionClick?: (suggestion: string) => void
}

export function ChatMessage({ message, onSuggestionClick }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-green-600 text-white"
            : "bg-gradient-to-br from-green-500 to-green-600 text-white"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 max-w-[80%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-100 border border-gray-700"
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1 h-4 ml-1 bg-green-400 animate-pulse" />
            )}
          </div>

          {/* Action Link */}
          {isAssistant && message.metadata?.link && !message.isStreaming && (
            <Link href={message.metadata.link}>
              <Button
                variant="link"
                className="mt-2 p-0 h-auto text-green-400 hover:text-green-300 text-xs"
              >
                Go to {message.metadata.link.replace("/", "")} →
              </Button>
            </Link>
          )}
        </div>

        {/* Widgets */}
        {isAssistant && message.widgets && !message.isStreaming && (
          <div className="mt-3 space-y-2">
            {message.widgets.map((widget, idx) => {
              switch (widget.type) {
                case "action-card":
                  return <ActionCardWidget key={idx} {...widget.data} />
                case "progress":
                  return <ProgressWidget key={idx} {...widget.data} />
                case "list":
                  return <ListWidget key={idx} {...widget.data} />
                case "document-card":
                  return <DocumentCardWidget key={idx} {...widget.data} />
                case "metric-card":
                  return <MetricCardWidget key={idx} {...widget.data} />
                case "quick-actions":
                  return <QuickActionButtonsWidget key={idx} {...widget.data} />
                case "status-badge":
                  return <StatusBadgeWidget key={idx} {...widget.data} />
                case "date-picker":
                  return <DatePickerWidget key={idx} {...widget.data} />
                default:
                  return null
              }
            })}
          </div>
        )}

        {/* Suggestions */}
        {isAssistant && message.metadata?.suggestions && !message.isStreaming && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.metadata.suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-xs bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-green-500 text-gray-300 hover:text-white transition-all"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={cn("text-xs text-gray-500 mt-1 px-1", isUser && "text-right")}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
      </div>
    </div>
  )
}
