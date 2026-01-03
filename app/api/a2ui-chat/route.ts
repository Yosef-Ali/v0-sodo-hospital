/**
 * A2UI Chat API Route - Pure Google Gemini Implementation
 * Uses existing SODDO Hospital widgets
 */

import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { getHospitalPrompt } from "@/lib/a2ui/prompts"
import { getTicketDetails, getPermitWithDetails, getPersonPermits } from "@/lib/actions/v2/tickets"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

// Chat history storage (in production, use a database)
const chatSessions = new Map<string, { role: string; parts: { text: string }[] }[]>()

// Verified tickets per session
const verifiedTickets = new Map<string, string>()

export async function POST(req: Request) {
  try {
    const { message, sessionId = "default", verifiedTicket } = await req.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { success: false, error: "GOOGLE_API_KEY not configured" },
        { status: 500 }
      )
    }

    // Store verified ticket if provided
    if (verifiedTicket) {
      verifiedTickets.set(sessionId, verifiedTicket)
    }

    // Get or create chat history
    let history = chatSessions.get(sessionId) || []

    // Use Gemini 2.5 Flash for chat
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: getHospitalPrompt(),
    })

    // Build context-aware message
    let contextMessage = message
    const currentTicket = verifiedTickets.get(sessionId)
    if (currentTicket) {
      // Fetch fresh data for the verified ticket
      const ticketData = await getTicketDetails(currentTicket)

      if (ticketData) {
        contextMessage = `
[SYSTEM CONTEXT: Authenticated User Data]
Ticket: ${currentTicket}
Type: ${ticketData.type}
Title: ${ticketData.title}
Status: ${ticketData.status}
Details: ${ticketData.description || "N/A"}
Created: ${ticketData.createdAt.toISOString()}
Due Date: ${ticketData.dueDate ? ticketData.dueDate.toISOString() : "N/A"}
Stage: ${ticketData.stage || "N/A"}

User Query: ${message}`
        console.log("Chat Context for Gemini:", contextMessage)
      } else {
        contextMessage = `[User verified ticket ${currentTicket} but data not found in DB] ${message}`
        console.log("Ticket Data not found for:", currentTicket)
      }
    }

    // Start chat with history
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    })

    // Send message and get response
    const result = await chat.sendMessage(contextMessage)
    const responseText = result.response.text()

    // Parse response to extract text and A2UI widgets
    const { textResponse, widgets } = parseA2UIResponse(responseText)

    // Update history
    history.push(
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: responseText }] }
    )
    chatSessions.set(sessionId, history)

    return NextResponse.json({
      success: true,
      response: {
        text: textResponse,
        widgets: widgets,
      },
      sessionId,
      verifiedTicket: currentTicket,
    })
  } catch (error) {
    console.error("A2UI Chat Error:", error)
    if (error instanceof Error) {
      console.error("Error Message:", error.message)
      console.error("Error Stack:", error.stack)
    }
    return NextResponse.json(
      { success: false, error: "Chat processing failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Handle button actions from A2UI widgets
export async function PUT(req: Request) {
  try {
    const { action, context, sessionId = "default" } = await req.json()

    // Transform UI action into a natural language query
    let query = ""

    switch (action) {
      case "check_status":
        query = "I want to check my permit status"
        break
      case "upload_document":
        query = "How do I upload a document?"
        break
      case "view_timeline":
        query = "Show me the processing timeline for my permit"
        break
      case "contact_support":
        query = "I need help from customer support"
        break
      case "view_timeline":
        // Show timeline for verified ticket
        const timelineTicket = verifiedTickets.get(sessionId)
        if (timelineTicket) {
          // Check if it's a permit (WRK/RES) or person (FOR)
          const prefix = timelineTicket.split("-")[0].toUpperCase()

          if (prefix === "WRK" || prefix === "RES" || prefix === "LIC") {
            const permitDetails = await getPermitWithDetails(timelineTicket)

            if (permitDetails) {
              const timelineStages = [
                { name: "Application Received", status: "completed" as const, date: new Date(permitDetails.permit.createdAt).toLocaleDateString() },
                { name: "Document Review", status: permitDetails.checklist.progress >= 50 ? "completed" as const : "current" as const },
                { name: "Verification", status: permitDetails.checklist.progress >= 80 ? "completed" as const : "pending" as const },
                { name: "Approval", status: permitDetails.permit.status === "APPROVED" ? "completed" as const : "pending" as const },
                { name: "Ready for Pickup", status: permitDetails.permit.status === "APPROVED" ? "completed" as const : "pending" as const },
              ]

              return NextResponse.json({
                success: true,
                response: {
                  text: `📋 **Processing Timeline**`,
                  widgets: [
                    {
                      widget: "process-timeline",
                      props: {
                        estimatedTotal: permitDetails.permit.dueDate
                          ? `Target: ${new Date(permitDetails.permit.dueDate).toLocaleDateString()}`
                          : "Processing",
                        stages: timelineStages
                      }
                    }
                  ]
                },
                sessionId,
                verifiedTicket: timelineTicket
              })
            }
          } else if (prefix === "FOR") {
            // Show permits for this person
            const personData = await getPersonPermits(timelineTicket)

            if (personData && personData.permits.length > 0) {
              return NextResponse.json({
                success: true,
                response: {
                  text: `📋 **${personData.person.name}** has ${personData.permits.length} permit(s) on record.`,
                  widgets: []
                },
                sessionId,
                verifiedTicket: timelineTicket
              })
            }
          }
        }
        query = "Show me the processing timeline for my permit"
        break
      case "verify_ticket":
        // Store verified ticket and directly return ticket data
        if (context?.ticketNumber) {
          verifiedTickets.set(sessionId, context.ticketNumber)

          const ticketPrefix = context.ticketNumber.split("-")[0].toUpperCase()

          // For permits (WRK/RES), get detailed data with checklist
          if (ticketPrefix === "WRK" || ticketPrefix === "RES" || ticketPrefix === "LIC") {
            const permitDetails = await getPermitWithDetails(context.ticketNumber)

            if (permitDetails) {
              return NextResponse.json({
                success: true,
                response: {
                  text: `✅ **Verified!** ${permitDetails.person.name}'s ${permitDetails.permit.category?.replace(/_/g, " ")} - ${permitDetails.checklist.progress}% complete`,
                  widgets: [
                    {
                      widget: "permit-status",
                      props: {
                        ticketNumber: permitDetails.permit.ticketNumber,
                        status: permitDetails.permit.status.toLowerCase(),
                        type: permitDetails.permit.category?.replace(/_/g, " ") || "Permit",
                        personName: permitDetails.person.name,
                        submittedDate: new Date(permitDetails.permit.createdAt).toLocaleDateString(),
                        lastUpdated: new Date(permitDetails.permit.updatedAt).toLocaleDateString(),
                        currentStage: `${permitDetails.checklist.completed}/${permitDetails.checklist.total} documents`,
                        estimatedCompletion: permitDetails.permit.dueDate
                          ? new Date(permitDetails.permit.dueDate).toLocaleDateString()
                          : "N/A"
                      }
                    }
                  ]
                },
                sessionId,
                verifiedTicket: context.ticketNumber
              })
            }
          }

          // For other types (FOR, VEH, IMP, CMP), use basic ticket details
          const ticketData = await getTicketDetails(context.ticketNumber)

          if (ticketData) {
            return NextResponse.json({
              success: true,
              response: {
                text: `✅ **Verified!** ${ticketData.title} - ${ticketData.status}`,
                widgets: [
                  {
                    widget: "permit-status",
                    props: {
                      ticketNumber: ticketData.ticketNumber,
                      status: ticketData.status,
                      type: ticketData.type,
                      personName: ticketData.title,
                      submittedDate: new Date(ticketData.createdAt).toLocaleDateString(),
                      lastUpdated: new Date(ticketData.updatedAt).toLocaleDateString(),
                      currentStage: ticketData.stage || "Active",
                      estimatedCompletion: ticketData.dueDate ? new Date(ticketData.dueDate).toLocaleDateString() : "N/A"
                    }
                  }
                ]
              },
              sessionId,
              verifiedTicket: context.ticketNumber
            })
            return NextResponse.json({
              success: true,
              response: {
                text: `❌ **Ticket not found.** Please check #{context.ticketNumber} and try again.`,
                widgets: [
                  {
                    widget: "ticket-verification",
                    props: { placeholder: "e.g., FOR-001006" }
                  }
                ]
              },
              sessionId
            })
          }
        }
        break
      case "view_item":
        query = `Show me details for ${context?.id || "this item"}`
        break
      default:
        query = `User triggered action: ${action} with context: ${JSON.stringify(context)}`
    }

    // Get verified ticket for this session
    const verifiedTicket = verifiedTickets.get(sessionId)

    // Forward to POST handler with verified ticket
    const response = await POST(
      new Request(req.url, {
        method: "POST",
        body: JSON.stringify({ message: query, sessionId, verifiedTicket }),
      })
    )

    return response
  } catch (error) {
    console.error("A2UI Action Error:", error)
    return NextResponse.json(
      { success: false, error: "Action processing failed" },
      { status: 500 }
    )
  }
}

// Parse Gemini response to extract text and A2UI widgets
function parseA2UIResponse(response: string): {
  textResponse: string
  widgets: any[]
} {
  const delimiter = "---a2ui_JSON---"
  const parts = response.split(delimiter)

  if (parts.length === 1) {
    // No A2UI JSON, just text
    return { textResponse: response.trim(), widgets: [] }
  }

  const textResponse = parts[0].trim()
  const jsonPart = parts[1]?.trim()

  if (!jsonPart) {
    return { textResponse, widgets: [] }
  }

  try {
    // Clean up JSON (remove markdown code blocks if present)
    const cleanJson = jsonPart
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    const parsed = JSON.parse(cleanJson)

    // Handle both array and single widget format
    const widgets = Array.isArray(parsed) ? parsed : [parsed]

    return { textResponse, widgets }
  } catch (error) {
    console.error("Failed to parse A2UI JSON:", error, jsonPart)
    return { textResponse, widgets: [] }
  }
}
