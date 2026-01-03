import { NextResponse } from "next/server"
import { db, users, checklists, people, permits } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log("🌱 Starting database seed...")

    // 1. Create admin user
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@soddohospital.com"),
    })

    let adminUser
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Admin123!", 10)
      const [admin] = await db
        .insert(users)
        .values({
          email: "admin@soddohospital.com",
          name: "System Administrator",
          password: hashedPassword,
          role: "ADMIN",
          locale: "en",
        })
        .returning()
      adminUser = admin
    } else {
      adminUser = existingAdmin
    }

    // 2. Create checklist templates
    const [workPermitChecklist] = await db
      .insert(checklists)
      .values({
        name: "Work Permit Checklist",
        category: "WORK_PERMIT",
        items: [
          {
            label: "Passport copy (valid for at least 6 months)",
            required: true,
            hint: "Must include biographical data page",
          },
          {
            label: "Employment contract signed by both parties",
            required: true,
            hint: "Original contract with official stamps",
          },
          {
            label: "Educational certificates",
            required: true,
            hint: "Degree, diploma, or professional certificates",
          },
          {
            label: "Health certificate",
            required: true,
            hint: "HIV/AIDS test, TB screening - issued within last 3 months",
          },
          {
            label: "Passport-size photos (4 copies)",
            required: true,
            hint: "White background, recent photos",
          },
        ],
        version: 1,
        active: true,
        createdBy: adminUser.id,
      })
      .returning()
      .onConflictDoNothing()

    const [residenceChecklist] = await db
      .insert(checklists)
      .values({
        name: "Residence ID Checklist",
        category: "RESIDENCE_ID",
        items: [
          {
            label: "Passport copy with valid visa",
            required: true,
            hint: "Must show entry stamp and current visa",
          },
          {
            label: "Proof of residence",
            required: true,
            hint: "Rental agreement or employer letter",
          },
          {
            label: "Passport-size photos (2 copies)",
            required: true,
          },
          {
            label: "Application form completed",
            required: true,
          },
        ],
        version: 1,
        active: true,
        createdBy: adminUser.id,
      })
      .returning()
      .onConflictDoNothing()

    const [licenseChecklist] = await db
      .insert(checklists)
      .values({
        name: "Professional License Checklist",
        category: "LICENSE",
        items: [
          {
            label: "Professional qualification certificates",
            required: true,
            hint: "Medical degree, nursing diploma, etc.",
          },
          {
            label: "Experience letters",
            required: true,
            hint: "From previous employers",
          },
          {
            label: "License from home country",
            required: false,
            hint: "If applicable",
          },
          {
            label: "Good standing certificate",
            required: true,
            hint: "From professional body",
          },
        ],
        version: 1,
        active: true,
        createdBy: adminUser.id,
      })
      .returning()
      .onConflictDoNothing()

    // 3. Create sample people
    const [person1] = await db
      .insert(people)
      .values({
        firstName: "Dr. Sarah",
        lastName: "Johnson",
        nationality: "United States",
        passportNo: "US123456789",
        email: "sarah.johnson@soddohospital.com",
        phone: "+251-11-555-0101",
      })
      .returning()
      .onConflictDoNothing()

    const [person2] = await db
      .insert(people)
      .values({
        firstName: "Nurse Maria",
        lastName: "Garcia",
        nationality: "Philippines",
        passportNo: "PH987654321",
        email: "maria.garcia@soddohospital.com",
        phone: "+251-11-555-0102",
      })
      .returning()
      .onConflictDoNothing()

    // 4. Create sample permits
    if (person1 && workPermitChecklist) {
      await db
        .insert(permits)
        .values({
          category: "WORK_PERMIT",
          status: "PENDING",
          personId: person1.id,
          checklistId: workPermitChecklist.id,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          notes: "Initial work permit application for Dr. Johnson",
        })
        .onConflictDoNothing()
    }

    if (person2 && residenceChecklist) {
      await db
        .insert(permits)
        .values({
          category: "RESIDENCE_ID",
          status: "SUBMITTED",
          personId: person2.id,
          checklistId: residenceChecklist.id,
          dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          notes: "Residence ID renewal for Nurse Garcia",
        })
        .onConflictDoNothing()
    }

    return NextResponse.json({
      success: true,
      message: "✅ Database seeded successfully!",
      data: {
        admin: {
          email: "admin@soddohospital.com",
          password: "Admin123!",
          role: "ADMIN",
        },
        checklists: 3,
        people: 2,
        permits: 2,
      },
    })
  } catch (error: any) {
    console.error("❌ Seed error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
