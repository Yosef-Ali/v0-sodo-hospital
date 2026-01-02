"use client"

/**
 * A2UI Chat Widget - Pure Google A2UI + Gemini
 * Uses existing SODDO Hospital widgets
 */

import { useA2UIChat } from "@/hooks/use-a2ui-chat"
import { A2UIRenderer } from "@/components/a2ui/a2ui-renderer"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Bot,
  Send,
  User,
  Sparkles,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, FormEvent } from "react"

export function A2UIChatWidget() {
  const {
    messages,
    isTyping,
    isOpen,
    verifiedTicket,
    toggleChat,
    closeChat,
    sendMessage,
    handleAction,
    handleVerify,
    clearMessages,
    messagesEndRef,
  } = useA2UIChat()

  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput("")
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white z-50 group transition-all duration-300 hover:scale-110"
        >
          <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl transition-all duration-500 ease-out border border-gray-700/50",
            isExpanded
              ? "inset-4 lg:inset-12"
              : isMinimized
                ? "bottom-6 right-6 w-80 h-16"
                : "bottom-6 right-6 w-[420px] h-[650px]",
            "flex flex-col overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  AI Assistant
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    A2UI
                  </span>
                </h3>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  {verifiedTicket ? (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-400" />
                      Verified: {verifiedTicket}
                    </span>
                  ) : (
                    "Powered by Gemini"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearMessages}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeChat}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          message.role === "user"
                            ? "bg-blue-500/20 border border-blue-500/30"
                            : "bg-gradient-to-br from-green-500 to-emerald-600"
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="max-w-[85%] space-y-3">
                        {/* Text */}
                        {message.content && (
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3",
                              message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 border border-gray-700 text-gray-100"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}

                        {/* A2UI Widgets */}
                        {message.widgets && message.widgets.length > 0 && (
                          <A2UIRenderer
                            widgets={message.widgets}
                            onAction={handleAction}
                            onVerify={handleVerify}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700/50">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about permits, documents..."
                    disabled={isTyping}
                    className="flex-1 bg-gray-800 border-gray-700 focus:border-green-500 focus:ring-green-500/20"
                  />
                  <Button
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default A2UIChatWidget
