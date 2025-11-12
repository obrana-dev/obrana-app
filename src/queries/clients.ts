import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Client } from "@/db/schema";
import {
	createClientFn,
	deleteClientFn,
	getClientFn,
	listClientsFn,
	updateClientFn,
} from "@/services/clients";

// Query options
export const clientsQueryOptions = (searchTerm?: string) =>
	queryOptions({
		queryKey: ["clients", searchTerm],
		queryFn: async () => {
			return await listClientsFn({ data: searchTerm });
		},
	});

export const clientQueryOptions = (clientId: string) =>
	queryOptions({
		queryKey: ["clients", clientId],
		queryFn: async () => {
			return await getClientFn({ data: clientId });
		},
		enabled: !!clientId,
	});

// List all clients
export function useClients(searchTerm?: string) {
	return useQuery(clientsQueryOptions(searchTerm));
}

// Get single client
export function useClient(clientId: string) {
	return useQuery(clientQueryOptions(clientId));
}

// Create client
export function useCreateClient(options?: {
	onSuccessCallback?: (data: Client) => void;
	redirectOnSuccess?: boolean;
}) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createClientFn,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			toast.success("Cliente creado correctamente");

			// Call custom callback if provided (for inline creation)
			if (options?.onSuccessCallback) {
				options.onSuccessCallback(data);
			}

			// Redirect to clients list if not using inline mode
			if (options?.redirectOnSuccess !== false) {
				navigate({ to: "/clients" });
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al crear el cliente");
		},
	});
}

// Update client
export function useUpdateClient() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: updateClientFn,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			queryClient.invalidateQueries({
				queryKey: ["clients", variables.data.id],
			});
			toast.success("Cliente actualizado correctamente");
			navigate({ to: "/clients" });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al actualizar el cliente");
		},
	});
}

// Delete client
export function useDeleteClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteClientFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			toast.success("Cliente eliminado correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al eliminar el cliente");
		},
	});
}
