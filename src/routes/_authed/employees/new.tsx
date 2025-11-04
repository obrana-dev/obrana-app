import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import { useCreateEmployee } from "@/queries/employees";

export const Route = createFileRoute("/_authed/employees/new")({
	component: NewEmployee,
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
	rate: z.string().min(1, "La tarifa es requerida"),
	insuranceDetails: z.string(),
	bankName: z.string(),
	accountAlias: z.string(),
	cbuCvu: z.string(),
});

function NewEmployee() {
	const createEmployee = useCreateEmployee();

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
		<div className="p-6 max-w-4xl">
			<div className="mb-6">
				<Link
					to="/employees"
					className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
				>
					<ArrowLeft className="w-4 h-4" />
					Volver a empleados
				</Link>
				<h1 className="text-2xl font-semibold text-gray-900">Nuevo Empleado</h1>
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
									label="Tarifa *"
									type="number"
									step="0.01"
									description="Monto según el tipo de empleo"
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
						<form.SubscribeButton label="Crear Empleado" />
					</form.AppForm>
					<Link to="/employees">
						<Button color="ghost">Cancelar</Button>
					</Link>
				</div>
			</form>
		</div>
	);
}
