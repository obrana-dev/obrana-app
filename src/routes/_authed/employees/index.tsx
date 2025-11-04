import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEmployees, useToggleEmployeeStatus } from "@/queries/employees";

export const Route = createFileRoute("/_authed/employees/")({
	component: EmployeeList,
});

function EmployeeList() {
	const { data: employees, isLoading } = useEmployees();
	const toggleStatus = useToggleEmployeeStatus();
	const [showInactive, setShowInactive] = useState(false);

	const filteredEmployees = employees?.filter((emp) =>
		showInactive ? !emp.isActive : emp.isActive,
	);

	if (isLoading) {
		return (
			<div className="p-6">
				<p>Cargando empleados...</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-900">Empleados</h1>
				<Link to="/employees/new">
					<Button className="flex items-center gap-2">
						<Plus className="w-4 h-4" />
						Nuevo Empleado
					</Button>
				</Link>
			</div>

			{/* Toggle Active/Inactive */}
			<div className="mb-4 flex gap-2">
				<Button
					onPress={() => setShowInactive(false)}
					color={!showInactive ? "primary" : "ghost"}
					size="sm"
				>
					Activos
				</Button>
				<Button
					onPress={() => setShowInactive(true)}
					color={showInactive ? "primary" : "ghost"}
					size="sm"
				>
					Inactivos
				</Button>
			</div>

			{/* Employee List */}
			<div className="bg-white rounded-lg border border-gray-200">
				{filteredEmployees?.length === 0 ? (
					<div className="p-8 text-center text-gray-500">
						No hay empleados {showInactive ? "inactivos" : "activos"}
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredEmployees?.map((employee) => (
							<div
								key={employee.id}
								className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
							>
								<div className="flex-1">
									<Link
										to="/employees/$employeeId"
										params={{ employeeId: employee.id }}
										className="block"
									>
										<h3 className="font-medium text-gray-900">
											{employee.firstName} {employee.lastName}
										</h3>
										<div className="text-sm text-gray-500 flex gap-4 mt-1">
											{employee.phone && <span>{employee.phone}</span>}
											{employee.email && <span>{employee.email}</span>}
											{employee.jobCategory && (
												<span className="capitalize">
													{employee.jobCategory}
												</span>
											)}
										</div>
									</Link>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
										{employee.employmentType}
									</span>
									<Button
										size="sm"
										color={employee.isActive ? "ghost" : "primary"}
										onPress={() =>
											toggleStatus.mutate({
												data: {
													id: employee.id,
													isActive: !employee.isActive,
												},
											})
										}
										isDisabled={toggleStatus.isPending}
									>
										{employee.isActive ? "Desactivar" : "Activar"}
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
