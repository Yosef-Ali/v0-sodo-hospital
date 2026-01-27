
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { sql } from "drizzle-orm"

async function main() {
  const { db } = await import("@/lib/db")

  const result = await db.execute(sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'company_registrations'
  `)

  console.log("Columns in company_registrations:", result.rows.map(r => r.column_name))
}

main().catch(console.error)
