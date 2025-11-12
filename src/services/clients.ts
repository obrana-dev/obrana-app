import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { clients } from "@/db/schema";
import authMiddleware from "@/middlewares/auth";

// List all clients for the current contractor with optional search
export const listClientsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.string().optional())
	.handler(async ({ data: searchTerm, context }) => {
		let query = db
			.select()
			.from(clients)
			.where(eq(clients.contractorId, context.session.user.id))
			.orderBy(desc(clients.createdAt))
			.$dynamic();

		if (searchTerm && searchTerm.trim() !== "") {
			query = query.where(
				or(
					ilike(clients.name, `%${searchTerm}%`),
					ilike(clients.email, `%${searchTerm}%`),
					ilike(clients.phone, `%${searchTerm}%`),
				),
			);
		}

		const allClients = await query.execute();
		return allClients;
	});

// Get a single client
export const getClientFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.string())
	.handler(async ({ data: clientId, context }) => {
		const [client] = await db
			.select()
			.from(clients)
			.where(
				and(
					eq(clients.id, clientId),
					eq(clients.contractorId, context.session.user.id),
				),
			);

		if (!client) {
			throw new Error("Cliente no encontrado");
		}

		return client;
	});

// Create a new client
const createClientSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	email: z.string().email("Email inválido").optional().nullable(),
	phone: z.string().optional().nullable(),
	address: z.string().optional().nullable(),
});

export const createClientFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createClientSchema)
	.handler(async ({ data, context }) => {
		const [newClient] = await db
			.insert(clients)
			.values({
				...data,
				contractorId: context.session.user.id,
			})
			.returning();

		return newClient;
	});

// Update a client
const updateClientSchema = createClientSchema.partial().extend({
	id: z.string(),
});

export const updateClientFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateClientSchema)
	.handler(async ({ data, context }) => {
		const { id, ...clientData } = data;

		// Verify ownership
		const [existing] = await db
			.select()
			.from(clients)
			.where(
				and(
					eq(clients.id, id),
					eq(clients.contractorId, context.session.user.id),
				),
			);

		if (!existing) {
			throw new Error("Cliente no encontrado");
		}

		// Update client
		const [updatedClient] = await db
			.update(clients)
			.set(clientData)
			.where(eq(clients.id, id))
			.returning();

		return updatedClient;
	});

// Delete a client
const deleteClientSchema = z.string();

export const deleteClientFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(deleteClientSchema)
	.handler(async ({ data: clientId, context }) => {
		// Verify ownership
		const [existing] = await db
			.select()
			.from(clients)
			.where(
				and(
					eq(clients.id, clientId),
					eq(clients.contractorId, context.session.user.id),
				),
			);

		if (!existing) {
			throw new Error("Cliente no encontrado");
		}

		// Delete client
		await db.delete(clients).where(eq(clients.id, clientId));

		return { success: true };
	});
