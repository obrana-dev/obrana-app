import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createEmployeeFn,
	getEmployeeFn,
	listEmployeesFn,
	toggleEmployeeStatusFn,
	updateEmployeeFn,
} from "@/services/employees";

// List all employees
export function useEmployees() {
	return useQuery({
		queryKey: ["employees"],
		queryFn: async () => {
			return await listEmployeesFn();
		},
	});
}

// Get single employee
export function useEmployee(employeeId: string) {
	return useQuery({
		queryKey: ["employees", employeeId],
		queryFn: async () => {
			return await getEmployeeFn({ data: employeeId });
		},
		enabled: !!employeeId,
	});
}

// Create employee
export function useCreateEmployee() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createEmployeeFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			toast.success("Empleado creado correctamente");
			navigate({ to: "/employees" });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al crear el empleado");
		},
	});
}

// Update employee
export function useUpdateEmployee() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: updateEmployeeFn,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({
				queryKey: ["employees", variables.data.id],
			});
			toast.success("Empleado actualizado correctamente");
			navigate({ to: "/employees" });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al actualizar el empleado");
		},
	});
}

// Toggle employee status
export function useToggleEmployeeStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: toggleEmployeeStatusFn,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({ queryKey: ["employees", data.id] });
			toast.success(
				data.isActive
					? "Empleado activado correctamente"
					: "Empleado desactivado correctamente",
			);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al cambiar el estado del empleado");
		},
	});
}
