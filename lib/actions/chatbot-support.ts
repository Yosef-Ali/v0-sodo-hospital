/**
 * Chatbot Support Server Actions
 * Database operations for permits, knowledge base, complaints, and testimonials
 */

"use server"

import { db } from "@/lib/db"
import {
  permits,
  people,
  permitChecklistItems,
  knowledgeBase,
  complaints,
  testimonials,
  complaintUpdates,
  documentsV2,
} from "@/lib/db/schema"
import { eq, and, like, or, desc, sql } from "drizzle-orm"

// ==============================================================================
// PERMIT / TICKET LOOKUP
// ==============================================================================

/**
 * Get permit details by ticket number (format: XXX-YYYY-ZZZZ)
 * Matches against permit ID pattern
 */
export async function getPermitByTicketNumber(ticketNumber: string) {
  try {
    // Extract components from ticket (e.g., "WRK-2024-1234")
    const parts = ticketNumber.split("-")
    if (parts.length !== 3) {
      return { success: false, error: "Invalid ticket number format" }
    }

    // First, try to find a permit by exact ticket number
    let permit = await db.query.permits.findFirst({
      where: eq(permits.ticketNumber, ticketNumber.toUpperCase()),
      with: {
        person: true,
        checklistItems: true,
        history: {
          orderBy: (history, { desc }) => [desc(history.changedAt)],
          limit: 5,
        },
      },
    })

    if (!permit) {
      // Fallback: map prefix to category for older/demo data
      const [prefix] = parts
      const categoryMap: Record<string, string> = {
        WRK: "WORK_PERMIT",
        PER: "WORK_PERMIT",
        RES: "RESIDENCE_ID",
        LIC: "LICENSE",
        PIP: "PIP",
      }

      const mappedCategory = categoryMap[prefix.toUpperCase()]
      if (!mappedCategory) {
        return { success: false, error: "Permit not found" }
      }

      permit = await db.query.permits.findFirst({
        where: eq(permits.category, mappedCategory as any),
        with: {
          person: true,
          checklistItems: true,
          history: {
            orderBy: (history, { desc }) => [desc(history.changedAt)],
            limit: 5,
          },
        },
      })

      if (!permit) {
        return { success: false, error: "Permit not found" }
      }
    }

    // Format response for widget display
    return {
      success: true,
      data: {
        ticketNumber,
        status: permit.status.toLowerCase(),
        type: getCategoryDisplayName(permit.category),
        person: {
          name: `${permit.person.firstName} ${permit.person.lastName}`,
          nationality: permit.person.nationality,
          passportNo: permit.person.passportNo,
          email: permit.person.email,
          phone: permit.person.phone,
        },
        submittedDate: permit.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        lastUpdated: permit.updatedAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        dueDate: permit.dueDate
          ? permit.dueDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null,
        currentStage: getCurrentStage(permit.checklistItems),
        nextAction: getNextAction(permit.checklistItems),
        estimatedCompletion: permit.dueDate
          ? permit.dueDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Pending review",
        notes: permit.notes || "Your application is being processed.",
        timeline: generateTimeline(permit.history, permit.checklistItems),
      },
    }
  } catch (error) {
    console.error("Error fetching permit:", error)
    return { success: false, error: "Failed to fetch permit details" }
  }
}

/**
 * Helper function to get category display name
 */
function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    WORK_PERMIT: "Work Permit Application",
    RESIDENCE_ID: "Residence ID Application",
    LICENSE: "License Application",
    PIP: "PIP Application",
  }
  return names[category] || category
}

/**
 * Helper function to get current stage from checklist items
 */
function getCurrentStage(checklistItems: any[]): string {
  const incomplete = checklistItems.find((item) => !item.completed)
  return incomplete?.label || "Final Review"
}

/**
 * Helper function to get next action
 */
function getNextAction(checklistItems: any[]): string {
  const incomplete = checklistItems.find((item) => !item.completed && item.required)
  return incomplete ? `Please complete: ${incomplete.label}` : "All requirements completed"
}

/**
 * Generate timeline from permit history and checklist
 */
function generateTimeline(history: any[], checklistItems: any[]) {
  const stages = []

  // Add historical status changes
  history.forEach((h) => {
    stages.push({
      name: `Status changed to ${h.toStatus}`,
      status: "completed",
      date: h.changedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      description: h.notes || `Status updated from ${h.fromStatus} to ${h.toStatus}`,
    })
  })

  // Add checklist items as stages
  checklistItems.forEach((item) => {
    stages.push({
      name: item.label,
      status: item.completed ? "completed" : "pending",
      date: item.completedAt
        ? item.completedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      description: item.hint || item.label,
    })
  })

  return stages
}

// ==============================================================================
// KNOWLEDGE BASE Q/A
// ==============================================================================

/**
 * Get uploaded documents linked to a ticket number
 * Uses the document "number" field to store the ticket (e.g., WRK-2025-0001)
 */
export async function getDocumentsByTicketNumber(ticketNumber: string) {
  try {
    const docs = await db
      .select()
      .from(documentsV2)
      .where(eq(documentsV2.number, ticketNumber.toUpperCase()))
      .orderBy(desc(documentsV2.createdAt))

    return { success: true, data: docs }
  } catch (error) {
    console.error("Error fetching documents by ticket:", error)
    return { success: false, error: "Failed to fetch documents" }
  }
}

/**
 * Search knowledge base for answers
 */
export async function searchKnowledgeBase(query: string, category?: string) {
  try {
    const lowerQuery = query.toLowerCase()

    // Build where condition
    const conditions = [eq(knowledgeBase.published, true)]

    if (category) {
      conditions.push(eq(knowledgeBase.category, category))
    }

    // Search in question, answer, and keywords
    const results = await db.query.knowledgeBase.findMany({
      where: and(...conditions),
      orderBy: [desc(knowledgeBase.helpful)],
      limit: 5,
    })

    // Filter and rank results by relevance
    const ranked = results
      .map((kb) => {
        let score = 0
        const questionLower = kb.question.toLowerCase()
        const answerLower = kb.answer.toLowerCase()

        // Exact match in question
        if (questionLower.includes(lowerQuery)) score += 10

        // Word matches in keywords
        const keywords = kb.keywords || []
        keywords.forEach((keyword) => {
          if (lowerQuery.includes(keyword.toLowerCase())) score += 5
        })

        // Word matches in answer
        if (answerLower.includes(lowerQuery)) score += 2

        return { ...kb, score }
      })
      .filter((kb) => kb.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    return {
      success: true,
      data: ranked.map((kb) => ({
        id: kb.id,
        question: kb.question,
        answer: kb.answer,
        category: kb.category,
        helpful: kb.helpful,
        notHelpful: kb.notHelpful,
      })),
    }
  } catch (error) {
    console.error("Error searching knowledge base:", error)
    return { success: false, error: "Failed to search knowledge base" }
  }
}

/**
 * Mark knowledge base article as helpful or not
 */
export async function rateKnowledgeBaseArticle(id: string, helpful: boolean) {
  try {
    if (helpful) {
      await db
        .update(knowledgeBase)
        .set({ helpful: sql`${knowledgeBase.helpful} + 1` })
        .where(eq(knowledgeBase.id, id))
    } else {
      await db
        .update(knowledgeBase)
        .set({ notHelpful: sql`${knowledgeBase.notHelpful} + 1` })
        .where(eq(knowledgeBase.id, id))
    }

    return { success: true }
  } catch (error) {
    console.error("Error rating knowledge base article:", error)
    return { success: false, error: "Failed to rate article" }
  }
}

// ==============================================================================
// COMPLAINTS
// ==============================================================================

/**
 * Submit a new complaint
 */
export async function submitComplaint(data: {
  category: string
  subject: string
  description: string
  relatedPermitId?: string
  contactEmail?: string
  contactPhone?: string
}) {
  try {
    // Generate ticket number: COM-YYYY-XXXX
    const year = new Date().getFullYear()
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const ticketNumber = `COM-${year}-${randomNum}`

    const [complaint] = await db
      .insert(complaints)
      .values({
        ticketNumber,
        category: data.category as any,
        subject: data.subject,
        description: data.description,
        relatedPermitId: data.relatedPermitId,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        status: "OPEN",
      })
      .returning()

    return {
      success: true,
      data: {
        ticketNumber: complaint.ticketNumber,
        message: "Your complaint has been submitted successfully. We'll review it within 24 hours.",
      },
    }
  } catch (error) {
    console.error("Error submitting complaint:", error)
    return { success: false, error: "Failed to submit complaint" }
  }
}

/**
 * Get complaint by ticket number
 */
export async function getComplaintByTicket(ticketNumber: string) {
  try {
    const complaint = await db.query.complaints.findFirst({
      where: eq(complaints.ticketNumber, ticketNumber),
      with: {
        relatedPermit: {
          with: {
            person: true,
          },
        },
      },
    })

    if (!complaint) {
      return { success: false, error: "Complaint not found" }
    }

    // Get updates/comments
    const updates = await db.query.complaintUpdates.findMany({
      where: eq(complaintUpdates.complaintId, complaint.id),
      orderBy: [desc(complaintUpdates.createdAt)],
    })

    return {
      success: true,
      data: {
        ...complaint,
        updates,
      },
    }
  } catch (error) {
    console.error("Error fetching complaint:", error)
    return { success: false, error: "Failed to fetch complaint" }
  }
}

// ==============================================================================
// TESTIMONIALS
// ==============================================================================

/**
 * Submit a testimonial
 */
export async function submitTestimonial(data: {
  name: string
  email?: string
  rating: number
  title?: string
  message: string
  relatedPermitId?: string
}) {
  try {
    const [testimonial] = await db
      .insert(testimonials)
      .values({
        name: data.name,
        email: data.email,
        rating: data.rating,
        title: data.title,
        message: data.message,
        relatedPermitId: data.relatedPermitId,
        status: "PENDING", // Requires approval before publishing
      })
      .returning()

    return {
      success: true,
      data: {
        id: testimonial.id,
        message: "Thank you for your feedback! Your testimonial will be reviewed before publishing.",
      },
    }
  } catch (error) {
    console.error("Error submitting testimonial:", error)
    return { success: false, error: "Failed to submit testimonial" }
  }
}

/**
 * Get published testimonials
 */
export async function getPublishedTestimonials(limit: number = 10) {
  try {
    const results = await db.query.testimonials.findMany({
      where: eq(testimonials.status, "PUBLISHED"),
      orderBy: [desc(testimonials.publishedAt)],
      limit,
    })

    return {
      success: true,
      data: results,
    }
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return { success: false, error: "Failed to fetch testimonials" }
  }
}
