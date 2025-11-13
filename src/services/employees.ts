import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { employeeBankDetails, employeePayRates, employees } from "@/db/schema";
import authMiddleware from "@/middlewares/auth";
import { createEmployeeSchema, updateEmployeeSchema } from "@/schemas/employee";

// List all employees for the current contractor
export const listEmployeesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const allEmployees = await db
			.select()
			.from(employees)
			.where(eq(employees.contractorId, context.session.user.id))
			.orderBy(desc(employees.createdAt));

		return allEmployees;
	});

// Get a single employee with their current pay rate
export const getEmployeeFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.string())
	.handler(async ({ data: employeeId, context }) => {
		const [employee] = await db
			.select()
			.from(employees)
			.where(
				and(
					eq(employees.id, employeeId),
					eq(employees.contractorId, context.session.user.id),
				),
			);

		if (!employee) {
			throw new Error("Employee not found");
		}

		// Get current pay rate (most recent)
		const [currentRate] = await db
			.select()
			.from(employeePayRates)
			.where(eq(employeePayRates.employeeId, employeeId))
			.orderBy(desc(employeePayRates.effectiveDate))
			.limit(1);

		// Get bank details
		const [bankDetails] = await db
			.select()
			.from(employeeBankDetails)
			.where(eq(employeeBankDetails.employeeId, employeeId));

		return {
			...employee,
			currentRate: currentRate?.rate,
			bankDetails,
		};
	});

// Create a new employee
export const createEmployeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createEmployeeSchema)
	.handler(async ({ data, context }) => {
		const { rate, bankName, accountAlias, cbuCvu, ...employeeData } = data;

		// Create employee
		const [newEmployee] = await db
			.insert(employees)
			.values({
				...employeeData,
				contractorId: context.session.user.id,
			})
			.returning();

		// Create initial pay rate
		await db.insert(employeePayRates).values({
			employeeId: newEmployee.id,
			rate,
		});

		// Create bank details if provided
		if (bankName || accountAlias || cbuCvu) {
			await db.insert(employeeBankDetails).values({
				employeeId: newEmployee.id,
				bankName,
				accountAlias,
				cbuCvu,
			});
		}

		return newEmployee;
	});

// Update an employee
export const updateEmployeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateEmployeeSchema)
	.handler(async ({ data, context }) => {
		const { id, rate, bankName, accountAlias, cbuCvu, ...employeeData } = data;

		// Verify ownership
		const [existing] = await db
			.select()
			.from(employees)
			.where(
				and(
					eq(employees.id, id),
					eq(employees.contractorId, context.session.user.id),
				),
			);

		if (!existing) {
			throw new Error("Employee not found");
		}

		// Update employee
		const [updatedEmployee] = await db
			.update(employees)
			.set(employeeData)
			.where(eq(employees.id, id))
			.returning();

		// If rate changed, create new pay rate entry
		if (rate) {
			const [currentRate] = await db
				.select()
				.from(employeePayRates)
				.where(eq(employeePayRates.employeeId, id))
				.orderBy(desc(employeePayRates.effectiveDate))
				.limit(1);

			// Only add new rate if it's different from current
			if (!currentRate || currentRate.rate !== rate) {
				await db.insert(employeePayRates).values({
					employeeId: id,
					rate,
				});
			}
		}

		// Update or create bank details
		if (
			bankName !== undefined ||
			accountAlias !== undefined ||
			cbuCvu !== undefined
		) {
			const [existingBank] = await db
				.select()
				.from(employeeBankDetails)
				.where(eq(employeeBankDetails.employeeId, id));

			if (existingBank) {
				await db
					.update(employeeBankDetails)
					.set({
						bankName,
						accountAlias,
						cbuCvu,
					})
					.where(eq(employeeBankDetails.employeeId, id));
			} else {
				await db.insert(employeeBankDetails).values({
					employeeId: id,
					bankName,
					accountAlias,
					cbuCvu,
				});
			}
		}

		return updatedEmployee;
	});

// Toggle employee active status
const toggleStatusSchema = z.object({
	id: z.string(),
	isActive: z.boolean(),
});

export const toggleEmployeeStatusFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(toggleStatusSchema)
	.handler(async ({ data, context }) => {
		// Verify ownership
		const [existing] = await db
			.select()
			.from(employees)
			.where(
				and(
					eq(employees.id, data.id),
					eq(employees.contractorId, context.session.user.id),
				),
			);

		if (!existing) {
			throw new Error("Employee not found");
		}

		const [updated] = await db
			.update(employees)
			.set({ isActive: data.isActive })
			.where(eq(employees.id, data.id))
			.returning();

		return updated;
	});
