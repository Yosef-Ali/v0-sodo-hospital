import { config } from "dotenv"
import { db, tasksV2, users, permits } from "./index"
import { eq } from "drizzle-orm"

// Load environment variables from .env.local
config({ path: ".env.local" })

async function seedTasks() {
  try {
    console.log("🌱 Seeding tasks...")

    // Get admin user for task assignment
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@example.org"),
    })

    if (!adminUser) {
      console.error("❌ Admin user not found. Please run seed-mvp.ts first.")
      process.exit(1)
    }

    // Get all permits to link tasks to them
    const allPermits = await db.select().from(permits)

    if (allPermits.length === 0) {
      console.error("❌ No permits found. Please run seed-mvp.ts first.")
      process.exit(1)
    }

    console.log(`Found ${allPermits.length} permits to create tasks for...`)

    // Clear existing tasks
    await db.delete(tasksV2)
    console.log("✓ Cleared existing tasks")

    const createdTasks = []

    // Task 1: Review work permit application (linked to WRK-2025-0001)
    const workPermit = allPermits.find((p) => p.ticketNumber === "WRK-2025-0001")
    if (workPermit) {
      const [task1] = await db
        .insert(tasksV2)
        .values({
          title: "Review work permit application documents",
          description:
            "Review all submitted documents for work permit application. Verify passport validity, educational certificates, and employment contract.",
          status: "in-progress",
          priority: "high",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          assigneeId: adminUser.id,
          permitId: workPermit.id,
          notes: "Priority task - application submitted 2 days ago",
        })
        .returning()
      createdTasks.push(task1)
    }

    // Task 2: Follow up on residence ID submission (linked to RES-2025-0001)
    const residencePermit = allPermits.find((p) => p.ticketNumber === "RES-2025-0001")
    if (residencePermit) {
      const [task2] = await db
        .insert(tasksV2)
        .values({
          title: "Follow up with immigration office on residence ID",
          description:
            "Contact immigration office to check status of residence ID application. Ensure all required documents were received.",
          status: "pending",
          priority: "medium",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          assigneeId: adminUser.id,
          permitId: residencePermit.id,
          notes: "Application was submitted last week",
        })
        .returning()
      createdTasks.push(task2)
    }

    // Task 3: Renew MOH license (linked to LIC-2025-0001)
    const licensePermit = allPermits.find((p) => p.ticketNumber === "LIC-2025-0001")
    if (licensePermit) {
      const [task3] = await db
        .insert(tasksV2)
        .values({
          title: "Prepare MOH license renewal documents",
          description:
            "Collect all required documents for MOH nursing license renewal. Need updated CPD certificates, employment verification, and renewal fee receipt.",
          status: "urgent",
          priority: "high",
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          assigneeId: adminUser.id,
          permitId: licensePermit.id,
          notes: "License expires in 30 days - start renewal process now",
        })
        .returning()
      createdTasks.push(task3)
    }

    // Task 4: Submit EFDA PIP application (linked to PIP-2025-0001)
    const pipPermit = allPermits.find((p) => p.ticketNumber === "PIP-2025-0001")
    if (pipPermit) {
      const [task4] = await db
        .insert(tasksV2)
        .values({
          title: "Submit EFDA product import permit application",
          description:
            "Complete and submit EFDA PIP application for medical supplies. Ensure all product specifications and import documentation are attached.",
          status: "pending",
          priority: "medium",
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          assigneeId: adminUser.id,
          permitId: pipPermit.id,
          notes: "Waiting for final product specifications from supplier",
        })
        .returning()
      createdTasks.push(task4)
    }

    // General tasks not linked to specific permits

    // Task 5: Update employee database
    const [task5] = await db
      .insert(tasksV2)
      .values({
        title: "Update employee permit expiration database",
        description:
          "Review all employee permits and update the central database with current expiration dates. Flag any permits expiring in the next 60 days.",
        status: "pending",
        priority: "low",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        assigneeId: adminUser.id,
        notes: "Quarterly database maintenance task",
      })
      .returning()
    createdTasks.push(task5)

    // Task 6: Train new HR staff
    const [task6] = await db
      .insert(tasksV2)
      .values({
        title: "Train new HR coordinator on permit management system",
        description:
          "Conduct comprehensive training session for new HR coordinator covering permit application processes, document requirements, and system usage.",
        status: "in-progress",
        priority: "medium",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        assigneeId: adminUser.id,
        notes: "First training session completed, follow-up session scheduled",
      })
      .returning()
    createdTasks.push(task6)

    // Task 7: Overdue document submission reminder
    const [task7] = await db
      .insert(tasksV2)
      .values({
        title: "Send reminder for overdue document submissions",
        description:
          "Contact all employees with pending document submissions for permit applications. Send automated email reminders and follow up with phone calls if needed.",
        status: "urgent",
        priority: "high",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        assigneeId: adminUser.id,
        notes: "5 employees have overdue submissions",
      })
      .returning()
    createdTasks.push(task7)

    // Task 8: Completed task - Update permit tracking spreadsheet
    const [task8] = await db
      .insert(tasksV2)
      .values({
        title: "Update monthly permit tracking spreadsheet",
        description:
          "Export permit data from the system and update the monthly tracking spreadsheet for management review.",
        status: "completed",
        priority: "low",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Completed 3 days ago
        assigneeId: adminUser.id,
        notes: "Completed ahead of schedule - submitted to management",
      })
      .returning()
    createdTasks.push(task8)

    // Task 9: Schedule immigration office visit
    const [task9] = await db
      .insert(tasksV2)
      .values({
        title: "Schedule visit to immigration office for permit inquiries",
        description:
          "Book appointment with immigration office to clarify new work permit requirements and discuss pending applications.",
        status: "pending",
        priority: "medium",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        assigneeId: adminUser.id,
        notes: "Need to coordinate with 3 department heads",
      })
      .returning()
    createdTasks.push(task9)

    // Task 10: Prepare quarterly compliance report
    const [task10] = await db
      .insert(tasksV2)
      .values({
        title: "Prepare quarterly permit compliance report",
        description:
          "Compile all permit data for Q1 2025 and prepare compliance report for regulatory review. Include statistics on application success rates, processing times, and any violations.",
        status: "pending",
        priority: "high",
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        assigneeId: adminUser.id,
        notes: "Report due to regulatory authority by end of month",
      })
      .returning()
    createdTasks.push(task10)

    console.log(`✓ Created ${createdTasks.length} sample tasks`)
    console.log("\n📊 Task breakdown:")
    console.log(`   - Pending: ${createdTasks.filter((t) => t.status === "pending").length}`)
    console.log(`   - In Progress: ${createdTasks.filter((t) => t.status === "in-progress").length}`)
    console.log(`   - Urgent: ${createdTasks.filter((t) => t.status === "urgent").length}`)
    console.log(`   - Completed: ${createdTasks.filter((t) => t.status === "completed").length}`)
    console.log(`\n   - High Priority: ${createdTasks.filter((t) => t.priority === "high").length}`)
    console.log(`   - Medium Priority: ${createdTasks.filter((t) => t.priority === "medium").length}`)
    console.log(`   - Low Priority: ${createdTasks.filter((t) => t.priority === "low").length}`)
    console.log(`\n   - Linked to permits: ${createdTasks.filter((t) => t.permitId).length}`)
    console.log(`   - General tasks: ${createdTasks.filter((t) => !t.permitId).length}`)

    console.log("\n✅ Task seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding tasks:", error)
    throw error
  }
}

seedTasks()
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
  .finally(() => {
    console.log("Closing database connection...")
    process.exit(0)
  })
