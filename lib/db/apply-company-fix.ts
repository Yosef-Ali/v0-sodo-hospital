/**
 * Apply the company_registrations table migration
 */
import { sql } from "drizzle-orm"
import { db } from "@/lib/db"

async function main() {
  console.log("Creating company_registrations table...")

  try {
    // Create the table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "company_registrations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "ticket_number" varchar(50) UNIQUE,
        "title" varchar(500) NOT NULL,
        "description" text,
        "stage" varchar(50) DEFAULT 'document_prep' NOT NULL,
        "status" varchar(50) DEFAULT 'pending' NOT NULL,
        "company_name" varchar(255),
        "registration_type" varchar(100),
        "due_date" timestamp,
        "assignee_id" uuid REFERENCES "users"("id"),
        "documents" jsonb DEFAULT '[]'::jsonb,
        "document_sections" jsonb DEFAULT '[]'::jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `)

    console.log("✅ company_registrations table created/verified")

    // Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_company_registrations_stage" ON "company_registrations" ("stage");
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_company_registrations_status" ON "company_registrations" ("status");
    `)

    console.log("✅ Indexes created")

  } catch (error) {
    console.error("Migration error:", error)
    process.exit(1)
  }

  console.log("✅ Migration complete!")
  process.exit(0)
}

main()
