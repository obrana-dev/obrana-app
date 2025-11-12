import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { EmployeeCard } from "@/components/employees/employee-card";
import { EmployeeListHeader } from "@/components/employees/employee-list-header";
import { Button } from "@/components/ui/button";
import {
	employeesQueryOptions,
	useEmployees,
	useToggleEmployeeStatus,
} from "@/queries/employees";

export const Route = createFileRoute("/_authed/employees/")({
	component: EmployeeList,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(employeesQueryOptions());
	},
});

function EmployeeList() {
	const { data: employees, isLoading } = useEmployees();
	const toggleStatus = useToggleEmployeeStatus();
	const [showInactive, setShowInactive] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredEmployees = useMemo(() => {
		if (!employees) return [];

		return employees
			.filter((emp) => (showInactive ? !emp.isActive : emp.isActive))
			.filter((emp) => {
				if (!searchQuery) return true;
				const query = searchQuery.toLowerCase();
				return (
					emp.firstName.toLowerCase().includes(query) ||
					emp.lastName.toLowerCase().includes(query) ||
					emp.phone?.toLowerCase().includes(query) ||
					emp.email?.toLowerCase().includes(query) ||
					emp.jobCategory?.toLowerCase().includes(query)
				);
			});
	}, [employees, showInactive, searchQuery]);

	const handleToggleStatus = (id: string, isActive: boolean) => {
		toggleStatus.mutate({ data: { id, isActive } });
	};

	if (isLoading) {
		return <LoadingState message="Cargando empleados..." />;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<EmployeeListHeader
				count={filteredEmployees.length}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				showInactive={showInactive}
				onToggleInactive={setShowInactive}
			/>

			{/* Employee List */}
			<div className="p-4 sm:p-6">
				{filteredEmployees.length === 0 ? (
					<EmptyState
						icon={Users}
						title={
							searchQuery
								? "No se encontraron empleados"
								: `No hay empleados ${showInactive ? "inactivos" : "activos"}`
						}
						description={
							searchQuery
								? "Intenta con otros términos de búsqueda"
								: "Comienza agregando tu primer empleado"
						}
						action={
							!searchQuery ? (
								<Link to="/employees/new">
									<Button>
										<Plus className="w-4 h-4 mr-2" />
										Agregar Empleado
									</Button>
								</Link>
							) : undefined
						}
					/>
				) : (
					<div className="grid grid-cols-1 gap-3 sm:gap-4">
						{filteredEmployees.map((employee) => (
							<EmployeeCard
								key={employee.id}
								employee={employee}
								onToggleStatus={handleToggleStatus}
								isPending={toggleStatus.isPending}
							/>
						))}
					</div>
				)}
			</div>

			{/* Floating Action Button - Mobile Only */}
			<Link
				to="/employees/new"
				className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
			>
				<Plus className="w-6 h-6" />
			</Link>
		</div>
	);
}
