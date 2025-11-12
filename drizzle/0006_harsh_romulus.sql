ALTER TABLE "quotations" ADD COLUMN "validity_days" numeric(3, 0);--> statement-breakpoint
ALTER TABLE "quotations" DROP COLUMN "expiry_date";--> statement-breakpoint
ALTER TABLE "quotations" DROP COLUMN "taxes";