import { z } from "zod";

/**
 * Client form validation schema
 */
export const clientFormSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	email: z.union([
		z.email({ message: "Email inválido" }),
		z.literal(""),
	]),
	phone: z.string(),
	address: z.string(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
