
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { sql } from "drizzle-orm"

async function main() {
  const { db } = await import("@/lib/db")

  console.log("Adding assignee_id column to company_registrations...")

  try {
    await db.execute(sql`
      ALTER TABLE "company_registrations" 
      ADD COLUMN IF NOT EXISTS "assignee_id" uuid REFERENCES "users"("id")
    `)
    console.log("Successfully added assignee_id column")
  } catch (error: any) {
    console.error("Error adding column:", error.message)
  }
}

main().catch(console.error)
