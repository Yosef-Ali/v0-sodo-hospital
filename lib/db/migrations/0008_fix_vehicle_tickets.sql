ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "ticket_number" varchar(50);

DO $$ BEGIN
    ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_ticket_number_unique" UNIQUE("ticket_number");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
