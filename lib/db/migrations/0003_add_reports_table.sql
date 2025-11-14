-- Create report enums
DO $$ BEGIN
 CREATE TYPE "public"."report_status" AS ENUM('DRAFT', 'GENERATED', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 CREATE TYPE "public"."report_frequency" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 CREATE TYPE "public"."report_format" AS ENUM('PDF', 'EXCEL', 'CSV', 'DASHBOARD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Create reports table
CREATE TABLE IF NOT EXISTS "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"status" "report_status" DEFAULT 'DRAFT' NOT NULL,
	"frequency" "report_frequency" DEFAULT 'MONTHLY' NOT NULL,
	"format" "report_format" DEFAULT 'PDF' NOT NULL,
	"department" varchar(255),
	"category" varchar(255),
	"last_generated" timestamp,
	"generated_by" uuid,
	"file_url" text,
	"file_size" integer,
	"parameters" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" ("status");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "reports_category_idx" ON "reports" ("category");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "reports_department_idx" ON "reports" ("department");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "reports_created_at_idx" ON "reports" ("created_at" DESC);
