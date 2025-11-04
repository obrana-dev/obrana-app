import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getPayrollHistoryFn,
	getPayrollSummaryFn,
	savePayrollFn,
} from "@/services/payroll";

// Get payroll summary for a period
export function usePayrollSummary(startDate: string, endDate: string) {
	return useQuery({
		queryKey: ["payroll", startDate, endDate],
		queryFn: async () => {
			return await getPayrollSummaryFn({ data: { startDate, endDate } });
		},
		enabled: !!startDate && !!endDate,
	});
}

// Save payroll
export function useSavePayroll() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: savePayrollFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payroll"] });
			queryClient.invalidateQueries({ queryKey: ["payroll-history"] });
			toast.success("Nómina guardada correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al guardar la nómina");
		},
	});
}

// Get payroll history
export function usePayrollHistory() {
	return useQuery({
		queryKey: ["payroll-history"],
		queryFn: async () => {
			return await getPayrollHistoryFn();
		},
	});
}
