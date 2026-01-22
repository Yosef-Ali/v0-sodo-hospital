
import { db } from "@/lib/db"
import { getTaskById } from "@/lib/actions/v2/tasks"

async function test() {
  console.log("Checking DB connection...")
  try {
    const taskId = "cd0dfc65-6544-4b8e-93ef-b85e00af15d2"
    console.log(`Fetching task: ${taskId}`)

    // Check if db.query.vehicles exists
    console.log("Checking db.query.vehicles:", !!db.query.vehicles)
    console.log("Checking db.query.importPermits:", !!db.query.importPermits)

    const result = await getTaskById(taskId)
    console.log("Result success:", result.success)
    if (!result.success) {
      console.error("Error:", result.error)
    } else {
      console.log("Task found:", result.data.task.title)
      console.log("Linked Entity:", result.data.linkedEntity)
    }

  } catch (error) {
    console.error("Test failed:", error)
  }
  process.exit(0)
}

test()
