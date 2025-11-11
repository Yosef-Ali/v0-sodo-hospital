"use client"

import { cn } from "@/lib/utils"
import type { Message } from "@/lib/chat-context"
import { Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
            ? "bg-blue-600 text-white"
            : "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
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
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-100 border border-gray-700"
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1 h-4 ml-1 bg-blue-400 animate-pulse" />
            )}
          </div>

          {/* Action Link */}
          {isAssistant && message.metadata?.link && !message.isStreaming && (
            <Link href={message.metadata.link}>
              <Button
                variant="link"
                className="mt-2 p-0 h-auto text-blue-400 hover:text-blue-300 text-xs"
              >
                Go to {message.metadata.link.replace("/", "")} →
              </Button>
            </Link>
          )}
        </div>

        {/* Suggestions */}
        {isAssistant && message.metadata?.suggestions && !message.isStreaming && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.metadata.suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-xs bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-blue-500 text-gray-300 hover:text-white transition-all"
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
