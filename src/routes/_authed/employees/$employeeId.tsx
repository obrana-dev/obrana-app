import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/loading-state";
import { EmployeeFormActions } from "@/components/employees/employee-form-actions";
import { EmployeeFormHeader } from "@/components/employees/employee-form-header";
import {
	BankDetailsSection,
	InsuranceSection,
	JobPaySection,
	PersonalInformationSection,
} from "@/components/employees/employee-form-sections";
import { useAppForm } from "@/hooks/form";
import {
	employeeQueryOptions,
	useEmployee,
	useUpdateEmployee,
} from "@/queries/employees";
import { employeeFormSchema } from "@/schemas/employee";

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
	const updateEmployee = useUpdateEmployee();
	const [showBankDetails, setShowBankDetails] = useState(false);
	const [showInsurance, setShowInsurance] = useState(false);

	const form = useAppForm({
		defaultValues: {
			firstName: employee?.firstName || "",
			lastName: employee?.lastName || "",
			phone: employee?.phone || "",
			email: employee?.email || "",
			address: employee?.address || "",
			nationalId: employee?.nationalId || "",
			jobCategory: employee?.jobCategory || "",
			employmentType: (employee?.employmentType || "HOURLY") as
				| "HOURLY"
				| "DAILY"
				| "SUB_CONTRACTOR",
			payFrequency: (employee?.payFrequency || "WEEKLY") as
				| "WEEKLY"
				| "BI_WEEKLY"
				| "MONTHLY",
			hireDate: employee?.hireDate || "",
			rate: employee?.currentRate || "",
			insuranceDetails: employee?.insuranceDetails || "",
			bankName: employee?.bankDetails?.bankName || "",
			accountAlias: employee?.bankDetails?.accountAlias || "",
			cbuCvu: employee?.bankDetails?.cbuCvu || "",
		},
		onSubmit: async (data) => {
			updateEmployee.mutate({
				data: {
					id: employeeId,
					...data.value,
					email: data.value.email || null,
					address: data.value.address || null,
					nationalId: data.value.nationalId || null,
					jobCategory: data.value.jobCategory || null,
					hireDate: data.value.hireDate || null,
					insuranceDetails: data.value.insuranceDetails || null,
				},
			});
		},
		validators: {
			onChange: employeeFormSchema,
		},
	});

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

			<form
				className="max-w-3xl mx-auto px-4 py-6 sm:px-6 space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<PersonalInformationSection form={form} />
				<JobPaySection
					form={form}
					currentRate={employee.currentRate}
					isEdit={true}
				/>
				<BankDetailsSection
					form={form}
					isOpen={showBankDetails}
					onToggle={() => setShowBankDetails(!showBankDetails)}
				/>
				<InsuranceSection
					form={form}
					isOpen={showInsurance}
					onToggle={() => setShowInsurance(!showInsurance)}
				/>
				<EmployeeFormActions
					submitButton={
						<form.AppForm>
							<form.SubscribeButton label="Guardar Cambios" />
						</form.AppForm>
					}
				/>
			</form>
		</div>
	);
}
