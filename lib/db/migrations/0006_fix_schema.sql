ALTER TABLE "tasks_v2" ADD COLUMN IF NOT EXISTS "entity_type" varchar(50);
ALTER TABLE "tasks_v2" ADD COLUMN IF NOT EXISTS "entity_id" uuid;
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "ticket_number" varchar(50);
DO $$ BEGIN
    ALTER TABLE "people" ADD CONSTRAINT "people_ticket_number_unique" UNIQUE("ticket_number");
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN invalid_table_definition THEN null; -- if constraint already exists (depends on PG version)
END $$;
