CREATE TYPE "public"."family_status" AS ENUM('MARRIED', 'UNMARRIED');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
ALTER TABLE "checklists" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "knowledge_base" ALTER COLUMN "related_permit_category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "permits" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."permit_category";--> statement-breakpoint
CREATE TYPE "public"."permit_category" AS ENUM('WORK_PERMIT', 'RESIDENCE_ID', 'MEDICAL_LICENSE', 'PIP', 'CUSTOMS', 'CAR_BOLO_INSURANCE');--> statement-breakpoint
ALTER TABLE "checklists" ALTER COLUMN "category" SET DATA TYPE "public"."permit_category" USING "category"::"public"."permit_category";--> statement-breakpoint
ALTER TABLE "knowledge_base" ALTER COLUMN "related_permit_category" SET DATA TYPE "public"."permit_category" USING "related_permit_category"::"public"."permit_category";--> statement-breakpoint
ALTER TABLE "permits" ALTER COLUMN "category" SET DATA TYPE "public"."permit_category" USING "category"::"public"."permit_category";--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "date_of_birth" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "family_status" "family_status";--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "passport_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "passport_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "medical_license_no" varchar(100);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "medical_license_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "medical_license_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "work_permit_no" varchar(100);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "work_permit_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "work_permit_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "residence_id_no" varchar(100);--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "residence_id_issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "residence_id_expiry_date" timestamp;