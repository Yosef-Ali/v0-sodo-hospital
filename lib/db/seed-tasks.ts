import { config } from "dotenv"
import { db, tasksV2, users, permits, people } from "./index"
import { eq } from "drizzle-orm"
import { getAllWorkflows, TaskWorkflow, hospitalTaskCategories } from "../data/hospital-tasks"

// Load environment variables from .env.local
config({ path: ".env.local" })

async function seedTasks() {
  try {
    console.log("🌱 Seeding hospital tasks...")

    // Get admin user for task assignment
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@example.org"),
    })

    if (!adminUser) {
      console.error("❌ Admin user not found. Please run seed-mvp.ts first.")
      process.exit(1)
    }

    // Get all permits/people to link tasks to
    const allPermits = await db.select().from(permits)
    const allPeople = await db.select().from(people)

    // We don't strictly require permits/people to seed tasks, strictly speaking we could create general tasks
    // But it's better if we have them. 
    console.log(`Found ${allPermits.length} permits and ${allPeople.length} people.`)

    // Clear existing tasks
    await db.delete(tasksV2)
    console.log("✓ Cleared existing tasks")

    const createdTasks = []
    const workflows = getAllWorkflows()

    console.log(`Creating tasks for ${workflows.length} workflows...`)

    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i]

      // Attempt to find a relevant permit or person to link to
      // This makes the data look more realistic
      let permitId = null
      let personName = "General"

      // Simple matching logic
      if (allPermits.length > 0) {
        // Try to match by category
        const matchingPermit = allPermits.find(p =>
          (workflow.category.includes("work") && p.category === "WORK_PERMIT") ||
          (workflow.category.includes("residence") && p.category === "RESIDENCE_ID") ||
          (workflow.category.includes("license") && p.category === "MEDICAL_LICENSE")
        )

        if (matchingPermit) {
          permitId = matchingPermit.id
          // Find person for this permit
          const person = allPeople.find(p => p.id === matchingPermit.personId)
          if (person) personName = `${person.firstName} ${person.lastName}`
        }
      }

      // If no permit found, maybe link to a random person for some tasks
      if (!permitId && allPeople.length > 0 && Math.random() > 0.5) {
        const randomPerson = allPeople[Math.floor(Math.random() * allPeople.length)]
        personName = `${randomPerson.firstName} ${randomPerson.lastName}`
      }

      // Construct Task Title
      // e.g. "Work Permit Renewal for John Doe"
      const taskTitle = `${workflow.title}${personName !== "General" ? ` for ${personName}` : ""}`

      // Construct Description with Steps and Docs
      let description = `${workflow.description}\n\n`

      description += `STEPS:\n`
      workflow.steps.forEach((step, idx) => {
        description += `${idx + 1}. ${step.title}: ${step.description || ''}\n`
      })

      description += `\nREQUIRED DOCUMENTS:\n`
      workflow.documents.forEach(doc => {
        description += `- [${doc.required ? 'x' : ' '}] ${doc.name} ${doc.notes ? `(${doc.notes})` : ''}\n`
      })

      // Random status and priority
      const statuses = ["pending", "in-progress", "urgent"] as const
      const priorities = ["low", "medium", "high"] as const

      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const priority = priorities[Math.floor(Math.random() * priorities.length)]

      // Calculate due date (random future date)
      const daysToAdd = Math.floor(Math.random() * 30) + 1
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + daysToAdd)

      const [newTask] = await db
        .insert(tasksV2)
        .values({
          title: taskTitle,
          description: description,
          status: status,
          priority: priority,
          dueDate: dueDate,
          assigneeId: adminUser.id,
          permitId: permitId, // Nullable
          notes: `Auto-generated task based on ${workflow.category} workflow`,
        })
        .returning()

      createdTasks.push(newTask)
    }

    console.log(`✓ Created ${createdTasks.length} tasks based on hospital workflows`)

    // Log breakdown
    console.log("\n📊 Task breakdown by Category:")
    hospitalTaskCategories.forEach(cat => {
      const count = createdTasks.filter(t => t.notes?.includes(cat.id)).length
      // Note: the matching logic above is a bit fuzzy on 'notes', but good enough for a seed log
    })

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
