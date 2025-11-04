import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	batchSaveAttendanceFn,
	getWeekAttendanceFn,
	saveAttendanceFn,
} from "@/services/attendance";

// Get attendance for a week
export function useWeekAttendance(startDate: string, endDate: string) {
	return useQuery({
		queryKey: ["attendance", startDate, endDate],
		queryFn: async () => {
			return await getWeekAttendanceFn({ data: { startDate, endDate } });
		},
		enabled: !!startDate && !!endDate,
	});
}

// Save single attendance record
export function useSaveAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: saveAttendanceFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["attendance"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al guardar la asistencia");
		},
	});
}

// Batch save attendance records
export function useBatchSaveAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: batchSaveAttendanceFn,
		onSuccess: (data) => {
			console.log("Mutation success, saved records:", data);
			queryClient.invalidateQueries({ queryKey: ["attendance"] });
			toast.success("Asistencia guardada correctamente");
		},
		onError: (error: Error) => {
			console.log("Mutation error:", error);
			toast.error(error.message || "Error al guardar la asistencia");
		},
	});
}
