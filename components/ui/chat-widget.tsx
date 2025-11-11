"use client"

import { useChat } from "@/hooks/use-chat"
import { ChatMessage } from "@/components/ui/chat-message"
import { ChatInput } from "@/components/ui/chat-input"
import { QuickActions } from "@/components/ui/quick-actions"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Bot
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function ChatWidget() {
  const {
    messages,
    isTyping,
    isOpen,
    toggleChat,
    closeChat,
    sendMessage,
    clearMessages,
    messagesEndRef
  } = useChat()

  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white z-50 group transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl transition-all duration-300",
            isExpanded
              ? "inset-4 lg:inset-8"
              : isMinimized
                ? "bottom-6 right-6 w-80 h-16"
                : "bottom-6 right-6 w-96 h-[600px]",
            "flex flex-col"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Support Assistant</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear messages */}
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearMessages}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              {/* Minimize/Maximize */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isMinimized) {
                    setIsMinimized(false)
                  } else {
                    setIsExpanded(!isExpanded)
                  }
                }}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
                title={isExpanded ? "Restore" : "Maximize"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>

              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeChat}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content - only show when not minimized */}
          {!isMinimized && (
            <>
              {/* Quick Actions - show only when no messages */}
              {messages.length === 0 && (
                <QuickActions onActionClick={handleSuggestionClick} />
              )}

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onSuggestionClick={handleSuggestionClick}
                    />
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                          <span
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <ChatInput
                onSend={sendMessage}
                disabled={isTyping}
                placeholder="Ask me anything about the system..."
              />
            </>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div
              className="flex items-center justify-between px-4 cursor-pointer flex-1"
              onClick={() => setIsMinimized(false)}
            >
              <span className="text-sm text-gray-400">Click to restore chat</span>
              <Maximize2 className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      )}
    </>
  )
}
