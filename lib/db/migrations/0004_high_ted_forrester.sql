DO $$ BEGIN
    CREATE TYPE "public"."family_status" AS ENUM('MARRIED', 'UNMARRIED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "checklists" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "knowledge_base" ALTER COLUMN "related_permit_category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "permits" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='people' AND column_name='permit_type') THEN
        ALTER TABLE "people" ALTER COLUMN "permit_type" SET DATA TYPE text;
    END IF;
END $$;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."permit_category";--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."permit_category" AS ENUM('WORK_PERMIT', 'RESIDENCE_ID', 'MEDICAL_LICENSE', 'PIP', 'CUSTOMS', 'CAR_BOLO_INSURANCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "checklists" ALTER COLUMN "category" SET DATA TYPE "public"."permit_category" USING "category"::"public"."permit_category";--> statement-breakpoint
ALTER TABLE "knowledge_base" ALTER COLUMN "related_permit_category" SET DATA TYPE "public"."permit_category" USING "related_permit_category"::"public"."permit_category";--> statement-breakpoint
ALTER TABLE "permits" ALTER COLUMN "category" SET DATA TYPE "public"."permit_category" USING "category"::"public"."permit_category";--> statement-breakpoint
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='people' AND column_name='permit_type') THEN
        ALTER TABLE "people" ALTER COLUMN "permit_type" SET DATA TYPE "public"."permit_category" USING "permit_type"::"public"."permit_category";
    END IF;
END $$;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "date_of_birth" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "gender" "gender";--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "family_status" "family_status";--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "passport_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "passport_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "medical_license_no" varchar(100);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "medical_license_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "medical_license_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "work_permit_no" varchar(100);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "work_permit_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "work_permit_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "residence_id_no" varchar(100);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "residence_id_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "residence_id_expiry_date" timestamp;