import { Link } from "@tanstack/react-router";
import {
	Banknote,
	Briefcase,
	ChevronDown,
	ChevronUp,
	DollarSign,
	Phone,
	Shield,
	User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import { useCreateEmployee, useUpdateEmployee } from "@/queries/employees";
import { employeeFormSchema } from "@/schemas/employee";
import {
	EMPLOYMENT_TYPE_OPTIONS,
	PAY_FREQUENCY_OPTIONS,
} from "@/utils/employee";
import { currencyFormatter, phoneFormatterAR } from "@/utils/formatters";

interface EmployeeFormProps {
	mode: "create" | "edit";
	initialData?: {
		id?: string;
		firstName: string;
		lastName: string;
		phone: string | null;
		email?: string | null;
		address?: string | null;
		nationalId?: string | null;
		jobCategory?: string | null;
		employmentType: "HOURLY" | "DAILY" | "SUB_CONTRACTOR";
		payFrequency: "WEEKLY" | "BI_WEEKLY" | "MONTHLY";
		hireDate?: string | null;
		currentRate?: string | null;
		insuranceDetails?: string | null;
		bankDetails?: {
			bankName?: string | null;
			accountAlias?: string | null;
			cbuCvu?: string | null;
		} | null;
	};
}

export function EmployeeForm({ mode, initialData }: EmployeeFormProps) {
	const createEmployee = useCreateEmployee();
	const updateEmployee = useUpdateEmployee();
	const [showBankDetails, setShowBankDetails] = useState(false);
	const [showInsurance, setShowInsurance] = useState(false);

	const form = useAppForm({
		defaultValues: {
			firstName: initialData?.firstName || "",
			lastName: initialData?.lastName || "",
			phone: initialData?.phone || "",
			email: initialData?.email || "",
			address: initialData?.address || "",
			nationalId: initialData?.nationalId || "",
			jobCategory: initialData?.jobCategory || "",
			employmentType: (initialData?.employmentType || "HOURLY") as
				| "HOURLY"
				| "DAILY"
				| "SUB_CONTRACTOR",
			payFrequency: (initialData?.payFrequency || "WEEKLY") as
				| "WEEKLY"
				| "BI_WEEKLY"
				| "MONTHLY",
			hireDate: initialData?.hireDate || "",
			rate: initialData?.currentRate || "",
			insuranceDetails: initialData?.insuranceDetails || "",
			bankName: initialData?.bankDetails?.bankName || "",
			accountAlias: initialData?.bankDetails?.accountAlias || "",
			cbuCvu: initialData?.bankDetails?.cbuCvu || "",
		},
		onSubmit: async (data) => {
			if (mode === "create") {
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
			} else {
				updateEmployee.mutate({
					data: {
						id: initialData?.id || "",
						...data.value,
						email: data.value.email || null,
						address: data.value.address || null,
						nationalId: data.value.nationalId || null,
						jobCategory: data.value.jobCategory || null,
						hireDate: data.value.hireDate || null,
						insuranceDetails: data.value.insuranceDetails || null,
					},
				});
			}
		},
		validators: {
			onChange: employeeFormSchema,
		},
	});

	const isEdit = mode === "edit";

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			{/* Personal Information Section */}
			<section className="bg-white rounded-xl border border-gray-200 shadow-sm">
				<div className="p-4 sm:p-6 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
							<User className="w-5 h-5 text-blue-600" />
						</div>
						<div>
							<h2 className="text-base sm:text-lg font-semibold text-gray-900">
								Información Personal
							</h2>
							<p className="text-xs sm:text-sm text-gray-500">
								Datos básicos del empleado
							</p>
						</div>
					</div>
				</div>
				<div className="p-4 sm:p-6 space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<form.AppField name="firstName">
							{(field) => <field.TextField label="Nombre *" />}
						</form.AppField>
						<form.AppField name="lastName">
							{(field) => <field.TextField label="Apellido *" />}
						</form.AppField>
					</div>
					<form.AppField name="phone">
						{(field) => (
							<field.TextField
								label="Teléfono *"
								type="tel"
								leadingIcon={<Phone className="w-4 h-4" />}
								formatter={phoneFormatterAR}
								description="Se formateará automáticamente"
							/>
						)}
					</form.AppField>
					<form.AppField name="email">
						{(field) => (
							<field.TextField
								label="Email"
								type="email"
								description="Opcional"
							/>
						)}
					</form.AppField>
					<form.AppField name="address">
						{(field) => (
							<field.TextField label="Dirección" description="Opcional" />
						)}
					</form.AppField>
					<form.AppField name="nationalId">
						{(field) => <field.TextField label="DNI" description="Opcional" />}
					</form.AppField>
				</div>
			</section>

			{/* Job & Pay Section */}
			<section className="bg-white rounded-xl border border-gray-200 shadow-sm">
				<div className="p-4 sm:p-6 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
							<Briefcase className="w-5 h-5 text-green-600" />
						</div>
						<div>
							<h2 className="text-base sm:text-lg font-semibold text-gray-900">
								Trabajo y Pago
							</h2>
							<p className="text-xs sm:text-sm text-gray-500">
								Detalles de empleo y compensación
							</p>
						</div>
					</div>
				</div>
				<div className="p-4 sm:p-6 space-y-4">
					<form.AppField name="jobCategory">
						{(field) => (
							<field.TextField
								label="Categoría de Trabajo"
								description="Ej: Albañil, Electricista, Plomero"
							/>
						)}
					</form.AppField>
					<form.AppField name="hireDate">
						{(field) => (
							<field.TextField
								label="Fecha de Contratación"
								type="date"
								description="Opcional"
							/>
						)}
					</form.AppField>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<form.AppField name="employmentType">
							{(field) => (
								<field.SelectField
									label="Tipo de Empleo *"
									values={EMPLOYMENT_TYPE_OPTIONS}
								/>
							)}
						</form.AppField>
						<form.AppField name="rate">
							{(field) => (
								<field.TextField
									label={isEdit ? "Tarifa" : "Tarifa *"}
									type="text"
									leadingIcon={<DollarSign className="w-4 h-4" />}
									formatter={currencyFormatter}
									description={
										isEdit
											? "Dejar vacío para mantener tarifa actual"
											: "Monto según tipo de empleo"
									}
								/>
							)}
						</form.AppField>
					</div>
					{isEdit && initialData?.currentRate && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p className="text-sm text-blue-900 flex items-center gap-1">
								<strong>Tarifa actual:</strong>
								<span className="flex items-center gap-1">
									<DollarSign className="w-4 h-4" />
									{Number.parseFloat(initialData.currentRate).toLocaleString(
										"en-US",
										{
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										},
									)}
								</span>
							</p>
						</div>
					)}
					<form.AppField name="payFrequency">
						{(field) => (
							<field.SelectField
								label="Frecuencia de Pago *"
								values={PAY_FREQUENCY_OPTIONS}
							/>
						)}
					</form.AppField>
				</div>
			</section>

			{/* Bank Details Section (Collapsible) */}
			<section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				<button
					type="button"
					onClick={() => setShowBankDetails(!showBankDetails)}
					className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
							<Banknote className="w-5 h-5 text-purple-600" />
						</div>
						<div className="text-left">
							<h2 className="text-base sm:text-lg font-semibold text-gray-900">
								Datos Bancarios
							</h2>
							<p className="text-xs sm:text-sm text-gray-500">Opcional</p>
						</div>
					</div>
					{showBankDetails ? (
						<ChevronUp className="w-5 h-5 text-gray-400" />
					) : (
						<ChevronDown className="w-5 h-5 text-gray-400" />
					)}
				</button>
				{showBankDetails && (
					<div className="p-4 sm:p-6 border-t border-gray-100 space-y-4">
						<form.AppField name="bankName">
							{(field) => <field.TextField label="Banco" />}
						</form.AppField>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<form.AppField name="accountAlias">
								{(field) => <field.TextField label="Alias" />}
							</form.AppField>
							<form.AppField name="cbuCvu">
								{(field) => (
									<field.TextField label="CBU/CVU" description="22 dígitos" />
								)}
							</form.AppField>
						</div>
					</div>
				)}
			</section>

			{/* Insurance Section (Collapsible) */}
			<section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				<button
					type="button"
					onClick={() => setShowInsurance(!showInsurance)}
					className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
							<Shield className="w-5 h-5 text-orange-600" />
						</div>
						<div className="text-left">
							<h2 className="text-base sm:text-lg font-semibold text-gray-900">
								Seguro
							</h2>
							<p className="text-xs sm:text-sm text-gray-500">Opcional</p>
						</div>
					</div>
					{showInsurance ? (
						<ChevronUp className="w-5 h-5 text-gray-400" />
					) : (
						<ChevronDown className="w-5 h-5 text-gray-400" />
					)}
				</button>
				{showInsurance && (
					<div className="p-4 sm:p-6 border-t border-gray-100">
						<form.AppField name="insuranceDetails">
							{(field) => (
								<field.TextAreaField
									label="Detalles del Seguro"
									description="Incluye compañía, número de póliza, etc."
								/>
							)}
						</form.AppField>
					</div>
				)}
			</section>

			{/* Form Actions */}
			{/* Desktop Actions */}
			<div className="hidden sm:flex gap-3 pt-2">
				<form.AppForm>
					<form.SubscribeButton
						label={mode === "create" ? "Crear Empleado" : "Guardar Cambios"}
					/>
				</form.AppForm>
				<Link to="/employees">
					<Button color="ghost">Cancelar</Button>
				</Link>
			</div>

			{/* Mobile Sticky Footer */}
			<div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2 shadow-lg">
				<form.AppForm>
					<form.SubscribeButton
						label={mode === "create" ? "Crear Empleado" : "Guardar Cambios"}
					/>
				</form.AppForm>
				<Link to="/employees" className="block">
					<Button color="ghost" className="w-full">
						Cancelar
					</Button>
				</Link>
			</div>
		</form>
	);
}
