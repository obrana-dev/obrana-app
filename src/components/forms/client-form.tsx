import { useNavigate } from "@tanstack/react-router";
import { Building2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import { useCreateClient, useUpdateClient } from "@/queries/clients";
import { clientFormSchema } from "@/schemas/client";
import { phoneFormatterAR } from "@/utils/formatters";

interface ClientFormProps {
	mode: "create" | "edit";
	initialData?: {
		id?: string;
		name: string;
		email?: string | null;
		phone?: string | null;
		address?: string | null;
	};
	onSuccessCallback?: (clientId: string) => void;
	redirectOnSuccess?: boolean;
	onClose?: () => void;
}

export function ClientForm({
	mode,
	initialData,
	onSuccessCallback,
	redirectOnSuccess = true,
	onClose,
}: ClientFormProps) {
	const createClient = useCreateClient({
		redirectOnSuccess,
		onSuccessCallback: (data: { id: string }) => {
			if (onSuccessCallback) {
				onSuccessCallback(data.id);
			}
		},
	});
	const updateClient = useUpdateClient();

	const navigate = useNavigate();

	const form = useAppForm({
		defaultValues: {
			name: initialData?.name || "",
			email: initialData?.email || "",
			phone: initialData?.phone || "",
			address: initialData?.address || "",
		},
		onSubmit: async (data) => {
			if (mode === "create") {
				createClient.mutate({
					data: {
						...data.value,
						email: data.value.email || null,
						phone: data.value.phone || null,
						address: data.value.address || null,
					},
				});
			} else {
				updateClient.mutate({
					data: {
						id: initialData?.id || "",
						...data.value,
						email: data.value.email || null,
						phone: data.value.phone || null,
						address: data.value.address || null,
					},
				});
			}
		},
		validators: {
			onChange: clientFormSchema,
		},
	});

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<section className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-3xl">
				<div className="p-4 sm:p-6 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
							<Building2 className="w-5 h-5 text-blue-600" />
						</div>
						<div>
							<h2 className="text-base sm:text-lg font-semibold text-gray-900">
								Información del Cliente
							</h2>
							<p className="text-xs sm:text-sm text-gray-500">
								Datos de contacto y ubicación
							</p>
						</div>
					</div>
				</div>
				<div className="p-4 sm:p-6 space-y-4">
					<form.AppField name="name">
						{(field) => <field.TextField label="Nombre *" />}
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

					<form.AppField name="phone">
						{(field) => (
							<field.TextField
								label="Teléfono"
								type="tel"
								leadingIcon={<Phone className="w-4 h-4" />}
								formatter={phoneFormatterAR}
								description="Opcional"
							/>
						)}
					</form.AppField>

					<form.AppField name="address">
						{(field) => (
							<field.TextAreaField
								label="Dirección"
								description="Opcional"
								rows={3}
							/>
						)}
					</form.AppField>
				</div>
			</section>

			{/* Form Actions */}
			<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:static sm:bg-transparent sm:border-0 sm:mt-6">
				<div className="px-4 py-3 sm:px-0 sm:py-0 max-w-3xl">
					<div className="flex items-center gap-3 justify-end">
						<Button
							color="ghost"
							variant="text"
							onPress={() => {
								if (onClose) {
									onClose();
									return;
								}
								navigate({ to: "/clients" });
							}}
						>
							Cancelar
						</Button>

						<form.AppForm>
							<form.SubscribeButton
								label={
									mode === "create" ? "Crear Cliente" : "Actualizar Cliente"
								}
							/>
						</form.AppForm>
					</div>
				</div>
			</div>
		</form>
	);
}
