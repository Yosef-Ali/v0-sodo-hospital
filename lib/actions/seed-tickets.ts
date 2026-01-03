"use server"

import { db } from "@/lib/db"
import { permits, people, vehicles, importPermits, companyRegistrations } from "@/lib/db/schema"
import { eq, isNull, sql } from "drizzle-orm"

/**
 * Add ticket numbers to all entities that don't have them
 * Supports: people (FOR-*), permits (WRK-*, RES-*), vehicles (VEH-*), imports (IMP-*), companies (CMP-*)
 */
export async function seedTicketNumbers() {
  try {
    const createdTickets: { type: string; ticketNumber: string }[] = []

    // 1. Seed People (Foreigners) - FOR-XXXXXX format
    const peopleWithoutTickets = await db
      .select({ id: people.id, firstName: people.firstName, lastName: people.lastName })
      .from(people)
      .where(isNull(people.ticketNumber))
      .limit(10)

    // Get current max FOR ticket number
    const maxForTicket = await db
      .select({ ticketNumber: people.ticketNumber })
      .from(people)
      .where(sql`${people.ticketNumber} LIKE 'FOR-%'`)
      .orderBy(sql`${people.ticketNumber} DESC`)
      .limit(1)

    let forCounter = 1
    if (maxForTicket.length > 0 && maxForTicket[0].ticketNumber) {
      const match = maxForTicket[0].ticketNumber.match(/FOR-(\d+)/)
      if (match) forCounter = parseInt(match[1]) + 1
    }

    for (const person of peopleWithoutTickets) {
      const ticketNumber = `FOR-${String(forCounter).padStart(6, "0")}`
      await db.update(people).set({ ticketNumber }).where(eq(people.id, person.id))
      createdTickets.push({ type: "Foreigner", ticketNumber })
      forCounter++
    }

    // 2. Seed Vehicles - VEH-XXXXXX format
    const vehiclesWithoutTickets = await db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(isNull(vehicles.ticketNumber))
      .limit(10)

    const maxVehTicket = await db
      .select({ ticketNumber: vehicles.ticketNumber })
      .from(vehicles)
      .where(sql`${vehicles.ticketNumber} LIKE 'VEH-%'`)
      .orderBy(sql`${vehicles.ticketNumber} DESC`)
      .limit(1)

    let vehCounter = 1
    if (maxVehTicket.length > 0 && maxVehTicket[0].ticketNumber) {
      const match = maxVehTicket[0].ticketNumber.match(/VEH-(\d+)/)
      if (match) vehCounter = parseInt(match[1]) + 1
    }

    for (const vehicle of vehiclesWithoutTickets) {
      const ticketNumber = `VEH-${String(vehCounter).padStart(6, "0")}`
      await db.update(vehicles).set({ ticketNumber }).where(eq(vehicles.id, vehicle.id))
      createdTickets.push({ type: "Vehicle", ticketNumber })
      vehCounter++
    }

    // 3. Seed Imports - IMP-XXXXXX format
    const importsWithoutTickets = await db
      .select({ id: importPermits.id })
      .from(importPermits)
      .where(isNull(importPermits.ticketNumber))
      .limit(10)

    const maxImpTicket = await db
      .select({ ticketNumber: importPermits.ticketNumber })
      .from(importPermits)
      .where(sql`${importPermits.ticketNumber} LIKE 'IMP-%'`)
      .orderBy(sql`${importPermits.ticketNumber} DESC`)
      .limit(1)

    let impCounter = 1
    if (maxImpTicket.length > 0 && maxImpTicket[0].ticketNumber) {
      const match = maxImpTicket[0].ticketNumber.match(/IMP-(\d+)/)
      if (match) impCounter = parseInt(match[1]) + 1
    }

    for (const imp of importsWithoutTickets) {
      const ticketNumber = `IMP-${String(impCounter).padStart(6, "0")}`
      await db.update(importPermits).set({ ticketNumber }).where(eq(importPermits.id, imp.id))
      createdTickets.push({ type: "Import", ticketNumber })
      impCounter++
    }

    // 4. Seed Companies - CMP-XXXXXX format
    const companiesWithoutTickets = await db
      .select({ id: companyRegistrations.id })
      .from(companyRegistrations)
      .where(isNull(companyRegistrations.ticketNumber))
      .limit(10)

    const maxCmpTicket = await db
      .select({ ticketNumber: companyRegistrations.ticketNumber })
      .from(companyRegistrations)
      .where(sql`${companyRegistrations.ticketNumber} LIKE 'CMP-%'`)
      .orderBy(sql`${companyRegistrations.ticketNumber} DESC`)
      .limit(1)

    let cmpCounter = 1
    if (maxCmpTicket.length > 0 && maxCmpTicket[0].ticketNumber) {
      const match = maxCmpTicket[0].ticketNumber.match(/CMP-(\d+)/)
      if (match) cmpCounter = parseInt(match[1]) + 1
    }

    for (const company of companiesWithoutTickets) {
      const ticketNumber = `CMP-${String(cmpCounter).padStart(6, "0")}`
      await db.update(companyRegistrations).set({ ticketNumber }).where(eq(companyRegistrations.id, company.id))
      createdTickets.push({ type: "Company", ticketNumber })
      cmpCounter++
    }

    // 5. Seed Permits (legacy format) - WRK-YYYY-XXXX, RES-YYYY-XXXX
    const permitsWithoutTickets = await db
      .select({ id: permits.id, category: permits.category })
      .from(permits)
      .where(isNull(permits.ticketNumber))
      .limit(10)

    const year = new Date().getFullYear()
    const prefixMap: Record<string, string> = {
      WORK_PERMIT: "WRK",
      RESIDENCE_ID: "RES",
      MEDICAL_LICENSE: "LIC",
      PIP: "PIP",
      CUSTOMS: "CUS",
      CAR_BOLO_INSURANCE: "BOL"
    }

    for (let i = 0; i < permitsWithoutTickets.length; i++) {
      const permit = permitsWithoutTickets[i]
      const prefix = prefixMap[permit.category] || "PER"
      const ticketNumber = `${prefix}-${year}-${String(i + 1).padStart(4, "0")}`
      await db.update(permits).set({ ticketNumber }).where(eq(permits.id, permit.id))
      createdTickets.push({ type: permit.category, ticketNumber })
    }

    if (createdTickets.length === 0) {
      // No entities without tickets, return existing ones
      const existingTickets = await getAllExistingTickets()
      return {
        success: true,
        message: "All entities already have ticket numbers",
        existingTickets
      }
    }

    return {
      success: true,
      message: `Added ticket numbers to ${createdTickets.length} entities`,
      tickets: createdTickets
    }
  } catch (error) {
    console.error("Error seeding ticket numbers:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Helper to get all existing tickets across all entity types
 */
async function getAllExistingTickets() {
  const results: { type: string; ticketNumber: string | null }[] = []

  const peopleTickets = await db
    .select({ ticketNumber: people.ticketNumber })
    .from(people)
    .where(sql`${people.ticketNumber} IS NOT NULL`)
    .limit(5)
  results.push(...peopleTickets.map(p => ({ type: "Foreigner", ticketNumber: p.ticketNumber })))

  const vehicleTickets = await db
    .select({ ticketNumber: vehicles.ticketNumber })
    .from(vehicles)
    .where(sql`${vehicles.ticketNumber} IS NOT NULL`)
    .limit(5)
  results.push(...vehicleTickets.map(v => ({ type: "Vehicle", ticketNumber: v.ticketNumber })))

  const importTickets = await db
    .select({ ticketNumber: importPermits.ticketNumber })
    .from(importPermits)
    .where(sql`${importPermits.ticketNumber} IS NOT NULL`)
    .limit(5)
  results.push(...importTickets.map(i => ({ type: "Import", ticketNumber: i.ticketNumber })))

  const companyTickets = await db
    .select({ ticketNumber: companyRegistrations.ticketNumber })
    .from(companyRegistrations)
    .where(sql`${companyRegistrations.ticketNumber} IS NOT NULL`)
    .limit(5)
  results.push(...companyTickets.map(c => ({ type: "Company", ticketNumber: c.ticketNumber })))

  const permitTickets = await db
    .select({ ticketNumber: permits.ticketNumber, category: permits.category })
    .from(permits)
    .where(sql`${permits.ticketNumber} IS NOT NULL`)
    .limit(5)
  results.push(...permitTickets.map(p => ({ type: p.category, ticketNumber: p.ticketNumber })))

  return results.filter(r => r.ticketNumber)
}

/**
 * Get all available ticket numbers for testing (across all entity types)
 */
export async function getAvailableTickets() {
  try {
    const allTickets = await getAllExistingTickets()

    if (allTickets.length === 0) {
      return {
        success: false,
        error: "No ticket numbers found. Run /api/seed-tickets first to generate them.",
        tickets: []
      }
    }

    return {
      success: true,
      tickets: allTickets.map(t => ({
        ticketNumber: t.ticketNumber,
        type: t.type
      }))
    }
  } catch (error) {
    console.error("Error getting tickets:", error)
    return { success: false, error: String(error) }
  }
}
