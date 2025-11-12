ALTER TYPE "public"."user_role" ADD VALUE 'HR_MANAGER' BEFORE 'HR';--> statement-breakpoint
CREATE TABLE "permit_checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"permit_id" uuid NOT NULL,
	"label" varchar(500) NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"hint" text,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_by" uuid,
	"completed_at" timestamp,
	"file_urls" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checklists" ADD COLUMN "category" "permit_category";--> statement-breakpoint
ALTER TABLE "checklists" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "checklists" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "checklists" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "checklists" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "permit_checklist_items" ADD CONSTRAINT "permit_checklist_items_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_checklist_items" ADD CONSTRAINT "permit_checklist_items_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklists" ADD CONSTRAINT "checklists_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;