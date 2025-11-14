import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"
import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool, neonConfig } from "@neondatabase/serverless"
import { sql } from "drizzle-orm"
import ws from "ws"

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" })

// Configure WebSocket for local development
if (process.env.NODE_ENV === "development") {
  neonConfig.webSocketConstructor = ws
}

/**
 * Run the reports table migration directly
 * This bypasses Drizzle Kit's interactive prompts
 */
async function runMigration() {
  try {
    console.log("📦 Running reports table migration...")

    // Create a fresh connection pool with the loaded DATABASE_URL
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
    const db = drizzle(pool)

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, "migrations", "0003_add_reports_table.sql")
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8")

    // Split into individual statements (Drizzle uses --> statement-breakpoint)
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`Executing statement ${i + 1}/${statements.length}...`)

      try {
        await db.execute(sql.raw(statement))
        console.log(`✅ Statement ${i + 1} executed successfully`)
      } catch (error: any) {
        // Ignore "already exists" errors for enums and tables
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate")
        ) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists)`)
        } else {
          throw error
        }
      }
    }

    console.log("✅ Reports table migration completed successfully!")

    // Close the pool
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error running migration:", error)
    process.exit(1)
  }
}

runMigration()
