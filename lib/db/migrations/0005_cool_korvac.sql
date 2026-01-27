ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "photo_url" text;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "passport_document_url" text;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "medical_license_document_url" text;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "work_permit_document_url" text;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "residence_id_document_url" text;