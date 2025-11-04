import { createServerFn } from "@tanstack/react-start";
import { and, between, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { attendanceRecords, employees } from "@/db/schema";
import authMiddleware from "@/middlewares/auth";

// Get attendance records for a week
const getWeekAttendanceSchema = z.object({
	startDate: z.string(), // ISO date string
	endDate: z.string(), // ISO date string
});

export const getWeekAttendanceFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getWeekAttendanceSchema)
	.handler(async ({ data, context }) => {
		const contractorEmployeesWithRecords = await db.query.employees.findMany({
			where: and(
				eq(employees.contractorId, context.session.user.id),
				eq(employees.isActive, true),
			),
			with: {
				attendanceRecords: {
					where: between(
						attendanceRecords.workDate,
						data.startDate,
						data.endDate,
					),
					// Optional: order them by date
					orderBy: (records, { asc }) => [asc(records.workDate)],
				},
			},
		});

		return contractorEmployeesWithRecords;
	});

// Save/Update attendance for a single day
const saveAttendanceSchema = z.object({
	employeeId: z.string(),
	workDate: z.string(), // ISO date string
	unitsWorked: z.string(), // numeric string
	status: z.enum(["PRESENT", "SICK", "VACATION", "ABSENT"]),
	projectId: z.string().optional().nullable(),
	notes: z.string().optional().nullable(),
});

export const saveAttendanceFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(saveAttendanceSchema)
	.handler(async ({ data, context }) => {
		// Verify employee belongs to contractor
		const [employee] = await db
			.select()
			.from(employees)
			.where(
				and(
					eq(employees.id, data.employeeId),
					eq(employees.contractorId, context.session.user.id),
				),
			);

		if (!employee) {
			throw new Error("Employee not found");
		}

		// Check if record exists
		const [existing] = await db
			.select()
			.from(attendanceRecords)
			.where(
				and(
					eq(attendanceRecords.employeeId, data.employeeId),
					eq(attendanceRecords.workDate, data.workDate),
				),
			);

		if (existing) {
			// Update existing record
			const [updated] = await db
				.update(attendanceRecords)
				.set({
					unitsWorked: data.unitsWorked,
					status: data.status,
					projectId: data.projectId,
					notes: data.notes,
				})
				.where(eq(attendanceRecords.id, existing.id))
				.returning();
			return updated;
		}

		// Create new record
		const [newRecord] = await db
			.insert(attendanceRecords)
			.values({
				employeeId: data.employeeId,
				workDate: data.workDate,
				unitsWorked: data.unitsWorked,
				status: data.status,
				projectId: data.projectId,
				notes: data.notes,
			})
			.returning();

		return newRecord;
	});

// Batch save attendance for multiple employees/days
const batchSaveAttendanceSchema = z.object({
	records: z.array(
		z.object({
			employeeId: z.string(),
			workDate: z.string(),
			unitsWorked: z.string(),
			status: z.enum(["PRESENT", "SICK", "VACATION", "ABSENT"]),
			projectId: z.string().optional().nullable(),
			notes: z.string().optional().nullable(),
		}),
	),
});

export const batchSaveAttendanceFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(batchSaveAttendanceSchema)
	.handler(async ({ data, context }) => {
		const contractorEmployees = await db
			.select()
			.from(employees)
			.where(
				and(
					eq(employees.contractorId, context.session.user.id),
					eq(employees.isActive, true),
				),
			);

		const validEmployeeIds = new Set(contractorEmployees.map((e) => e.id));

		// Filter out invalid employees
		const validRecords = data.records.filter((r) =>
			validEmployeeIds.has(r.employeeId),
		);

		// Process each record
		const results = await Promise.all(
			validRecords.map(async (record) => {
				// Check if exists
				const [existing] = await db
					.select()
					.from(attendanceRecords)
					.where(
						and(
							eq(attendanceRecords.employeeId, record.employeeId),
							eq(attendanceRecords.workDate, record.workDate),
						),
					);

				if (existing) {
					// Update
					const [updated] = await db
						.update(attendanceRecords)
						.set({
							unitsWorked: record.unitsWorked,
							status: record.status,
							projectId: record.projectId,
							notes: record.notes,
						})
						.where(eq(attendanceRecords.id, existing.id))
						.returning();
					return updated;
				}

				// Create
				const [newRecord] = await db
					.insert(attendanceRecords)
					.values(record)
					.returning();
				return newRecord;
			}),
		);

		return results;
	});
