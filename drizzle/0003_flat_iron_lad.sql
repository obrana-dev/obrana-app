CREATE TYPE "public"."adjustment_type" AS ENUM('BONUS', 'DEDUCTION');--> statement-breakpoint
CREATE TABLE "payroll_adjustments" (
	"id" text PRIMARY KEY NOT NULL,
	"payroll_history_id" text NOT NULL,
	"type" "adjustment_type" NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_payroll_history_id_payroll_history_id_fk" FOREIGN KEY ("payroll_history_id") REFERENCES "public"."payroll_history"("id") ON DELETE cascade ON UPDATE no action;