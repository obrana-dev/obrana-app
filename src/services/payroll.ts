import { createServerFn } from "@tanstack/react-start";
import { and, between, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
	attendanceRecords,
	employeePayRates,
	employees,
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
		// Get all active employees for the contractor
		const contractorEmployees = await db
			.select()
			.from(employees)
			.where(
				and(
					eq(employees.contractorId, context.session.user.id),
					eq(employees.isActive, true),
				),
			);

		// For each employee, calculate gross pay based on attendance
		const payrollSummary = await Promise.all(
			contractorEmployees.map(async (employee) => {
				// Get attendance records for this period
				const attendance = await db
					.select()
					.from(attendanceRecords)
					.where(
						and(
							eq(attendanceRecords.employeeId, employee.id),
							between(attendanceRecords.workDate, data.startDate, data.endDate),
						),
					);

				// Get current pay rate
				const [currentRate] = await db
					.select()
					.from(employeePayRates)
					.where(eq(employeePayRates.employeeId, employee.id))
					.orderBy(employeePayRates.effectiveDate)
					.limit(1);

				// Calculate gross pay based on employment type
				let grossPay = 0;

				if (employee.employmentType === "HOURLY") {
					// Sum hours worked * hourly rate
					const totalHours = attendance.reduce(
						(sum, record) => sum + Number.parseFloat(record.unitsWorked),
						0,
					);
					grossPay = totalHours * Number.parseFloat(currentRate?.rate || "0");
				} else if (employee.employmentType === "DAILY") {
					// Sum days worked * daily rate
					const totalDays = attendance.reduce(
						(sum, record) => sum + Number.parseFloat(record.unitsWorked),
						0,
					);
					grossPay = totalDays * Number.parseFloat(currentRate?.rate || "0");
				} else if (employee.employmentType === "SUB_CONTRACTOR") {
					// Sum units worked * rate
					const totalUnits = attendance.reduce(
						(sum, record) => sum + Number.parseFloat(record.unitsWorked),
						0,
					);
					grossPay = totalUnits * Number.parseFloat(currentRate?.rate || "0");
				}

				return {
					employeeId: employee.id,
					employeeName: `${employee.firstName} ${employee.lastName}`,
					employmentType: employee.employmentType,
					unitsWorked: attendance.reduce(
						(sum, record) => sum + Number.parseFloat(record.unitsWorked),
						0,
					),
					rate: currentRate?.rate || "0",
					grossPay: grossPay.toFixed(2),
					bonuses: "0",
					deductions: "0",
					netPay: grossPay.toFixed(2),
				};
			}),
		);

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
			bonuses: z.string().optional().nullable(),
			deductions: z.string().optional().nullable(),
			netPay: z.string(),
		}),
	),
});

export const savePayrollFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(savePayrollSchema)
	.handler(async ({ data, context }) => {
		// Verify all employees belong to contractor
		const employeeIds = data.records.map((r) => r.employeeId);
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

		// Insert payroll history records
		const results = await db
			.insert(payrollHistory)
			.values(
				validRecords.map((record) => ({
					employeeId: record.employeeId,
					employeeName: record.employeeName,
					payPeriodStart: data.payPeriodStart,
					payPeriodEnd: data.payPeriodEnd,
					grossPay: record.grossPay,
					bonuses: record.bonuses || "0",
					deductions: record.deductions || "0",
					netPay: record.netPay,
					paidDate: new Date().toISOString().split("T")[0],
				})),
			)
			.returning();

		return results;
	});

// Get payroll history
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
