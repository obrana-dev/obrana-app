import { z } from "zod";

/**
 * Base employee schema for server-side validation (create)
 * This is the source of truth for employee validation
 */
export const createEmployeeSchema = z.object({
	firstName: z.string().min(1, "El nombre es requerido"),
	lastName: z.string().min(1, "El apellido es requerido"),
	email: z.string().email("Email inválido").optional().nullable(),
	phone: z.string().min(1, "El teléfono es requerido"),
	address: z.string().optional().nullable(),
	nationalId: z.string().optional().nullable(),
	jobCategory: z.string().optional().nullable(),
	employmentType: z.enum(["HOURLY", "DAILY", "SUB_CONTRACTOR"]),
	payFrequency: z.enum(["WEEKLY", "BI_WEEKLY", "MONTHLY"]),
	hireDate: z.string().optional().nullable(),
	insuranceDetails: z.string().optional().nullable(),
	rate: z.string().min(1, "La tarifa es requerida"),
	bankName: z.string().optional(),
	accountAlias: z.string().optional(),
	cbuCvu: z.string().optional(),
});

/**
 * Update employee schema (all fields optional except id)
 */
export const updateEmployeeSchema = createEmployeeSchema
	.partial()
	.extend({ id: z.string() });

/**
 * Client-side form schema (derived from server schema)
 * Uses strings instead of nullable for form compatibility
 */
export const employeeFormSchema = z.object({
	firstName: z.string().min(1, "El nombre es requerido"),
	lastName: z.string().min(1, "El apellido es requerido"),
	email: z.string(),
	phone: z.string().min(1, "El teléfono es requerido"),
	address: z.string(),
	nationalId: z.string(),
	jobCategory: z.string(),
	employmentType: z.enum(["HOURLY", "DAILY", "SUB_CONTRACTOR"]),
	payFrequency: z.enum(["WEEKLY", "BI_WEEKLY", "MONTHLY"]),
	hireDate: z.string(),
	insuranceDetails: z.string(),
	rate: z.string().min(1, "La tarifa es requerida"),
	bankName: z.string(),
	accountAlias: z.string(),
	cbuCvu: z.string(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
export type CreateEmployeeData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeData = z.infer<typeof updateEmployeeSchema>;
