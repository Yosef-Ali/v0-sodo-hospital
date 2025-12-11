/**
 * OpenAI Chat Widget
 * Enhanced chat widget with OpenAI ChatKit integration
 * Supports context-awareness, approvals, and copilot features
 */

"use client"

import { useOpenAIChat } from "@/hooks/use-openai-chat"
import { ChatMessage } from "@/components/ui/chat-message"
import { ChatInput } from "@/components/ui/chat-input"
import { QuickActions } from "@/components/ui/quick-actions"
import { ApprovalWidget } from "@/components/ui/approval-widget"
import { IntentBadge, AIProcessing, ContextIndicator } from "@/components/ui/ai-widgets"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Bot,
  Sparkles,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface OpenAIChatWidgetProps {
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
  enableCopilot?: boolean
  position?: "landing" | "dashboard"
}

export function OpenAIChatWidget({
  userId,
  userName,
  userEmail,
  userRole,
  enableCopilot = true,
  position = "dashboard",
}: OpenAIChatWidgetProps) {
  const {
    messages,
    isTyping,
    isOpen,
    sessionId,
    pendingApproval,
    toggleChat,
    closeChat,
    sendMessage,
    clearMessages,
    handleApproval,
    messagesEndRef,
  } = useOpenAIChat({
    userId,
    userName,
    userEmail,
    userRole,
    enableCopilot,
  })

  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleApproveAction = (approvalId: string) => {
    handleApproval(approvalId, true)
  }

  const handleRejectAction = (approvalId: string) => {
    handleApproval(approvalId, false)
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          size="lg"
          className={cn(
            "fixed bottom-6 h-14 w-14 rounded-full shadow-lg text-white z-50 group transition-all duration-300 hover:scale-110",
            position === "landing"
              ? "right-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              : "right-6 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          )}
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden",
            isExpanded
              ? "inset-2 sm:inset-4 lg:inset-8"
              : isMinimized
                ? "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[260px] sm:w-[340px] h-14 sm:h-16"
                : "bottom-2 left-2 right-2 h-[70vh] max-h-[640px] sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px] sm:h-[560px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center relative shadow-lg shadow-green-500/30">
                <Bot className="w-6 h-6 text-white" />
                <Sparkles className="w-3 h-3 absolute -top-0.5 -right-0.5 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-white">SODO Hospital Support</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online • Ready to help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear messages */}
              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearMessages}
                  className="text-gray-400 hover:text-green-400 hover:bg-gray-800/50"
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
                className="text-gray-400 hover:text-green-400 hover:bg-gray-800/50"
                title={isExpanded ? "Restore" : "Maximize"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>

              {/* Minimize */}
              {!isExpanded && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-gray-400 hover:text-green-400 hover:bg-gray-800/50"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              )}

              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeChat}
                className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Debug Info */}
          {showDebug && sessionId && (
            <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/50 text-xs space-y-1">
              <div className="text-gray-400">
                <span className="text-gray-500">Session:</span> {sessionId.substring(0, 20)}...
              </div>
              {userId && (
                <div className="text-gray-400">
                  <span className="text-gray-500">User:</span> {userName || userId}
                </div>
              )}
            </div>
          )}

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={message.id} className="space-y-2">
                      {/* Show intent badge for AI messages */}
                      {message.role === "assistant" &&
                        message.metadata?.intent &&
                        message.metadata?.confidence && (
                          <div className="flex justify-end">
                            <IntentBadge
                              intent={message.metadata.intent}
                              confidence={message.metadata.confidence}
                            />
                          </div>
                        )}

                      <ChatMessage
                        message={message}
                        onSuggestionClick={handleSuggestionClick}
                        onSendMessage={sendMessage}
                      />

                      {/* Render approval widget if present */}
                      {message.widgets?.some((w: any) => w.type === "approval-widget") && (
                        <div className="ml-12">
                          {message.widgets
                            .filter((w: any) => w.type === "approval-widget")
                            .map((widget: any, widgetIndex: number) => (
                              <ApprovalWidget
                                key={widgetIndex}
                                approval={widget.data.approval}
                                onApprove={handleApproveAction}
                                onReject={handleRejectAction}
                              />
                            ))}
                        </div>
                      )}

                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="ml-12">
                      <AIProcessing status="Analyzing your request..." />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Pending Approval Warning */}
              {pendingApproval && (
                <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30">
                  <p className="text-xs text-amber-400">
                    ⚠️ Waiting for your approval to proceed
                  </p>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                <ChatInput
                  onSend={sendMessage}
                  disabled={isTyping || !!pendingApproval}
                  placeholder={
                    pendingApproval
                      ? "Approve or reject the action above first..."
                      : "Ask me anything about SODO Hospital..."
                  }
                />
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Powered by OpenAI
                  </span>
                  {enableCopilot && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      Co-pilot active
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
