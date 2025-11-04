CREATE TYPE "public"."attendance_status" AS ENUM('PRESENT', 'SICK', 'VACATION', 'ABSENT');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('HOURLY', 'DAILY', 'SALARIED', 'SUB_CONTRACTOR');--> statement-breakpoint
CREATE TYPE "public"."pay_frequency" AS ENUM('WEEKLY', 'BI_WEEKLY', 'MONTHLY');--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"project_id" text,
	"work_date" date NOT NULL,
	"units_worked" numeric(4, 2) DEFAULT '0' NOT NULL,
	"status" "attendance_status" DEFAULT 'PRESENT' NOT NULL,
	"notes" text,
	CONSTRAINT "attendance_records_employee_id_work_date_unique" UNIQUE("employee_id","work_date")
);
--> statement-breakpoint
CREATE TABLE "employee_bank_details" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"bank_name" text,
	"account_alias" text,
	"cbu_cvu" text,
	CONSTRAINT "employee_bank_details_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "employee_pay_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"effective_date" date DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_pay_rates_employee_id_effective_date_unique" UNIQUE("employee_id","effective_date")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"contractor_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"national_id" text,
	"job_category" text,
	"employment_type" "employment_type" DEFAULT 'HOURLY' NOT NULL,
	"pay_frequency" "pay_frequency" DEFAULT 'WEEKLY' NOT NULL,
	"hire_date" date,
	"insurance_details" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_contractor_id_email_unique" UNIQUE("contractor_id","email")
);
--> statement-breakpoint
CREATE TABLE "payroll_history" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"employee_name" text NOT NULL,
	"pay_period_start" date NOT NULL,
	"pay_period_end" date NOT NULL,
	"payment_date" date DEFAULT now() NOT NULL,
	"gross_pay" numeric(10, 2) NOT NULL,
	"deductions" numeric(10, 2) DEFAULT '0',
	"bonuses" numeric(10, 2) DEFAULT '0',
	"net_pay" numeric(10, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_bank_details" ADD CONSTRAINT "employee_bank_details_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_pay_rates" ADD CONSTRAINT "employee_pay_rates_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_contractor_id_user_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_history" ADD CONSTRAINT "payroll_history_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;