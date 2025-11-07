import {
	Banknote,
	Briefcase,
	ChevronDown,
	ChevronUp,
	Shield,
	User,
} from "lucide-react";
import type { useAppForm } from "@/hooks/form";
import {
	EMPLOYMENT_TYPE_OPTIONS,
	PAY_FREQUENCY_OPTIONS,
} from "@/utils/employee";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormType = ReturnType<typeof useAppForm<any>>;

interface PersonalInformationSectionProps {
	form: FormType;
}

export function PersonalInformationSection({
	form,
}: PersonalInformationSectionProps) {
	return (
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
							description="Formato: +54 9 11 1234 5678"
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
	);
}

interface JobPaySectionProps {
	form: FormType;
	currentRate?: string | null;
	isEdit?: boolean;
}

export function JobPaySection({
	form,
	currentRate,
	isEdit = false,
}: JobPaySectionProps) {
	return (
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
								type="number"
								step="0.01"
								description={
									isEdit
										? "Dejar vacío para mantener tarifa actual"
										: "Monto según tipo de empleo"
								}
							/>
						)}
					</form.AppField>
				</div>
				{isEdit && currentRate && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
						<p className="text-sm text-blue-900">
							<strong>Tarifa actual:</strong> $
							{Number.parseFloat(currentRate).toFixed(2)}
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
	);
}

interface CollapsibleSectionProps {
	isOpen: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}

interface BankDetailsSectionProps {
	form: FormType;
	isOpen: boolean;
	onToggle: () => void;
}

export function BankDetailsSection({
	form,
	isOpen,
	onToggle,
}: BankDetailsSectionProps) {
	return (
		<section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
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
				{isOpen ? (
					<ChevronUp className="w-5 h-5 text-gray-400" />
				) : (
					<ChevronDown className="w-5 h-5 text-gray-400" />
				)}
			</button>
			{isOpen && (
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
	);
}

interface InsuranceSectionProps {
	form: FormType;
	isOpen: boolean;
	onToggle: () => void;
}

export function InsuranceSection({
	form,
	isOpen,
	onToggle,
}: InsuranceSectionProps) {
	return (
		<section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
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
				{isOpen ? (
					<ChevronUp className="w-5 h-5 text-gray-400" />
				) : (
					<ChevronDown className="w-5 h-5 text-gray-400" />
				)}
			</button>
			{isOpen && (
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
	);
}
