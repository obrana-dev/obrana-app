import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createQuotationFn,
	deleteQuotationFn,
	getNextQuotationNumberFn,
	getQuotationFn,
	listQuotationsFn,
	updateQuotationFn,
	updateQuotationStatusFn,
} from "@/services/quotations";

// Query options
export const quotationsQueryOptions = (filters?: {
	searchTerm?: string;
	status?: "DRAFT" | "REVIEW" | "APPROVED" | "REJECTED" | "CANCELED";
	clientId?: string;
}) =>
	queryOptions({
		queryKey: ["quotations", filters],
		queryFn: async () => {
			return await listQuotationsFn({ data: filters });
		},
	});

export const quotationQueryOptions = (quotationId: string) =>
	queryOptions({
		queryKey: ["quotations", quotationId],
		queryFn: async () => {
			return await getQuotationFn({ data: quotationId });
		},
		enabled: !!quotationId,
	});

export const nextQuotationNumberQueryOptions = () =>
	queryOptions({
		queryKey: ["quotations", "next-number"],
		queryFn: async () => {
			return await getNextQuotationNumberFn();
		},
	});

// List all quotations
export function useQuotations(filters?: {
	searchTerm?: string;
	status?: "DRAFT" | "REVIEW" | "APPROVED" | "REJECTED" | "CANCELED";
	clientId?: string;
}) {
	return useQuery(quotationsQueryOptions(filters));
}

// Get single quotation
export function useQuotation(quotationId: string) {
	return useQuery(quotationQueryOptions(quotationId));
}

// Get next quotation number
export function useNextQuotationNumber() {
	return useQuery(nextQuotationNumberQueryOptions());
}

// Create quotation
export function useCreateQuotation() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createQuotationFn,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["quotations"] });
			toast.success("Presupuesto creado correctamente");
			navigate({
				to: "/quotations/$quotationId",
				params: { quotationId: data.id },
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al crear el presupuesto");
		},
	});
}

// Update quotation
export function useUpdateQuotation() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: updateQuotationFn,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["quotations"] });
			queryClient.invalidateQueries({
				queryKey: ["quotations", variables.data.id],
			});
			toast.success("Presupuesto actualizado correctamente");
			navigate({ to: "/quotations" });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al actualizar el presupuesto");
		},
	});
}

// Update quotation status
export function useUpdateQuotationStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateQuotationStatusFn,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["quotations"] });
			queryClient.invalidateQueries({ queryKey: ["quotations", data.id] });
			toast.success("Estado actualizado correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al actualizar el estado");
		},
	});
}

// Delete quotation
export function useDeleteQuotation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteQuotationFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["quotations"] });
			toast.success("Presupuesto eliminado correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al eliminar el presupuesto");
		},
	});
}
