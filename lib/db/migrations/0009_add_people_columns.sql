-- Add missing columns to the people table to match schema.ts
-- This migration adds all the columns that the code expects but the database doesn't have

-- Create the work_permit_sub_type enum if not exists
DO $$ BEGIN
    CREATE TYPE "public"."work_permit_sub_type" AS ENUM('NEW', 'RENEWAL', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the permit_stage enum if not exists
DO $$ BEGIN
    CREATE TYPE "public"."permit_stage" AS ENUM('SUPPORT_LETTER', 'DOCUMENT_ARRANGEMENT', 'APPLY_ONLINE', 'SUBMIT_DOCUMENT', 'PAYMENT', 'PICK_ID', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add JSONB document array columns (replacing single URL columns if needed)
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "passport_documents" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "medical_license_documents" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "work_permit_documents" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "residence_id_documents" jsonb DEFAULT '[]'::jsonb;

-- Add work permit sub type column
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "work_permit_sub_type" "work_permit_sub_type";

-- Add family details and document sections JSONB
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "family_details" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "document_sections" jsonb DEFAULT '[]'::jsonb;

-- Add permit workflow tracking fields
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "permit_type" "permit_category";
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "application_type" "work_permit_sub_type";
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "current_stage" "permit_stage" DEFAULT 'SUPPORT_LETTER';

-- Add calendar events entity linking columns if missing
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "entity_type" varchar(50);
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "entity_id" uuid;

-- Add permits sub_type column if missing
ALTER TABLE "permits" ADD COLUMN IF NOT EXISTS "sub_type" "work_permit_sub_type";
