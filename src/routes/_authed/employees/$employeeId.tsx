import { createFileRoute, Link } from "@tanstack/react-router";
import { LoadingState } from "@/components/common/loading-state";
import { EmployeeFormHeader } from "@/components/employees/employee-form-header";
import { EmployeeForm } from "@/components/forms/employee-form";
import { Button } from "@/components/ui/button";
import { employeeQueryOptions, useEmployee } from "@/queries/employees";

export const Route = createFileRoute("/_authed/employees/$employeeId")({
	component: EditEmployee,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			employeeQueryOptions(params.employeeId),
		);
	},
});

function EditEmployee() {
	const { employeeId } = Route.useParams();
	const { data: employee, isLoading } = useEmployee(employeeId);

	if (isLoading) {
		return <LoadingState message="Cargando empleado..." />;
	}

	if (!employee) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-900 mb-4">Empleado no encontrado</p>
					<Link to="/employees">
						<Button>Volver a empleados</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
			<EmployeeFormHeader
				title="Editar Empleado"
				subtitle={`${employee.firstName} ${employee.lastName}`}
			/>

			<div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
				<EmployeeForm
					mode="edit"
					initialData={{
						id: employeeId,
						firstName: employee.firstName,
						lastName: employee.lastName,
						phone: employee.phone,
						email: employee.email,
						address: employee.address,
						nationalId: employee.nationalId,
						jobCategory: employee.jobCategory,
						employmentType: employee.employmentType,
						payFrequency: employee.payFrequency,
						hireDate: employee.hireDate,
						currentRate: employee.currentRate,
						insuranceDetails: employee.insuranceDetails,
						bankDetails: employee.bankDetails,
					}}
				/>
			</div>
		</div>
	);
}
