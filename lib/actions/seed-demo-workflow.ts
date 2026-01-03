"use server"

import { db } from "@/lib/db"
import { people, permits, permitHistory, permitChecklistItems, checklists, users } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

/**
 * Seed a complete demo workflow for customer demonstration
 * Creates: Person → Work Permit → Checklist Items → History Timeline
 */
export async function seedDemoWorkflow() {
  try {
    // Get admin user for references
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@soddohospital.com"),
    })

    if (!adminUser) {
      return { success: false, error: "Admin user not found. Run /api/seed first." }
    }

    // Get work permit checklist
    const workPermitChecklist = await db.query.checklists.findFirst({
      where: (checklists, { eq }) => eq(checklists.category, "WORK_PERMIT"),
    })

    // ============ 1. CREATE DEMO FOREIGNER ============
    const demoTicketNumber = "FOR-000100"
    
    // Check if already exists
    const existingPerson = await db.query.people.findFirst({
      where: (people, { eq }) => eq(people.ticketNumber, demoTicketNumber),
    })

    let demoPerson
    if (existingPerson) {
      demoPerson = existingPerson
    } else {
      const [newPerson] = await db.insert(people).values({
        ticketNumber: demoTicketNumber,
        firstName: "Sarah",
        lastName: "Johnson",
        nationality: "United States",
        gender: "FEMALE",
        familyStatus: "MARRIED",
        passportNo: "US987654321",
        passportIssueDate: new Date("2022-01-15"),
        passportExpiryDate: new Date("2032-01-14"),
        email: "sarah.johnson@demo.com",
        phone: "+251-91-234-5678",
        photoUrl: null,
        permitType: "WORK_PERMIT",
        applicationType: "NEW",
        currentStage: "DOCUMENT_ARRANGEMENT",
      }).returning()
      demoPerson = newPerson
    }

    // ============ 2. CREATE WORK PERMIT (Processing Stage) ============
    const permitTicketNumber = "WRK-2026-0100"
    
    const existingPermit = await db.query.permits.findFirst({
      where: (permits, { eq }) => eq(permits.ticketNumber, permitTicketNumber),
    })

    let demoPermit
    if (existingPermit) {
      demoPermit = existingPermit
    } else {
      const [newPermit] = await db.insert(permits).values({
        ticketNumber: permitTicketNumber,
        category: "WORK_PERMIT",
        subType: "NEW",
        status: "SUBMITTED",
        personId: demoPerson.id,
        checklistId: workPermitChecklist?.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: "New work permit application for Dr. Sarah Johnson - Pediatric Specialist",
      }).returning()
      demoPermit = newPermit
    }

    // ============ 3. CREATE CHECKLIST ITEMS ============
    const checklistItems = [
      { label: "Passport copy (valid for at least 6 months)", required: true, completed: true },
      { label: "Employment contract signed by both parties", required: true, completed: true },
      { label: "Educational certificates (authenticated)", required: true, completed: true },
      { label: "Health certificate (HIV/AIDS, TB screening)", required: true, completed: false },
      { label: "Passport-size photos (4 copies)", required: true, completed: true },
      { label: "Police clearance certificate", required: true, completed: false },
      { label: "Medical license from home country", required: false, completed: true },
    ]

    // Delete existing checklist items for this permit
    await db.delete(permitChecklistItems).where(eq(permitChecklistItems.permitId, demoPermit.id))

    // Insert new checklist items
    for (const item of checklistItems) {
      await db.insert(permitChecklistItems).values({
        permitId: demoPermit.id,
        label: item.label,
        required: item.required,
        completed: item.completed,
        completedBy: item.completed ? adminUser.id : null,
        completedAt: item.completed ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        notes: item.completed ? "Verified and approved" : null,
      })
    }

    // ============ 4. CREATE PERMIT HISTORY (Timeline) ============
    // Delete existing history
    await db.delete(permitHistory).where(eq(permitHistory.permitId, demoPermit.id))

    const historyEntries = [
      { fromStatus: "PENDING", toStatus: "PENDING", notes: "Application received and registered", daysAgo: 14 },
      { fromStatus: "PENDING", toStatus: "SUBMITTED", notes: "Initial documents submitted for review", daysAgo: 12 },
      { fromStatus: "SUBMITTED", toStatus: "SUBMITTED", notes: "Passport copy verified", daysAgo: 10 },
      { fromStatus: "SUBMITTED", toStatus: "SUBMITTED", notes: "Employment contract approved", daysAgo: 8 },
      { fromStatus: "SUBMITTED", toStatus: "SUBMITTED", notes: "Educational certificates authenticated", daysAgo: 5 },
      { fromStatus: "SUBMITTED", toStatus: "SUBMITTED", notes: "Awaiting health certificate and police clearance", daysAgo: 2 },
    ]

    for (const entry of historyEntries) {
      await db.insert(permitHistory).values({
        permitId: demoPermit.id,
        fromStatus: entry.fromStatus as any,
        toStatus: entry.toStatus as any,
        changedBy: adminUser.id,
        notes: entry.notes,
        changedAt: new Date(Date.now() - entry.daysAgo * 24 * 60 * 60 * 1000),
      })
    }

    // ============ 5. CREATE ADDITIONAL DEMO PERMITS ============
    
    // Approved Residence ID
    const resTicketNumber = "RES-2026-0100"
    const existingRes = await db.query.permits.findFirst({
      where: (permits, { eq }) => eq(permits.ticketNumber, resTicketNumber),
    })

    if (!existingRes) {
      await db.insert(permits).values({
        ticketNumber: resTicketNumber,
        category: "RESIDENCE_ID",
        status: "APPROVED",
        personId: demoPerson.id,
        dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        notes: "Residence ID approved and ready for pickup",
      })
    }

    return {
      success: true,
      message: "✅ Demo workflow created successfully!",
      data: {
        foreigner: {
          ticketNumber: demoTicketNumber,
          name: `${demoPerson.firstName} ${demoPerson.lastName}`,
          nationality: demoPerson.nationality,
        },
        workPermit: {
          ticketNumber: permitTicketNumber,
          status: "SUBMITTED (In Processing)",
          checklistProgress: "5/7 items completed",
          nextAction: "Upload Health Certificate and Police Clearance",
        },
        residenceId: {
          ticketNumber: resTicketNumber,
          status: "APPROVED",
        },
        testInChatbot: [
          `Try: "Check status for ${permitTicketNumber}"`,
          `Try: "What documents are pending for ${demoTicketNumber}?"`,
          `Try: "Show timeline for ${permitTicketNumber}"`,
        ]
      }
    }
  } catch (error) {
    console.error("Error seeding demo workflow:", error)
    return { success: false, error: String(error) }
  }
}
