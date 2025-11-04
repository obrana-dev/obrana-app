ALTER TABLE "employees" ALTER COLUMN "employment_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "employment_type" SET DEFAULT 'HOURLY'::text;--> statement-breakpoint
DROP TYPE "public"."employment_type";--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('HOURLY', 'DAILY', 'SUB_CONTRACTOR');--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "employment_type" SET DEFAULT 'HOURLY'::"public"."employment_type";--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "employment_type" SET DATA TYPE "public"."employment_type" USING "employment_type"::"public"."employment_type";