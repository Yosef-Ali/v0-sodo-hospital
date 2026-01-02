/**
 * A2UI Chat API Route - Pure Google Gemini Implementation
 * Uses existing SODDO Hospital widgets
 */

import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { getHospitalPrompt } from "@/lib/a2ui/prompts"
import { getTicketDetails } from "@/lib/actions/v2/tickets"

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
      model: "gemini-2.5-flash-preview-05-20",
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
Created: ${ticketData.createdAt.toDateString()}
Due Date: ${ticketData.dueDate ? ticketData.dueDate.toDateString() : "N/A"}
Stage: ${ticketData.stage || "N/A"}

[Suggested Actions Context]
Based on the status '${ticketData.status}' and type '${ticketData.type}', suggest relevant Quick Actions to the user.
Example: If status is 'pending', suggest 'Upload Documents' or 'Check Requirements'.
If status is 'completed', suggest 'Download Certificate' or 'View Details'.

User Query: ${message}`
      } else {
        contextMessage = `[User verified ticket ${currentTicket} but data not found in DB] ${message}`
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
    return NextResponse.json(
      { success: false, error: "Chat processing failed" },
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
        // Store verified ticket and fetch status
        if (context?.ticketNumber) {
          verifiedTickets.set(sessionId, context.ticketNumber)
          query = `Show me the status for ticket ${context.ticketNumber}`
        }
        break
      case "view_item":
        query = `Show me details for ${context?.id || "this item"}`
        break
      default:
        query = `User triggered action: ${action} with context: ${JSON.stringify(context)}`
    }

    // Forward to POST handler
    const response = await POST(
      new Request(req.url, {
        method: "POST",
        body: JSON.stringify({ message: query, sessionId }),
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
