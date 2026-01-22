-- Create company_registrations table if it doesn't exist
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_company_registrations_stage" ON "company_registrations" ("stage");
CREATE INDEX IF NOT EXISTS "idx_company_registrations_status" ON "company_registrations" ("status");
