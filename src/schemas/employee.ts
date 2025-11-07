import { z } from "zod";

/**
 * Employee form validation schema
 */
export const employeeFormSchema = z.object({
	firstName: z.string().min(1, "El nombre es requerido"),
	lastName: z.string().min(1, "El apellido es requerido"),
	phone: z.string().min(1, "El teléfono es requerido"),
	email: z.union([
		z.string().email({ message: "Email inválido" }),
		z.literal(""),
	]),
	address: z.string(),
	nationalId: z.string(),
	jobCategory: z.string(),
	employmentType: z.enum(["HOURLY", "DAILY", "SUB_CONTRACTOR"]),
	payFrequency: z.enum(["WEEKLY", "BI_WEEKLY", "MONTHLY"]),
	hireDate: z.string(),
	rate: z.string().min(1, "La tarifa es requerida"),
	insuranceDetails: z.string(),
	bankName: z.string(),
	accountAlias: z.string(),
	cbuCvu: z.string(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
