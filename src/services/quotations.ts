import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
	clients,
	quotationHistory,
	quotationItems,
	quotations,
} from "@/db/schema";
import authMiddleware from "@/middlewares/auth";

// List all quotations for the current contractor with optional filters
const listQuotationsInput = z.object({
	searchTerm: z.string().optional(),
	status: z
		.enum(["DRAFT", "REVIEW", "APPROVED", "REJECTED", "CANCELED"])
		.optional(),
	clientId: z.string().optional(),
});

export const listQuotationsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(listQuotationsInput.optional())
	.handler(async ({ data, context }) => {
		const whereConditions: Array<
			ReturnType<typeof eq> | ReturnType<typeof and> | ReturnType<typeof or>
		> = [eq(quotations.contractorId, context.session.user.id)];

		// Add filters if provided
		if (data?.status) {
			whereConditions.push(eq(quotations.status, data.status));
		}

		if (data?.clientId) {
			whereConditions.push(eq(quotations.clientId, data.clientId));
		}

		if (data?.searchTerm && data.searchTerm.trim() !== "") {
			const searchCondition = or(
				ilike(quotations.quotationNumber, `%${data.searchTerm}%`),
				ilike(quotations.internalNotes, `%${data.searchTerm}%`),
			);
			if (searchCondition) {
				whereConditions.push(searchCondition);
			}
		}

		const allQuotations = await db
			.select({
				quotation: quotations,
				client: clients,
			})
			.from(quotations)
			.leftJoin(clients, eq(quotations.clientId, clients.id))
			.where(and(...whereConditions))
			.orderBy(desc(quotations.createdAt));

		return allQuotations.map((row) => ({
			...row.quotation,
			client: row.client,
		}));
	});

// Get next quotation number
export const getNextQuotationNumberFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		// Get the latest quotation number for this contractor
		const [lastQuotation] = await db
			.select({
				quotationNumber: quotations.quotationNumber,
			})
			.from(quotations)
			.where(eq(quotations.contractorId, context.session.user.id))
			.orderBy(desc(quotations.createdAt))
			.limit(1);

		if (!lastQuotation) {
			return "1";
		}

		// Extract number from quotation number (assuming format like "1", "2", "3", etc.)
		// If the format is more complex (like "Q-001"), adjust this logic
		const currentNumber = Number.parseInt(lastQuotation.quotationNumber, 10);
		const nextNumber = Number.isNaN(currentNumber) ? 1 : currentNumber + 1;

		return nextNumber.toString();
	});

// Get a single quotation with items and history
export const getQuotationFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.string())
	.handler(async ({ data: quotationId, context }) => {
		const [quotation] = await db
			.select({
				quotation: quotations,
				client: clients,
			})
			.from(quotations)
			.leftJoin(clients, eq(quotations.clientId, clients.id))
			.where(
				and(
					eq(quotations.id, quotationId),
					eq(quotations.contractorId, context.session.user.id),
				),
			);

		if (!quotation) {
			throw new Error("Presupuesto no encontrado");
		}

		// Get quotation items
		const items = await db
			.select()
			.from(quotationItems)
			.where(eq(quotationItems.quotationId, quotationId));

		// Get quotation history
		const history = await db
			.select()
			.from(quotationHistory)
			.where(eq(quotationHistory.quotationId, quotationId))
			.orderBy(desc(quotationHistory.createdAt));

		return {
			...quotation.quotation,
			client: quotation.client,
			items,
			history,
		};
	});

// Create a new quotation
const quotationItemSchema = z.object({
	description: z.string().min(1, "La descripción es requerida"),
	quantity: z.string().min(1, "La cantidad es requerida"),
	unitPrice: z.string().min(1, "El precio unitario es requerido"),
	lineTotal: z.string(),
});

const createQuotationSchema = z.object({
	clientId: z.string().min(1, "El cliente es requerido"),
	quotationNumber: z.string().min(1, "El número de presupuesto es requerido"),
	issueDate: z.string().min(1, "La fecha de emisión es requerida"),
	validityDays: z.string().optional().nullable(),
	termsAndConditions: z.string().optional().nullable(),
	internalNotes: z.string().optional().nullable(),
	subtotal: z.string(),
	total: z.string(),
	items: z.array(quotationItemSchema).min(1, "Debe agregar al menos un ítem"),
});

export const createQuotationFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createQuotationSchema)
	.handler(async ({ data, context }) => {
		const { items: itemsData, ...quotationData } = data;

		// Verify client belongs to contractor
		const [client] = await db
			.select()
			.from(clients)
			.where(
				and(
					eq(clients.id, data.clientId),
					eq(clients.contractorId, context.session.user.id),
				),
			);

		if (!client) {
			throw new Error("Cliente no encontrado");
		}

		// Create quotation
		const [newQuotation] = await db
			.insert(quotations)
			.values({
				...quotationData,
				contractorId: context.session.user.id,
			})
			.returning();

		// Create quotation items
		await db.insert(quotationItems).values(
			itemsData.map((item) => ({
				quotationId: newQuotation.id,
				description: item.description,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				lineTotal: item.lineTotal,
			})),
		);

		// Create initial history entry
		await db.insert(quotationHistory).values({
			quotationId: newQuotation.id,
			action: "Presupuesto creado",
		});

		return newQuotation;
	});

// Update a quotation
const updateQuotationSchema = createQuotationSchema
	.partial()
	.extend({ id: z.string() });

export const updateQuotationFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateQuotationSchema)
	.handler(async ({ data, context }) => {
		const { id, items: itemsData, ...quotationData } = data;

		// Verify ownership
		const [existing] = await db
			.select()
			.from(quotations)
			.where(
				and(
					eq(quotations.id, id),
					eq(quotations.contractorId, context.session.user.id),
				),
			);

		if (!existing) {
			throw new Error("Presupuesto no encontrado");
		}

		// Update quotation
		const [updatedQuotation] = await db
			.update(quotations)
			.set(quotationData)
			.where(eq(quotations.id, id))
			.returning();

		// If items are provided, delete old ones and create new ones
		if (itemsData && itemsData.length > 0) {
			await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));

			await db.insert(quotationItems).values(
				itemsData.map((item) => ({
					quotationId: id,
					description: item.description,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
					lineTotal: item.lineTotal,
				})),
			);
		}

		// Add history entry
		await db.insert(quotationHistory).values({
			quotationId: id,
			action: "Presupuesto actualizado",
		});

		return updatedQuotation;
	});

// Update quotation status
const updateStatusSchema = z.object({
	id: z.string(),
	status: z.enum(["DRAFT", "REVIEW", "APPROVED", "REJECTED", "CANCELED"]),
});

export const updateQuotationStatusFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateStatusSchema)
	.handler(async ({ data, context }) => {
		// Verify ownership
		const [existing] = await db
			.select()
			.from(quotations)
			.where(
				and(
					eq(quotations.id, data.id),
					eq(quotations.contractorId, context.session.user.id),
				),
			);

		if (!existing) {
			throw new Error("Presupuesto no encontrado");
		}

		// Update status
		const [updated] = await db
			.update(quotations)
			.set({ status: data.status })
			.where(eq(quotations.id, data.id))
			.returning();

		// Add history entry
		const statusLabels = {
			DRAFT: "Borrador",
			REVIEW: "En Revisión",
			APPROVED: "Aprobado",
			REJECTED: "Rechazado",
			CANCELED: "Cancelado",
		};

		await db.insert(quotationHistory).values({
			quotationId: data.id,
			action: `Estado cambiado a ${statusLabels[data.status]}`,
		});

		return updated;
	});

// Delete a quotation
export const deleteQuotationFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.string())
	.handler(async ({ data: quotationId, context }) => {
		// Verify ownership
		const [existing] = await db
			.select()
			.from(quotations)
			.where(
				and(
					eq(quotations.id, quotationId),
					eq(quotations.contractorId, context.session.user.id),
				),
			);

		if (!existing) {
			throw new Error("Presupuesto no encontrado");
		}

		// Delete quotation (items and history will cascade)
		await db.delete(quotations).where(eq(quotations.id, quotationId));

		return { success: true };
	});
