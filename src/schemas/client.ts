import { z } from "zod";

/**
 * Base client schema for server-side validation (create)
 * This is the source of truth for client validation
 */
export const createClientSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	email: z.string().email("Email inválido").optional().nullable(),
	phone: z.string().optional().nullable(),
	address: z.string().optional().nullable(),
});

/**
 * Update client schema (all fields optional except id)
 */
export const updateClientSchema = createClientSchema.partial().extend({
	id: z.string(),
});

/**
 * Client-side form schema (derived from server schema)
 * Uses strings instead of nullable for form compatibility
 */
export const clientFormSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	email: z.string(),
	phone: z.string(),
	address: z.string(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
export type CreateClientData = z.infer<typeof createClientSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;
