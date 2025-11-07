import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EmployeeFormActions } from "@/components/employees/employee-form-actions";
import { EmployeeFormHeader } from "@/components/employees/employee-form-header";
import {
	BankDetailsSection,
	InsuranceSection,
	JobPaySection,
	PersonalInformationSection,
} from "@/components/employees/employee-form-sections";
import { useAppForm } from "@/hooks/form";
import { useCreateEmployee } from "@/queries/employees";
import { employeeFormSchema } from "@/schemas/employee";

export const Route = createFileRoute("/_authed/employees/new")({
	component: NewEmployee,
});

function NewEmployee() {
	const createEmployee = useCreateEmployee();
	const [showBankDetails, setShowBankDetails] = useState(false);
	const [showInsurance, setShowInsurance] = useState(false);

	const form = useAppForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			phone: "",
			email: "",
			address: "",
			nationalId: "",
			jobCategory: "",
			employmentType: "HOURLY" as "HOURLY" | "DAILY" | "SUB_CONTRACTOR",
			payFrequency: "WEEKLY" as "WEEKLY" | "BI_WEEKLY" | "MONTHLY",
			hireDate: "",
			rate: "",
			insuranceDetails: "",
			bankName: "",
			accountAlias: "",
			cbuCvu: "",
		},
		onSubmit: async (data) => {
			createEmployee.mutate({
				data: {
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

	return (
		<div className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
			<EmployeeFormHeader
				title="Nuevo Empleado"
				subtitle="Completa la información del empleado"
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
				<JobPaySection form={form} />
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
							<form.SubscribeButton label="Crear Empleado" />
						</form.AppForm>
					}
				/>
			</form>
		</div>
	);
}
