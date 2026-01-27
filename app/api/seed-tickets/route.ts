import { NextResponse } from "next/server"
import { seedTicketNumbers, getAvailableTickets } from "@/lib/actions/seed-tickets"

export async function GET() {
  try {
    // First check available tickets
    const available = await getAvailableTickets()

    if (available.success && available.tickets && available.tickets.length > 0) {
      return NextResponse.json({
        message: "Use these ticket numbers for testing the chatbot:",
        tickets: available.tickets
      })
    }

    // If no tickets, try to seed some
    const seedResult = await seedTicketNumbers()

    if (seedResult.success) {
      // Get updated list
      const updated = await getAvailableTickets()
      return NextResponse.json({
        message: seedResult.message,
        tickets: updated.success ? updated.tickets : seedResult.tickets || seedResult.existingTickets
      })
    }

    return NextResponse.json({ error: seedResult.error }, { status: 400 })
  } catch (error) {
    console.error("Error in seed-tickets API:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
