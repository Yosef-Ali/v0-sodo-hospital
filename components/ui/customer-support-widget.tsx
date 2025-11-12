"use client"

import { useCustomerSupport } from "@/hooks/use-customer-support"
import { ChatMessage } from "@/components/ui/chat-message"
import { ChatInput } from "@/components/ui/chat-input"
import { TicketForm } from "@/components/ui/ticket-form"
import { FAQSection } from "@/components/ui/faq-section"
import { LimitationsSection } from "@/components/ui/limitations-section"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  X,
  MessageCircle,
  Ticket,
  BookOpen,
  AlertCircle,
  Sparkles,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { SupportTicket } from "@/lib/customer-support-context"

export function CustomerSupportWidget() {
  const {
    messages,
    isTyping,
    isOpen,
    activeTab,
    toggleSupport,
    closeSupport,
    setActiveTab,
    sendMessage,
    clearMessages,
    messagesEndRef
  } = useCustomerSupport()

  const [ticketCount, setTicketCount] = useState(0)

  const handleTicketSubmit = (ticket: Partial<SupportTicket>) => {
    console.log("Ticket submitted:", ticket)
    setTicketCount(prev => prev + 1)
    // In production, this would send to your backend
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  return (
    <>
      {/* Floating Support Button */}
      {!isOpen && (
        <Button
          onClick={toggleSupport}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-green-500 to-green-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white z-50 group transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none"
        >
          <HelpCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
        </Button>
      )}

      {/* Support Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[450px] h-[700px] z-50 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative p-6 border-b border-gray-700 bg-gradient-to-r from-green-500/10 to-green-600/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10" />

            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold text-white text-lg">Customer Support</h3>
                </div>
                <p className="text-sm text-gray-400">
                  We're here to help 24/7
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Online</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400">Response time: &lt;5 min</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={closeSupport}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-b border-gray-700 rounded-none">
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-green-400"
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="ticket"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-green-400 relative"
              >
                <Ticket className="w-4 h-4 mr-1.5" />
                Ticket
                {ticketCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 text-xs bg-blue-600">
                    {ticketCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="faq"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-green-400"
              >
                <BookOpen className="w-4 h-4 mr-1.5" />
                FAQ
              </TabsTrigger>
              <TabsTrigger
                value="limitations"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-green-400"
              >
                <AlertCircle className="w-4 h-4 mr-1.5" />
                Limits
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onSuggestionClick={handleSuggestionClick}
                    />
                  ))}

                  {isTyping && (
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
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

              <ChatInput
                onSend={sendMessage}
                disabled={isTyping}
                placeholder="Ask about features, pricing, demos..."
              />
            </TabsContent>

            {/* Ticket Tab */}
            <TabsContent value="ticket" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <Ticket className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-400 mb-1">Submit a Support Ticket</h4>
                      <p className="text-sm text-gray-400">
                        Get detailed assistance from our support team. We typically respond within 24 hours.
                      </p>
                    </div>
                  </div>

                  <TicketForm onSubmit={handleTicketSubmit} />
                </div>
              </ScrollArea>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full p-6">
                <FAQSection />
              </ScrollArea>
            </TabsContent>

            {/* Limitations Tab */}
            <TabsContent value="limitations" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full p-6">
                <LimitationsSection />
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="border-t border-gray-700 bg-gray-800/50 px-4 py-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Powered by SODO Hospital</span>
              <a
                href="#"
                className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
              >
                Visit Help Center
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
