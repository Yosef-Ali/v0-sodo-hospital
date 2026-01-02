ALTER TABLE "company_registrations" ADD COLUMN IF NOT EXISTS "ticket_number" varchar(50);
ALTER TABLE "import_permits" ADD COLUMN IF NOT EXISTS "ticket_number" varchar(50);

DO $$ BEGIN
    ALTER TABLE "company_registrations" ADD CONSTRAINT "company_registrations_ticket_number_unique" UNIQUE("ticket_number");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "import_permits" ADD CONSTRAINT "import_permits_ticket_number_unique" UNIQUE("ticket_number");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
