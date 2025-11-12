import { z } from "zod";

/**
 * Quotation item validation schema
 */
export const quotationItemSchema = z.object({
	description: z.string().min(1, "La descripción es requerida"),
	quantity: z.string().min(1, "La cantidad es requerida"),
	unitPrice: z.string().min(1, "El precio unitario es requerido"),
	lineTotal: z.string(),
	id: z.string(),
});

/**
 * Quotation form validation schema
 */
export const quotationFormSchema = z.object({
	clientId: z.string().min(1, "El cliente es requerido"),
	quotationNumber: z.string().min(1, "El número de presupuesto es requerido"),
	issueDate: z.string().min(1, "La fecha de emisión es requerida"),
	validityDays: z.string(),
	termsAndConditions: z.string(),
	internalNotes: z.string(),
	subtotal: z.string(),
	total: z.string(),
	items: z.array(quotationItemSchema).min(1, "Debe agregar al menos un ítem"),
});

export type QuotationFormData = z.infer<typeof quotationFormSchema>;
export type QuotationItemFormData = z.infer<typeof quotationItemSchema>;
