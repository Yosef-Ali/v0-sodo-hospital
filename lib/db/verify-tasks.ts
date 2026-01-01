import { config } from "dotenv"
import { db, tasksV2 } from "./index"
import { desc } from "drizzle-orm"

// Load environment variables from .env.local
config({ path: ".env.local" })

async function verifyTasks() {
  try {
    const tasks = await db.select().from(tasksV2).orderBy(desc(tasksV2.createdAt)).limit(1)

    if (tasks.length === 0) {
      console.log("No tasks found.")
      return
    }

    const task = tasks[0]
    console.log("--- Task Verification ---")
    console.log("Title:", task.title)
    console.log("Description Preview:", task.description?.substring(0, 200) + "...")
    console.log("Full Description:\n", task.description)
    console.log("-------------------------")
  } catch (error) {
    console.error("Error verifying tasks:", error)
  } finally {
    process.exit(0)
  }
}

verifyTasks()
