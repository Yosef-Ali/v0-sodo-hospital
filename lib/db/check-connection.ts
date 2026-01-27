import { db } from "./index"
import { sql } from "drizzle-orm"

/**
 * Checks if the database is reachable by running a simple query.
 * Returns true if connection is successful, false otherwise.
 */
export async function checkDbConnection(): Promise<{ reachable: boolean; error?: string }> {
  try {
    // Attempt a simple query that doesn't depend on schema version
    await db.execute(sql`SELECT 1`)
    return { reachable: true }
  } catch (error: any) {
    console.error("Database connection check failed:", error.message || error)

    let userFriendlyError = "Database unreachable"

    if (error.code === 'ECONNREFUSED') {
      userFriendlyError = "Connection refused. Is the SSH tunnel or database running?"
    } else if (error.message?.includes("timeout")) {
      userFriendlyError = "Connection timed out."
    }

    return {
      reachable: false,
      error: userFriendlyError
    }
  }
}
