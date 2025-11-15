"use client"

import { useState } from "react"
import {
  TicketVerificationWidget,
  PermitStatusWidget,
  UploadGuideWidget,
  ProcessTimelineWidget
} from "@/components/ui/chat-widgets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles } from "lucide-react"

export default function WidgetsDemoPage() {
  const [ticketSubmitted, setTicketSubmitted] = useState(false)
  const [verifiedTicket, setVerifiedTicket] = useState("")

  const handleTicketSubmit = (ticketNumber: string) => {
    console.log("Ticket submitted:", ticketNumber)
    setVerifiedTicket(ticketNumber)
    setTicketSubmitted(true)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Customer Support Widgets Demo</h1>
            <p className="text-gray-400 mt-1">The "Sale Point" - Beautiful inline support widgets</p>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Why These Widgets Shine ✨</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span><strong>Zero Context Switching</strong> - Everything happens in chat, no redirects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span><strong>Security First</strong> - Ticket verification before personal data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span><strong>Beautiful Design</strong> - Professional dark theme with green accents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span><strong>Fully Interactive</strong> - Upload, download, verify all inline</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Demo */}
      <Tabs defaultValue="ticket-verification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700">
          <TabsTrigger value="ticket-verification" className="data-[state=active]:bg-green-600">
            🎫 Verification
          </TabsTrigger>
          <TabsTrigger value="permit-status" className="data-[state=active]:bg-green-600">
            📋 Status
          </TabsTrigger>
          <TabsTrigger value="upload-guide" className="data-[state=active]:bg-green-600">
            📤 Upload
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-green-600">
            ⏱️ Timeline
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ticket Verification Widget */}
        <TabsContent value="ticket-verification" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">🎫 Ticket Verification Widget</CardTitle>
              <CardDescription className="text-gray-400">
                Secure customer identity verification before sharing personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Widget Preview:</h4>
                <div className="bg-gray-950 rounded-lg p-4">
                  <TicketVerificationWidget
                    onSubmit={handleTicketSubmit}
                    placeholder="Try: PER-2024-1234 or WRK-2024-5678"
                  />
                  {ticketSubmitted && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-400">
                        ✓ Ticket {verifiedTicket} verified successfully!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Key Features:</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Real-time format validation (XXX-YYYY-ZZZZ)</li>
                  <li>• Shows accepted formats inline</li>
                  <li>• Loading states during verification</li>
                  <li>• Beautiful green gradient design</li>
                  <li>• Security-first messaging</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Permit Status Widget */}
        <TabsContent value="permit-status" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">📋 Permit Status Widget</CardTitle>
              <CardDescription className="text-gray-400">
                Complete permit/document status display with all details inline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Widget Preview:</h4>
                <div className="bg-gray-950 rounded-lg p-4">
                  <PermitStatusWidget
                    ticketNumber="WRK-2024-5678"
                    status="processing"
                    type="Work Permit Application"
                    submittedDate="Jan 15, 2025"
                    lastUpdated="Jan 18, 2025"
                    currentStage="Document Review - Medical Clearance"
                    nextAction="Please upload your health insurance certificate"
                    estimatedCompletion="Jan 25, 2025"
                    notes="Your passport and employment contract have been verified. Awaiting medical documents."
                    documentLinks={[
                      {
                        name: "Application Receipt.pdf",
                        url: "#"
                      },
                      {
                        name: "Requirements Checklist.pdf",
                        url: "#"
                      }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">Status Types:</h4>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Pending (amber)</li>
                    <li>• Processing (green pulsing)</li>
                    <li>• Approved (green)</li>
                    <li>• Rejected (red)</li>
                    <li>• Expired (gray)</li>
                  </ul>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">Information:</h4>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Timeline dates</li>
                    <li>• Current stage</li>
                    <li>• Next actions required</li>
                    <li>• Reviewer notes</li>
                    <li>• Downloadable documents</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Upload Guide Widget */}
        <TabsContent value="upload-guide" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">📤 Upload Guide Widget</CardTitle>
              <CardDescription className="text-gray-400">
                Step-by-step document upload instructions with interactive guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Widget Preview:</h4>
                <div className="bg-gray-950 rounded-lg p-4">
                  <UploadGuideWidget
                    documentType="Health Insurance Certificate"
                    currentStep={1}
                    requirements={[
                      "Valid health insurance certificate (PDF or JPG)",
                      "Certificate must be in English or Amharic",
                      "File size under 5MB",
                      "Must be dated within last 3 months"
                    ]}
                    steps={[
                      {
                        title: "Prepare your document",
                        description: "Scan or photograph your health certificate clearly",
                        completed: true
                      },
                      {
                        title: "Choose file to upload",
                        description: "Click the button below to select your file",
                        action: {
                          label: "Select File",
                          onClick: () => alert("File selector would open here")
                        }
                      },
                      {
                        title: "Verify upload",
                        description: "Review the document preview before submitting",
                        completed: false
                      },
                      {
                        title: "Submit",
                        description: "Confirm and submit your document for review",
                        completed: false
                      }
                    ]}
                    tips={[
                      "Ensure all text in the document is clearly readable",
                      "Remove any passwords from PDF files before uploading",
                      "You can upload multiple files if needed",
                      "Processing typically takes 1-2 business days"
                    ]}
                  />
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-amber-400 mb-2">Interactive Features:</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Visual step progression with checkmarks</li>
                  <li>• Active step highlighted in green</li>
                  <li>• Action buttons for each step</li>
                  <li>• Requirements checklist with blue accent</li>
                  <li>• Helpful tips section with amber accent</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Process Timeline Widget */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">⏱️ Process Timeline Widget</CardTitle>
              <CardDescription className="text-gray-400">
                Visual timeline showing all process stages with current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Widget Preview:</h4>
                <div className="bg-gray-950 rounded-lg p-4">
                  <ProcessTimelineWidget
                    estimatedTotal="10-14 days"
                    stages={[
                      {
                        name: "Application Submission",
                        status: "completed",
                        date: "Jan 15, 2025",
                        description: "Application received and validated",
                        duration: "1 day"
                      },
                      {
                        name: "Document Verification",
                        status: "completed",
                        date: "Jan 17, 2025",
                        description: "Passport and employment contract verified",
                        duration: "2 days"
                      },
                      {
                        name: "Medical Review",
                        status: "current",
                        description: "Health certificate under review",
                        duration: "2-3 days"
                      },
                      {
                        name: "Background Check",
                        status: "pending",
                        description: "Security and criminal record verification",
                        duration: "3-5 days"
                      },
                      {
                        name: "Final Approval",
                        status: "pending",
                        description: "Management approval and permit issuance",
                        duration: "2 days"
                      },
                      {
                        name: "Permit Ready",
                        status: "pending",
                        description: "Permit available for collection or delivery",
                        duration: "1 day"
                      }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">Visual Elements:</h4>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Vertical timeline with connecting line</li>
                    <li>• Animated pulsing dot for current stage</li>
                    <li>• Green checkmarks for completed stages</li>
                    <li>• Gray dots for pending stages</li>
                  </ul>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">Information:</h4>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Stage names and descriptions</li>
                    <li>• Completion dates</li>
                    <li>• Duration estimates</li>
                    <li>• Total estimated time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Guide */}
      <Card className="bg-gray-800 border-gray-700 mt-8">
        <CardHeader>
          <CardTitle className="text-white">📝 How to Use in Chat</CardTitle>
          <CardDescription className="text-gray-400">
            The AI assistant returns these widgets based on user questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 text-blue-400 rounded-full p-2 flex-shrink-0">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">User asks: "Check my permit status"</p>
                  <p className="text-xs text-gray-400">→ AI shows Ticket Verification Widget</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 text-green-400 rounded-full p-2 flex-shrink-0">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">User enters: "WRK-2024-5678"</p>
                  <p className="text-xs text-gray-400">→ AI shows Permit Status Widget with full details</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500/20 text-amber-400 rounded-full p-2 flex-shrink-0">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">User asks: "How do I upload documents?"</p>
                  <p className="text-xs text-gray-400">→ AI shows Upload Guide Widget with step-by-step instructions</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 text-purple-400 rounded-full p-2 flex-shrink-0">
                  <span className="text-sm font-bold">4</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">User asks: "How long will this take?"</p>
                  <p className="text-xs text-gray-400">→ AI shows Process Timeline Widget with all stages</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400 font-semibold mb-2">✨ Key Advantage:</p>
            <p className="text-sm text-gray-300">
              User gets <strong className="text-white">complete support entirely within the chat</strong> -
              no redirects to dashboards, no context switching, no confusion.
              This is the <strong className="text-green-400">"sale point"</strong> that makes SODO Hospital stand out!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
