import { db, users, checklists, people, permits, tasksV2, calendarEvents, activityLogs } from "./index"
import bcrypt from "bcryptjs"

async function seedMVP() {
  try {
    console.log("🌱 Seeding MVP entities...")

    // Create admin user if not exists
    console.log("Creating admin user...")
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@example.org"),
    })

    let adminUser
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Admin123!", 10)
      const [admin] = await db
        .insert(users)
        .values({
          email: "admin@example.org",
          name: "System Administrator",
          password: hashedPassword,
          role: "ADMIN",
          locale: "en",
        })
        .returning()
      adminUser = admin
      console.log("✓ Created admin user (admin@example.org / Admin123!)")
    } else {
      adminUser = existingAdmin
      console.log("✓ Admin user already exists")
    }

    // Seed checklists
    console.log("Creating permit checklists...")

    // 1. Work Permit Checklist (8 items)
    const [workPermitChecklist] = await db
      .insert(checklists)
      .values({
        name: "Work Permit Checklist",
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
            label: "Educational certificates (degree, diploma, or professional certificates)",
            required: true,
            hint: "Certified copies or originals",
          },
          {
            label: "Professional license (if applicable)",
            required: false,
            hint: "For doctors, nurses, and other licensed professions",
          },
          {
            label: "Health certificate (HIV/AIDS test, TB screening)",
            required: true,
            hint: "Must be issued within the last 3 months",
          },
          {
            label: "Passport-size photos (4 copies)",
            required: true,
            hint: "White background, recent photos",
          },
          {
            label: "Letter from Ministry of Health or relevant authority",
            required: true,
            hint: "Approval for employment of foreign national",
          },
          {
            label: "Company registration documents and tax clearance",
            required: true,
            hint: "Hospital's legal documents",
          },
        ],
      })
      .returning()
      .onConflictDoNothing()

    // 2. Residence ID Checklist (5 items)
    const [residenceIdChecklist] = await db
      .insert(checklists)
      .values({
        name: "Residence ID Checklist",
        items: [
          {
            label: "Passport copy with valid visa",
            required: true,
            hint: "Must show entry stamp and current visa",
          },
          {
            label: "Proof of residence (rental agreement or employer letter)",
            required: true,
            hint: "Must include physical address in Ethiopia",
          },
          {
            label: "Work permit copy",
            required: true,
            hint: "Current approved work permit",
          },
          {
            label: "Passport-size photos (6 copies)",
            required: true,
            hint: "White background, recent photos",
          },
          {
            label: "Application form from Immigration Office",
            required: true,
            hint: "Completed and signed application form",
          },
        ],
      })
      .returning()
      .onConflictDoNothing()

    // 3. MOH License Checklist (5 items)
    const [mohLicenseChecklist] = await db
      .insert(checklists)
      .values({
        name: "Ministry of Health License Checklist",
        items: [
          {
            label: "Medical/Nursing degree certificates",
            required: true,
            hint: "Original or certified copies with official translation if needed",
          },
          {
            label: "Professional registration from home country",
            required: true,
            hint: "Certificate of good standing",
          },
          {
            label: "Work experience letters (minimum 2 years)",
            required: true,
            hint: "From previous employers with official letterhead",
          },
          {
            label: "Health certificate and vaccination records",
            required: true,
            hint: "Must include hepatitis B and other required vaccinations",
          },
          {
            label: "MOH application form and processing fee receipt",
            required: true,
            hint: "Completed application with payment confirmation",
          },
        ],
      })
      .returning()
      .onConflictDoNothing()

    // 4. EFDA PIP Checklist (5 items)
    const [efdaPipChecklist] = await db
      .insert(checklists)
      .values({
        name: "EFDA Product Import Permit (PIP) Checklist",
        items: [
          {
            label: "Proforma invoice from supplier",
            required: true,
            hint: "Official invoice showing product details and quantities",
          },
          {
            label: "Product registration certificates",
            required: true,
            hint: "EFDA registration for pharmaceutical products",
          },
          {
            label: "Business license and tax identification number",
            required: true,
            hint: "Hospital's current business license",
          },
          {
            label: "Detailed product specifications and safety data sheets",
            required: true,
            hint: "Technical specifications and MSDS documents",
          },
          {
            label: "Letter of intent from hospital administration",
            required: true,
            hint: "Official request for import permit",
          },
        ],
      })
      .returning()
      .onConflictDoNothing()

    console.log("✓ Created 4 permit checklists")

    // Seed sample people
    console.log("Creating sample people...")

    const [person1] = await db
      .insert(people)
      .values({
        firstName: "John",
        lastName: "Smith",
        nationality: "United Kingdom",
        passportNo: "GB123456789",
        phone: "+251911234567",
        email: "john.smith@example.com",
      })
      .returning()
      .onConflictDoNothing()

    const [person2] = await db
      .insert(people)
      .values({
        firstName: "Sarah",
        lastName: "Johnson",
        nationality: "United States",
        passportNo: "US987654321",
        phone: "+251922345678",
        email: "sarah.johnson@example.com",
      })
      .returning()
      .onConflictDoNothing()

    const [person3] = await db
      .insert(people)
      .values({
        firstName: "Michael",
        lastName: "Chen",
        nationality: "Canada",
        passportNo: "CA456789123",
        phone: "+251933456789",
        email: "michael.chen@example.com",
      })
      .returning()
      .onConflictDoNothing()

    // Create a dependent
    const [dependent1] = await db
      .insert(people)
      .values({
        firstName: "Emma",
        lastName: "Smith",
        nationality: "United Kingdom",
        passportNo: "GB987654321",
        guardianId: person1?.id,
      })
      .returning()
      .onConflictDoNothing()

    console.log("✓ Created 4 sample people (including 1 dependent)")

    // Seed sample permits
    console.log("Creating sample permits...")

    if (person1 && workPermitChecklist) {
      await db
        .insert(permits)
        .values({
          category: "WORK_PERMIT",
          status: "PENDING",
          personId: person1.id,
          dueDate: new Date("2025-08-15"),
          dueDateEC: "2017-12-07", // Ethiopian calendar equivalent
          checklistId: workPermitChecklist.id,
          notes: "Initial work permit application for medical staff",
        })
        .onConflictDoNothing()
    }

    if (person1 && residenceIdChecklist) {
      await db
        .insert(permits)
        .values({
          category: "RESIDENCE_ID",
          status: "SUBMITTED",
          personId: person1.id,
          dueDate: new Date("2025-09-01"),
          dueDateEC: "2017-12-24",
          checklistId: residenceIdChecklist.id,
          notes: "Residence ID application following work permit approval",
        })
        .onConflictDoNothing()
    }

    if (person2 && mohLicenseChecklist) {
      await db
        .insert(permits)
        .values({
          category: "LICENSE",
          status: "APPROVED",
          personId: person2.id,
          dueDate: new Date("2025-12-31"),
          dueDateEC: "2018-04-23",
          checklistId: mohLicenseChecklist.id,
          notes: "MOH nursing license for Sarah Johnson",
        })
        .onConflictDoNothing()
    }

    if (person3 && efdaPipChecklist) {
      await db
        .insert(permits)
        .values({
          category: "PIP",
          status: "PENDING",
          personId: person3.id,
          dueDate: new Date("2025-06-30"),
          dueDateEC: "2017-10-22",
          checklistId: efdaPipChecklist.id,
          notes: "Product import permit for medical supplies",
        })
        .onConflictDoNothing()
    }

    console.log("✓ Created 4 sample permits")

    // Get created permits for tasks and calendar events
    const allPermits = await db.query.permits.findMany()
    const permit1 = allPermits[0]
    const permit2 = allPermits[1]
    const permit3 = allPermits[2]

    // Seed sample tasks
    console.log("Creating sample tasks...")

    const taskData = [
      {
        title: "Review work permit documents for John Smith",
        description: "Verify all required documents are complete and valid",
        status: "pending" as const,
        priority: "high" as const,
        dueDate: new Date("2025-06-20"),
        assigneeId: adminUser.id,
        permitId: permit1?.id,
        notes: "Urgent - submission deadline approaching",
      },
      {
        title: "Submit residence ID application",
        description: "Submit completed application to immigration office",
        status: "in-progress" as const,
        priority: "high" as const,
        dueDate: new Date("2025-06-25"),
        assigneeId: adminUser.id,
        permitId: permit2?.id,
        notes: "Documents ready for submission",
      },
      {
        title: "Follow up on MOH license status",
        description: "Contact Ministry of Health for application status update",
        status: "pending" as const,
        priority: "medium" as const,
        dueDate: new Date("2025-06-30"),
        assigneeId: adminUser.id,
        permitId: allPermits[2]?.id,
        notes: "Follow up every 2 weeks",
      },
      {
        title: "Prepare documents for product import permit",
        description: "Gather all required documentation for EFDA PIP application",
        status: "pending" as const,
        priority: "low" as const,
        dueDate: new Date("2025-07-15"),
        assigneeId: adminUser.id,
        permitId: permit3?.id,
      },
      {
        title: "Schedule medical examination for new staff",
        description: "Arrange health certificate and required medical tests",
        status: "completed" as const,
        priority: "medium" as const,
        dueDate: new Date("2025-05-15"),
        assigneeId: adminUser.id,
        completedAt: new Date("2025-05-14"),
        notes: "Health certificate obtained",
      },
      {
        title: "Renew work permit for existing staff member",
        description: "Process work permit renewal 3 months before expiry",
        status: "pending" as const,
        priority: "urgent" as const,
        dueDate: new Date("2025-05-20"),
        assigneeId: adminUser.id,
        notes: "Expiring soon - high priority",
      },
      {
        title: "Translate educational certificates",
        description: "Get official translation of degree certificates from home country",
        status: "in-progress" as const,
        priority: "medium" as const,
        dueDate: new Date("2025-07-01"),
        assigneeId: adminUser.id,
      },
      {
        title: "Update staff residence permit database",
        description: "Maintain current records of all staff residence permits",
        status: "completed" as const,
        priority: "low" as const,
        dueDate: new Date("2025-05-10"),
        assigneeId: adminUser.id,
        completedAt: new Date("2025-05-09"),
      },
    ]

    for (const task of taskData) {
      await db.insert(tasksV2).values(task).onConflictDoNothing()
    }

    console.log("✓ Created 8 sample tasks")

    // Seed calendar events
    console.log("Creating calendar events...")

    const eventData = [
      {
        title: "Work Permit Interview - John Smith",
        description: "Interview at Ministry of Labor for work permit application",
        type: "interview" as const,
        startDate: new Date("2025-06-25T10:00:00"),
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        allDay: false,
        location: "Ministry of Labor, Main Office",
        relatedPersonId: person1?.id,
        relatedPermitId: permit1?.id,
        createdBy: adminUser.id,
      },
      {
        title: "Residence ID Submission Deadline",
        description: "Final date to submit residence ID application",
        type: "deadline" as const,
        startDate: new Date("2025-07-01T00:00:00"),
        allDay: true,
        relatedPersonId: person1?.id,
        relatedPermitId: permit2?.id,
        createdBy: adminUser.id,
      },
      {
        title: "Team Meeting - Permit Status Review",
        description: "Monthly review of all active permit applications",
        type: "meeting" as const,
        startDate: new Date("2025-06-18T14:00:00"),
        startTime: "02:00 PM",
        endTime: "03:30 PM",
        allDay: false,
        location: "HR Conference Room",
        createdBy: adminUser.id,
      },
      {
        title: "MOH License Expiry - Sarah Johnson",
        description: "Ministry of Health license expiration date",
        type: "permit" as const,
        startDate: new Date("2025-12-31T00:00:00"),
        allDay: true,
        relatedPersonId: person2?.id,
        relatedPermitId: allPermits[2]?.id,
        createdBy: adminUser.id,
      },
      {
        title: "EFDA Office Visit",
        description: "Submit product import permit application in person",
        type: "other" as const,
        startDate: new Date("2025-06-30T09:00:00"),
        startTime: "09:00 AM",
        endTime: "10:00 AM",
        allDay: false,
        location: "EFDA Head Office, Addis Ababa",
        relatedPersonId: person3?.id,
        relatedPermitId: permit3?.id,
        createdBy: adminUser.id,
      },
    ]

    for (const event of eventData) {
      await db.insert(calendarEvents).values(event).onConflictDoNothing()
    }

    console.log("✓ Created 5 calendar events")

    // Seed activity logs
    console.log("Creating activity logs...")

    const activityData = [
      {
        userId: adminUser.id,
        action: "Created work permit application",
        entityType: "permit",
        entityId: permit1?.id || crypto.randomUUID(),
        details: { category: "WORK_PERMIT", status: "PENDING" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        userId: adminUser.id,
        action: "Submitted residence ID application",
        entityType: "permit",
        entityId: permit2?.id || crypto.randomUUID(),
        details: { category: "RESIDENCE_ID", status: "SUBMITTED" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      },
      {
        userId: adminUser.id,
        action: "Approved MOH license",
        entityType: "permit",
        entityId: allPermits[2]?.id || crypto.randomUUID(),
        details: { category: "LICENSE", status: "APPROVED" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        userId: adminUser.id,
        action: "Created task for document review",
        entityType: "task",
        entityId: crypto.randomUUID(),
        details: { title: "Review work permit documents", priority: "high" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      },
      {
        userId: adminUser.id,
        action: "Completed medical examination task",
        entityType: "task",
        entityId: crypto.randomUUID(),
        details: { title: "Schedule medical examination", status: "completed" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        userId: adminUser.id,
        action: "Created calendar event for interview",
        entityType: "calendar_event",
        entityId: crypto.randomUUID(),
        details: { title: "Work Permit Interview - John Smith", type: "interview" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      },
      {
        userId: adminUser.id,
        action: "Updated permit status",
        entityType: "permit",
        entityId: permit1?.id || crypto.randomUUID(),
        details: { from: "PENDING", to: "SUBMITTED" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      },
      {
        userId: adminUser.id,
        action: "Added new person to database",
        entityType: "person",
        entityId: person1?.id || crypto.randomUUID(),
        details: { name: "John Smith", nationality: "United Kingdom" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      },
    ]

    for (const activity of activityData) {
      await db.insert(activityLogs).values(activity).onConflictDoNothing()
    }

    console.log("✓ Created 8 activity logs")

    console.log("✅ MVP database seeded successfully!")
    console.log("\n📋 Summary:")
    console.log("  - Admin user: admin@example.org / Admin123!")
    console.log("  - 4 permit checklists created")
    console.log("  - 4 sample people (1 with dependent)")
    console.log("  - 4 sample permits across all categories")
    console.log("  - 8 sample tasks (pending, in-progress, completed, urgent)")
    console.log("  - 5 calendar events (meetings, deadlines, interviews)")
    console.log("  - 8 activity logs for recent actions")
  } catch (error) {
    console.error("❌ Error seeding MVP database:", error)
    throw error
  }
}

// Run the seed function
seedMVP()
  .catch((error) => {
    console.error("MVP seeding failed:", error)
    process.exit(1)
  })
  .finally(() => {
    console.log("MVP seeding completed")
    process.exit(0)
  })
