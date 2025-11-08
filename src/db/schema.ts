import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

// Enums for employee management
export const employmentTypeEnum = pgEnum("employment_type", [
	"HOURLY",
	"DAILY",
	"SUB_CONTRACTOR",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
	"PRESENT",
	"SICK",
	"VACATION",
	"ABSENT",
]);

export const payFrequencyEnum = pgEnum("pay_frequency", [
	"WEEKLY",
	"BI_WEEKLY",
	"MONTHLY",
]);

export const adjustmentTypeEnum = pgEnum("adjustment_type", [
	"BONUS",
	"DEDUCTION",
]);

// Better Auth tables
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// Employee Management Tables

export const employees = pgTable(
	"employees",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		contractorId: text("contractor_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		email: text("email"),
		phone: text("phone"),
		address: text("address"),
		nationalId: text("national_id"),

		jobCategory: text("job_category"),
		employmentType: employmentTypeEnum("employment_type")
			.notNull()
			.default("HOURLY"),
		payFrequency: payFrequencyEnum("pay_frequency").notNull().default("WEEKLY"),
		hireDate: date("hire_date"),

		insuranceDetails: text("insurance_details"),

		isActive: boolean("is_active").notNull().default(true),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [unique().on(table.contractorId, table.email)],
);

export const employeeBankDetails = pgTable("employee_bank_details", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	employeeId: text("employee_id")
		.notNull()
		.unique()
		.references(() => employees.id, { onDelete: "restrict" }),

	bankName: text("bank_name"),
	accountAlias: text("account_alias"),
	cbuCvu: text("cbu_cvu"),
});

export const employeePayRates = pgTable(
	"employee_pay_rates",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		employeeId: text("employee_id")
			.notNull()
			.references(() => employees.id, { onDelete: "restrict" }),

		rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
		effectiveDate: date("effective_date").notNull().defaultNow(),

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [unique().on(table.employeeId, table.effectiveDate)],
);

export const attendanceRecords = pgTable(
	"attendance_records",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		employeeId: text("employee_id")
			.notNull()
			.references(() => employees.id, { onDelete: "restrict" }),

		projectId: text("project_id"), // Will reference projects table in the future

		workDate: date("work_date").notNull(),
		unitsWorked: numeric("units_worked", { precision: 4, scale: 2 })
			.notNull()
			.default("0"),

		status: attendanceStatusEnum("status").notNull().default("PRESENT"),
		notes: text("notes"),
	},
	(table) => [unique().on(table.employeeId, table.workDate)],
);

export const payrollHistory = pgTable("payroll_history", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	employeeId: text("employee_id")
		.notNull()
		.references(() => employees.id, { onDelete: "restrict" }),

	// Store employee name at time of payment for historical reference
	employeeName: text("employee_name").notNull(),

	payPeriodStart: date("pay_period_start").notNull(),
	payPeriodEnd: date("pay_period_end").notNull(),
	paymentDate: date("payment_date").notNull().defaultNow(),

	grossPay: numeric("gross_pay", { precision: 10, scale: 2 }).notNull(),
	deductions: numeric("deductions", { precision: 10, scale: 2 }).default("0"),
	bonuses: numeric("bonuses", { precision: 10, scale: 2 }).default("0"),
	netPay: numeric("net_pay", { precision: 10, scale: 2 }).notNull(),

	notes: text("notes"),
});

export const payrollAdjustments = pgTable("payroll_adjustments", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	payrollHistoryId: text("payroll_history_id")
		.notNull()
		.references(() => payrollHistory.id, { onDelete: "cascade" }),

	type: adjustmentTypeEnum("type").notNull(),
	description: text("description").notNull(),
	amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	employees: many(employees), // A user (contractor) has many employees
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

// Relations for Employee Management
export const employeesRelations = relations(employees, ({ one, many }) => ({
	// An employee belongs to one user (contractor)
	contractor: one(user, {
		fields: [employees.contractorId],
		references: [user.id],
	}),
	// An employee has one bank detail record
	bankDetails: one(employeeBankDetails, {
		fields: [employees.id],
		references: [employeeBankDetails.employeeId],
	}),
	// An employee has many pay rates
	payRates: many(employeePayRates),
	// An employee has many attendance records
	attendanceRecords: many(attendanceRecords),
	// An employee has many payroll history records
	payrollHistory: many(payrollHistory),
}));

export const employeeBankDetailsRelations = relations(
	employeeBankDetails,
	({ one }) => ({
		employee: one(employees, {
			fields: [employeeBankDetails.employeeId],
			references: [employees.id],
		}),
	}),
);

export const employeePayRatesRelations = relations(
	employeePayRates,
	({ one }) => ({
		employee: one(employees, {
			fields: [employeePayRates.employeeId],
			references: [employees.id],
		}),
	}),
);

export const attendanceRecordsRelations = relations(
	attendanceRecords,
	({ one }) => ({
		employee: one(employees, {
			fields: [attendanceRecords.employeeId],
			references: [employees.id],
		}),
	}),
);

export const payrollHistoryRelations = relations(
	payrollHistory,
	({ one, many }) => ({
		employee: one(employees, {
			fields: [payrollHistory.employeeId],
			references: [employees.id],
		}),
		adjustments: many(payrollAdjustments),
	}),
);

export const payrollAdjustmentsRelations = relations(
	payrollAdjustments,
	({ one }) => ({
		payrollHistory: one(payrollHistory, {
			fields: [payrollAdjustments.payrollHistoryId],
			references: [payrollHistory.id],
		}),
	}),
);

// Type exports
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;

export type Employee = typeof employees.$inferSelect;
export type EmployeeInsert = typeof employees.$inferInsert;
export type EmployeeBankDetails = typeof employeeBankDetails.$inferSelect;
export type EmployeePayRate = typeof employeePayRates.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type PayrollHistory = typeof payrollHistory.$inferSelect;
export type PayrollAdjustment = typeof payrollAdjustments.$inferSelect;
export type PayrollAdjustmentInsert = typeof payrollAdjustments.$inferInsert;
