import { createServerFn } from "@tanstack/react-start";
import { and, between, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
	attendanceRecords,
	employeePayRates,
	employees,
	payrollAdjustments,
	payrollHistory,
} from "@/db/schema";
import authMiddleware from "@/middlewares/auth";

// Get payroll summary for a period
const getPayrollSummarySchema = z.object({
	startDate: z.string(), // ISO date string
	endDate: z.string(), // ISO date string
});

export const getPayrollSummaryFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getPayrollSummarySchema)
	.handler(async ({ data, context }) => {
		// Use relational query to fetch all data efficiently (fixes N+1 query problem)
		const contractorEmployees = await db.query.employees.findMany({
			where: and(
				eq(employees.contractorId, context.session.user.id),
				eq(employees.isActive, true),
			),
			with: {
				payRates: {
					orderBy: desc(employeePayRates.effectiveDate),
					limit: 1,
				},
				attendanceRecords: {
					where: between(
						attendanceRecords.workDate,
						data.startDate,
						data.endDate,
					),
				},
			},
		});

		// Calculate payroll for each employee (data already loaded)
		const payrollSummary = contractorEmployees.map((employee) => {
			// Get the most recent pay rate
			const currentRate = employee.payRates[0];

			// Calculate total units worked
			const totalUnits = employee.attendanceRecords.reduce(
				(sum, record) => sum + Number.parseFloat(record.unitsWorked),
				0,
			);

			// Calculate gross pay based on employment type
			const rate = Number.parseFloat(currentRate?.rate || "0");
			const grossPay = totalUnits * rate;

			return {
				employeeId: employee.id,
				employeeName: `${employee.firstName} ${employee.lastName}`,
				employmentType: employee.employmentType,
				unitsWorked: totalUnits,
				rate: currentRate?.rate || "0",
				grossPay: grossPay.toFixed(2),
				bonuses: "0",
				deductions: "0",
				netPay: grossPay.toFixed(2),
			};
		});

		return payrollSummary;
	});

// Save payroll history
const savePayrollSchema = z.object({
	payPeriodStart: z.string(),
	payPeriodEnd: z.string(),
	records: z.array(
		z.object({
			employeeId: z.string(),
			employeeName: z.string(),
			grossPay: z.string(),
			adjustments: z
				.array(
					z.object({
						type: z.enum(["BONUS", "DEDUCTION"]),
						description: z.string(),
						amount: z.string(),
					}),
				)
				.default([]),
			netPay: z.string(),
		}),
	),
});

export const savePayrollFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(savePayrollSchema)
	.handler(async ({ data, context }) => {
		// Verify all employees belong to contractor
		const contractorEmployees = await db
			.select()
			.from(employees)
			.where(eq(employees.contractorId, context.session.user.id));

		const validEmployeeIds = new Set(contractorEmployees.map((e) => e.id));

		// Filter out invalid employees
		const validRecords = data.records.filter((r) =>
			validEmployeeIds.has(r.employeeId),
		);

		if (validRecords.length === 0) {
			throw new Error("No valid employees found");
		}

		// Insert payroll history records and their adjustments
		const results = await Promise.all(
			validRecords.map(async (record) => {
				// Calculate totals from adjustments
				const bonuses = record.adjustments
					.filter((adj) => adj.type === "BONUS")
					.reduce((sum, adj) => sum + Number.parseFloat(adj.amount), 0);

				const deductions = record.adjustments
					.filter((adj) => adj.type === "DEDUCTION")
					.reduce((sum, adj) => sum + Number.parseFloat(adj.amount), 0);

				// Insert payroll history record
				const [payrollRecord] = await db
					.insert(payrollHistory)
					.values({
						employeeId: record.employeeId,
						employeeName: record.employeeName,
						payPeriodStart: data.payPeriodStart,
						payPeriodEnd: data.payPeriodEnd,
						grossPay: record.grossPay,
						bonuses: bonuses.toFixed(2),
						deductions: deductions.toFixed(2),
						netPay: record.netPay,
					})
					.returning();

				// Insert adjustment items if any
				if (record.adjustments.length > 0) {
					await db.insert(payrollAdjustments).values(
						record.adjustments.map((adj) => ({
							payrollHistoryId: payrollRecord.id,
							type: adj.type,
							description: adj.description,
							amount: adj.amount,
						})),
					);
				}

				return payrollRecord;
			}),
		);

		return results;
	});

// Get payroll history (individual records)
export const getPayrollHistoryFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		// Get all payroll history for the contractor's employees
		const history = await db
			.select({
				id: payrollHistory.id,
				employeeId: payrollHistory.employeeId,
				employeeName: payrollHistory.employeeName,
				payPeriodStart: payrollHistory.payPeriodStart,
				payPeriodEnd: payrollHistory.payPeriodEnd,
				paymentDate: payrollHistory.paymentDate,
				grossPay: payrollHistory.grossPay,
				bonuses: payrollHistory.bonuses,
				deductions: payrollHistory.deductions,
				netPay: payrollHistory.netPay,
				notes: payrollHistory.notes,
			})
			.from(payrollHistory)
			.innerJoin(employees, eq(payrollHistory.employeeId, employees.id))
			.where(eq(employees.contractorId, context.session.user.id))
			.orderBy(desc(payrollHistory.paymentDate));

		return history;
	});

// Get payroll runs (grouped by pay period)
export const getPayrollRunsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		// Get all payroll history for the contractor's employees
		const history = await db
			.select({
				id: payrollHistory.id,
				employeeId: payrollHistory.employeeId,
				employeeName: payrollHistory.employeeName,
				payPeriodStart: payrollHistory.payPeriodStart,
				payPeriodEnd: payrollHistory.payPeriodEnd,
				paymentDate: payrollHistory.paymentDate,
				grossPay: payrollHistory.grossPay,
				bonuses: payrollHistory.bonuses,
				deductions: payrollHistory.deductions,
				netPay: payrollHistory.netPay,
			})
			.from(payrollHistory)
			.innerJoin(employees, eq(payrollHistory.employeeId, employees.id))
			.where(eq(employees.contractorId, context.session.user.id))
			.orderBy(desc(payrollHistory.paymentDate));

		// Group by pay period and payment date
		const grouped = new Map<
			string,
			{
				payPeriodStart: string;
				payPeriodEnd: string;
				paymentDate: string;
				employeeCount: number;
				totalGross: number;
				totalBonuses: number;
				totalDeductions: number;
				totalNet: number;
				employees: Array<{
					id: string;
					employeeId: string;
					employeeName: string;
					grossPay: string;
					bonuses: string;
					deductions: string;
					netPay: string;
				}>;
			}
		>();

		for (const record of history) {
			const key = `${record.payPeriodStart}_${record.payPeriodEnd}_${record.paymentDate}`;

			if (!grouped.has(key)) {
				grouped.set(key, {
					payPeriodStart: record.payPeriodStart,
					payPeriodEnd: record.payPeriodEnd,
					paymentDate: record.paymentDate,
					employeeCount: 0,
					totalGross: 0,
					totalBonuses: 0,
					totalDeductions: 0,
					totalNet: 0,
					employees: [],
				});
			}

			const group = grouped.get(key);
			if (group) {
				group.employeeCount += 1;
				group.totalGross += Number.parseFloat(record.grossPay);
				group.totalBonuses += Number.parseFloat(record.bonuses || "0");
				group.totalDeductions += Number.parseFloat(record.deductions || "0");
				group.totalNet += Number.parseFloat(record.netPay);
				group.employees.push({
					id: record.id,
					employeeId: record.employeeId,
					employeeName: record.employeeName,
					grossPay: record.grossPay,
					bonuses: record.bonuses || "0",
					deductions: record.deductions || "0",
					netPay: record.netPay,
				});
			}
		}

		return Array.from(grouped.values());
	});
