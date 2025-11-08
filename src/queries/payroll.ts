import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getPayrollHistoryFn,
	getPayrollRunsFn,
	getPayrollSummaryFn,
	savePayrollFn,
} from "@/services/payroll";

// Query options
export const payrollSummaryQueryOptions = (
	startDate: string,
	endDate: string,
) =>
	queryOptions({
		queryKey: ["payroll", startDate, endDate],
		queryFn: async () => {
			return await getPayrollSummaryFn({ data: { startDate, endDate } });
		},
		enabled: !!startDate && !!endDate,
	});

export const payrollHistoryQueryOptions = () =>
	queryOptions({
		queryKey: ["payroll-history"],
		queryFn: async () => {
			return await getPayrollHistoryFn();
		},
	});

export const payrollRunsQueryOptions = () =>
	queryOptions({
		queryKey: ["payroll-runs"],
		queryFn: async () => {
			return await getPayrollRunsFn();
		},
	});

// Get payroll summary for a period
export function usePayrollSummary(startDate: string, endDate: string) {
	return useQuery(payrollSummaryQueryOptions(startDate, endDate));
}

// Save payroll
export function useSavePayroll() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: savePayrollFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payroll"] });
			queryClient.invalidateQueries({ queryKey: ["payroll-history"] });
			queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
			toast.success("Nómina guardada correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al guardar la nómina");
		},
	});
}

// Get payroll history
export function usePayrollHistory() {
	return useQuery(payrollHistoryQueryOptions());
}

// Get payroll runs (grouped by pay period)
export function usePayrollRuns() {
	return useQuery(payrollRunsQueryOptions());
}
