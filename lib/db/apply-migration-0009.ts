import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { neonConfig, Pool } from "@neondatabase/serverless"
import * as fs from "fs"
import * as path from "path"
import ws from "ws"

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws

async function applyMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  console.log("Connecting to Neon database...")

  // Read the migration file
  const migrationPath = path.join(process.cwd(), "lib/db/migrations/0009_add_people_columns.sql")
  const migrationSQL = fs.readFileSync(migrationPath, "utf-8")

  console.log("Applying migration 0009_add_people_columns.sql...")

  try {
    await pool.query(migrationSQL)
    console.log("✅ Migration applied successfully!")
  } catch (error: any) {
    console.error("❌ Error applying migration:", error.message)
    throw error
  } finally {
    await pool.end()
  }
}

applyMigration().catch((e) => {
  console.error(e)
  process.exit(1)
})
