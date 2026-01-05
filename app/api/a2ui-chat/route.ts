/**
 * A2UI Chat API Route - Pure Google Gemini Implementation
 * Uses existing SODDO Hospital widgets
 */

import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { getHospitalPrompt } from "@/lib/a2ui/prompts"
import { getTicketDetails } from "@/lib/actions/v2/tickets"
import { getGoogleApiKey } from "@/lib/api-keys"

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

    // Get API key from settings or env
    const apiKey = await getGoogleApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Google API Key not configured. Please add it in Dashboard > Settings > AI Services" },
        { status: 500 }
      )
    }

    // Initialize Gemini with the API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Store verified ticket if provided
    if (verifiedTicket) {
      verifiedTickets.set(sessionId, verifiedTicket)
    }

    // Get or create chat history
    let history = chatSessions.get(sessionId) || []

    // Use Gemini 2.0 Flash for chat
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
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
      case "verify_ticket":
        // Store verified ticket and directly return ticket data
        if (context?.ticketNumber) {
          verifiedTickets.set(sessionId, context.ticketNumber)

          // Directly fetch ticket data and return it
          const ticketData = await getTicketDetails(context.ticketNumber)

          if (ticketData) {
            // Return the data directly with appropriate widget
            return NextResponse.json({
              success: true,
              response: {
                text: `✅ Ticket verified! Here's the status for **${ticketData.title}**:`,
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
                      notes: ticketData.description,
                      estimatedCompletion: ticketData.dueDate ? new Date(ticketData.dueDate).toLocaleDateString() : "N/A"
                    }
                  },
                  {
                    widget: "quick-actions",
                    props: {
                      actions: [
                        { label: "View Timeline", action: "view_timeline" },
                        { label: "Upload Document", action: "upload_document" },
                        { label: "Contact Support", action: "contact_support" }
                      ]
                    }
                  }
                ]
              },
              sessionId,
              verifiedTicket: context.ticketNumber
            })
          } else {
            // Ticket not found
            return NextResponse.json({
              success: true,
              response: {
                text: `❌ **Ticket not found:** The ticket number \`${context.ticketNumber}\` was not found in our system. Please check the number and try again.\n\nValid ticket formats:\n- **FOR-XXXXXX** - Foreigner Profile\n- **VEH-XXXXXX** - Vehicle Registration\n- **IMP-XXXXXX** - Import Permit\n- **CMP-XXXXXX** - Company Registration`,
                widgets: [
                  {
                    widget: "ticket-verification",
                    props: { placeholder: "e.g., FOR-001001" }
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
