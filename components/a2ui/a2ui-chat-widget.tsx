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
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, FormEvent } from "react"
import ReactMarkdown from "react-markdown"

export function A2UIChatWidget() {
  const {
    messages,
    isTyping,
    isOpen,
    verifiedTicket,
    error,
    toggleChat,
    closeChat,
    sendMessage,
    retryLastAction,
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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white z-40 group transition-all duration-300 hover:scale-110"
        >
          <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-40 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl transition-all duration-500 ease-out border border-gray-700/50",
            isExpanded
              ? "inset-2 sm:inset-4 lg:inset-12"
              : isMinimized
                ? "bottom-4 right-4 w-72 h-16 sm:bottom-6 sm:right-6 sm:w-80"
                : "bottom-0 right-0 left-0 h-[85vh] sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px] sm:h-[650px] sm:rounded-2xl rounded-t-2xl rounded-b-none",
            "flex flex-col overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700/50 bg-gray-800/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                  AI Assistant
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    A2UI
                  </span>
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  {verifiedTicket ? (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="truncate max-w-[120px] sm:max-w-none">{verifiedTicket}</span>
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
              <ScrollArea className="flex-1 px-4 py-4 overflow-hidden">
                <div className="space-y-6 overflow-hidden">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.role === "user" ? (
                        /* User Message - Right aligned with avatar */
                        <div className="flex flex-row-reverse gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500/20 border border-blue-500/30">
                            <User className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl px-4 py-3">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ) : (
                        /* Assistant Message - Refactored Design */
                        <div className="flex gap-3">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-800 border border-gray-700">
                            <Bot className="w-4 h-4 text-green-400" />
                          </div>
                          
                          {/* Content Container */}
                          <div className="flex-1 min-w-0 space-y-4 overflow-hidden">
                            {/* Text Content */}
                            {message.content && (
                              <div className="bg-transparent pl-1 text-sm text-gray-200 leading-relaxed">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <span className="font-bold text-white">{children}</span>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-gray-300">{children}</li>,
                                    a: ({ href, children }) => (
                                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                                        {children}
                                      </a>
                                    ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                            
                            {/* Widgets */}
                            {message.widgets && message.widgets.length > 0 && (
                              <div className="pt-2">
                                <A2UIRenderer
                                  widgets={message.widgets}
                                  onAction={handleAction}
                                  onVerify={handleVerify}
                                  className="space-y-3"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Error State */}
                  {error && (
                    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                       <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500/10 border border-red-500/20">
                         <AlertCircle className="w-4 h-4 text-red-400" />
                       </div>
                       <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex-1 flex items-center justify-between gap-3">
                         <p className="text-sm text-red-200">{error}</p>
                         <Button 
                           size="sm" 
                           variant="outline" 
                           className="h-7 bg-red-500/10 border-red-500/30 text-red-300 hover:text-white hover:bg-red-500/30"
                           onClick={retryLastAction}
                         >
                           <RefreshCw className="w-3 h-3 mr-1.5" />
                           Retry
                         </Button>
                       </div>
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="bg-gray-800/50 rounded-2xl px-4 py-3 flex items-center">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-gray-700/50 safe-area-bottom">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about permits, documents..."
                    disabled={isTyping}
                    className="flex-1 bg-gray-800 border-gray-700 focus:border-green-500 focus:ring-green-500/20 text-sm sm:text-base"
                  />
                  <Button
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className="bg-green-600 hover:bg-green-700 px-3 sm:px-4"
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
