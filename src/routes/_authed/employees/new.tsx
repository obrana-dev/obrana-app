import { createFileRoute } from "@tanstack/react-router";
import { EmployeeFormHeader } from "@/components/employees/employee-form-header";
import { EmployeeForm } from "@/components/forms/employee-form";

export const Route = createFileRoute("/_authed/employees/new")({
	component: NewEmployee,
});

function NewEmployee() {
	return (
		<div className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
			<EmployeeFormHeader
				title="Nuevo Empleado"
				subtitle="Completa la información del empleado"
			/>

			<div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
				<EmployeeForm mode="create" />
			</div>
		</div>
	);
}
