"use server"

import { db } from "@/lib/db"
import { permits, people } from "@/lib/db/schema"
import { eq, isNull } from "drizzle-orm"

/**
 * Add ticket numbers to any permits that don't have them
 * Returns the tickets that were created for testing
 */
export async function seedTicketNumbers() {
  try {
    // Get permits without ticket numbers
    const permitsWithoutTickets = await db
      .select({
        id: permits.id,
        category: permits.category,
        personId: permits.personId,
      })
      .from(permits)
      .where(isNull(permits.ticketNumber))
      .limit(5)

    if (permitsWithoutTickets.length === 0) {
      // Check if there are any permits at all
      const allPermits = await db.select({ id: permits.id, ticketNumber: permits.ticketNumber }).from(permits).limit(5)

      if (allPermits.length === 0) {
        return { success: false, error: "No permits found in database. Please create a permit first." }
      }

      // Return existing tickets
      return {
        success: true,
        message: "All permits already have ticket numbers",
        existingTickets: allPermits.filter(p => p.ticketNumber).map(p => p.ticketNumber)
      }
    }

    const createdTickets: string[] = []
    const year = new Date().getFullYear()

    for (let i = 0; i < permitsWithoutTickets.length; i++) {
      const permit = permitsWithoutTickets[i]

      // Generate ticket based on category
      const prefixMap: Record<string, string> = {
        WORK_PERMIT: "WRK",
        RESIDENCE_ID: "RES",
        MEDICAL_LICENSE: "LIC",
        PIP: "PIP",
        CUSTOMS: "CUS",
        CAR_BOLO_INSURANCE: "BOL"
      }

      const prefix = prefixMap[permit.category] || "PER"
      const ticketNumber = `${prefix}-${year}-${String(i + 1).padStart(4, "0")}`

      await db
        .update(permits)
        .set({ ticketNumber })
        .where(eq(permits.id, permit.id))

      createdTickets.push(ticketNumber)
    }

    return {
      success: true,
      message: `Added ticket numbers to ${createdTickets.length} permits`,
      tickets: createdTickets
    }
  } catch (error) {
    console.error("Error seeding ticket numbers:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get all available ticket numbers for testing
 */
export async function getAvailableTickets() {
  try {
    const result = await db
      .select({
        ticketNumber: permits.ticketNumber,
        category: permits.category,
        status: permits.status,
      })
      .from(permits)
      .limit(10)

    const tickets = result.filter(p => p.ticketNumber)

    return {
      success: true,
      tickets: tickets.map(t => ({
        ticketNumber: t.ticketNumber,
        category: t.category,
        status: t.status
      }))
    }
  } catch (error) {
    console.error("Error getting tickets:", error)
    return { success: false, error: String(error) }
  }
}
