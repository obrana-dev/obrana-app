import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import { useEmployee, useUpdateEmployee } from "@/queries/employees";

export const Route = createFileRoute("/_authed/employees/$employeeId")({
	component: EditEmployee,
});

const employeeFormSchema = z.object({
	firstName: z.string().min(1, "El nombre es requerido"),
	lastName: z.string().min(1, "El apellido es requerido"),
	phone: z.string().min(1, "El teléfono es requerido"),
	email: z.union([
		z.string().email({ message: "Email inválido" }),
		z.literal(""),
	]),
	address: z.string(),
	nationalId: z.string(),
	jobCategory: z.string(),
	employmentType: z.enum(["HOURLY", "DAILY", "SUB_CONTRACTOR"]),
	payFrequency: z.enum(["WEEKLY", "BI_WEEKLY", "MONTHLY"]),
	hireDate: z.string(),
	rate: z.string(),
	insuranceDetails: z.string(),
	bankName: z.string(),
	accountAlias: z.string(),
	cbuCvu: z.string(),
});

function EditEmployee() {
	const { employeeId } = Route.useParams();
	const { data: employee, isLoading } = useEmployee(employeeId);
	const updateEmployee = useUpdateEmployee();

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
		return (
			<div className="p-6">
				<p>Cargando empleado...</p>
			</div>
		);
	}

	if (!employee) {
		return (
			<div className="p-6">
				<p>Empleado no encontrado</p>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-4xl">
			<div className="mb-6">
				<Link
					to="/employees"
					className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
				>
					<ArrowLeft className="w-4 h-4" />
					Volver a empleados
				</Link>
				<h1 className="text-2xl font-semibold text-gray-900">
					Editar Empleado: {employee.firstName} {employee.lastName}
				</h1>
			</div>

			<form
				className="space-y-6"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{/* Personal Information */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Información Personal
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<form.AppField name="firstName">
							{(field) => <field.TextField label="Nombre *" />}
						</form.AppField>
						<form.AppField name="lastName">
							{(field) => <field.TextField label="Apellido *" />}
						</form.AppField>
						<form.AppField name="phone">
							{(field) => <field.TextField label="Teléfono *" type="tel" />}
						</form.AppField>
						<form.AppField name="email">
							{(field) => <field.TextField label="Email" type="email" />}
						</form.AppField>
						<form.AppField name="address">
							{(field) => <field.TextField label="Dirección" />}
						</form.AppField>
						<form.AppField name="nationalId">
							{(field) => <field.TextField label="DNI" />}
						</form.AppField>
					</div>
				</section>

				{/* Job & Pay */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Trabajo y Pago
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<form.AppField name="jobCategory">
							{(field) => (
								<field.TextField
									label="Categoría de Trabajo"
									description="Ej: Albañil, Electricista"
								/>
							)}
						</form.AppField>
						<form.AppField name="hireDate">
							{(field) => (
								<field.TextField label="Fecha de Contratación" type="date" />
							)}
						</form.AppField>
						<form.AppField name="employmentType">
							{(field) => (
								<field.SelectField
									label="Tipo de Empleo *"
									values={[
										{ label: "Por Hora", value: "HOURLY" },
										{ label: "Por Día (Jornal)", value: "DAILY" },
										{ label: "Subcontratista", value: "SUB_CONTRACTOR" },
									]}
								/>
							)}
						</form.AppField>
						<form.AppField name="rate">
							{(field) => (
								<field.TextField
									label="Tarifa"
									type="number"
									step="0.01"
									description="Dejar vacío para mantener la tarifa actual"
								/>
							)}
						</form.AppField>
						<form.AppField name="payFrequency">
							{(field) => (
								<field.SelectField
									label="Frecuencia de Pago *"
									values={[
										{ label: "Semanal", value: "WEEKLY" },
										{ label: "Quincenal", value: "BI_WEEKLY" },
										{ label: "Mensual", value: "MONTHLY" },
									]}
								/>
							)}
						</form.AppField>
						{employee.currentRate && (
							<div className="flex items-end">
								<div className="text-sm text-gray-600">
									<strong>Tarifa actual:</strong> ${employee.currentRate}
								</div>
							</div>
						)}
					</div>
				</section>

				{/* Bank Details */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Datos Bancarios (Opcional)
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<form.AppField name="bankName">
							{(field) => <field.TextField label="Banco" />}
						</form.AppField>
						<form.AppField name="accountAlias">
							{(field) => <field.TextField label="Alias" />}
						</form.AppField>
						<form.AppField name="cbuCvu">
							{(field) => <field.TextField label="CBU/CVU" />}
						</form.AppField>
					</div>
				</section>

				{/* Insurance */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Seguro (Opcional)
					</h2>
					<form.AppField name="insuranceDetails">
						{(field) => <field.TextAreaField label="Detalles del Seguro" />}
					</form.AppField>
				</section>

				{/* Submit */}
				<div className="flex gap-4">
					<form.AppForm>
						<form.SubscribeButton label="Guardar Cambios" />
					</form.AppForm>
					<Link to="/employees">
						<Button color="ghost">Cancelar</Button>
					</Link>
				</div>
			</form>
		</div>
	);
}
