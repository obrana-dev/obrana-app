import { Link } from "@tanstack/react-router";
import { Calculator, DollarSign, FileText, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateClientModal } from "@/components/quotations/create-client-modal";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import { useClients } from "@/queries/clients";
import {
	useCreateQuotation,
	useNextQuotationNumber,
	useUpdateQuotation,
} from "@/queries/quotations";
import { quotationFormSchema } from "@/schemas/quotation";
import { currencyFormatter } from "@/utils/formatters";

interface QuotationFormProps {
	mode: "create" | "edit";
	initialData?: {
		id?: string;
		clientId: string;
		quotationNumber: string;
		issueDate: string;
		validityDays?: string | null;
		termsAndConditions?: string | null;
		internalNotes?: string | null;
		subtotal: string;
		total: string;
		items: Array<{
			id?: string;
			description: string;
			quantity: string;
			unitPrice: string;
			lineTotal: string;
		}>;
	};
}

export function QuotationForm({ mode, initialData }: QuotationFormProps) {
	const { data: clients, isLoading: loadingClients } = useClients();
	const [isClientModalOpen, setIsClientModalOpen] = useState(false);
	const createQuotation = useCreateQuotation();
	const updateQuotation = useUpdateQuotation();

	// Get next quotation number (only for create mode)
	const { data: nextQuotationNumber } = useNextQuotationNumber();

	// Get today's date in YYYY-MM-DD format
	const today = new Date().toISOString().split("T")[0];

	// Ensure all items have IDs (add them if missing from initialData)
	const processedInitialData = initialData
		? {
				...initialData,
				items: initialData.items.map((item) => ({
					...item,
					id: item.id || crypto.randomUUID(),
				})),
			}
		: undefined;

	const form = useAppForm({
		defaultValues: processedInitialData || {
			clientId: "",
			quotationNumber: nextQuotationNumber || "",
			issueDate: today,
			validityDays: "",
			termsAndConditions: "",
			internalNotes: "",
			subtotal: "0",
			total: "0",
			items: [
				{
					id: crypto.randomUUID(),
					description: "",
					quantity: "1",
					unitPrice: "0",
					lineTotal: "0",
				},
			],
		},
		onSubmit: async (data) => {
			if (mode === "create") {
				createQuotation.mutate({
					data: {
						...data.value,
						validityDays: data.value.validityDays || null,
						termsAndConditions: data.value.termsAndConditions || null,
						internalNotes: data.value.internalNotes || null,
					},
				});
			} else {
				updateQuotation.mutate({
					data: {
						id: initialData?.id || "",
						...data.value,
						validityDays: data.value.validityDays || null,
						termsAndConditions: data.value.termsAndConditions || null,
						internalNotes: data.value.internalNotes || null,
					},
				});
			}
		},
		validators: {
			onChange: quotationFormSchema,
		},
	});

	// Prepare client options for select
	const clientOptions = clients
		? clients.map((client) => ({
				label: client.name,
				value: client.id,
			}))
		: [];

	// Set quotation number when it's loaded (create mode only)
	useEffect(() => {
		if (mode === "create" && nextQuotationNumber) {
			form.setFieldValue("quotationNumber", nextQuotationNumber);
		}
	}, [mode, nextQuotationNumber, form.setFieldValue]);

	// Calculate line totals and update form
	const items = form.state.values.items || [];

	useEffect(() => {
		// Recalculate subtotal and total whenever items change
		const subtotal = items.reduce((sum: number, item: unknown) => {
			const typedItem = item as {
				lineTotal?: string;
			};
			const lineTotal = parseFloat(typedItem.lineTotal || "0");
			return sum + lineTotal;
		}, 0);

		const total = subtotal;

		form.setFieldValue("subtotal", subtotal.toFixed(2));
		form.setFieldValue("total", total.toFixed(2));
	}, [items, form.setFieldValue]);

	const addItem = () => {
		const currentItems = form.state.values.items || [];
		form.setFieldValue("items", [
			...currentItems,
			{
				id: crypto.randomUUID(),
				description: "",
				quantity: "1",
				unitPrice: "0",
				lineTotal: "0",
			},
		]);
	};

	const removeItem = (itemId: string) => {
		const currentItems = form.state.values.items || [];
		form.setFieldValue(
			"items",
			currentItems.filter((item: { id: string }) => item.id !== itemId),
		);
	};

	const updateItemLineTotal = (itemId: string) => {
		const currentItems = [...(form.state.values.items || [])];
		const itemIndex = currentItems.findIndex(
			(item: { id: string }) => item.id === itemId,
		);
		if (itemIndex === -1) return;

		const item = currentItems[itemIndex];
		const quantity = parseFloat(item.quantity || "0");
		const unitPrice = parseFloat(item.unitPrice || "0");
		const lineTotal = (quantity * unitPrice).toFixed(2);
		currentItems[itemIndex] = { ...item, lineTotal };
		form.setFieldValue("items", currentItems);
	};

	const handleClientCreated = (clientId: string) => {
		// Automatically select the newly created client
		form.setFieldValue("clientId", clientId);
	};

	return (
		<>
			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{/* Basic Information */}
				<section className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-5xl">
					<div className="p-4 sm:p-6 border-b border-gray-100">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
								<FileText className="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<h2 className="text-base sm:text-lg font-semibold text-gray-900">
									Información del Presupuesto
								</h2>
								<p className="text-xs sm:text-sm text-gray-500">
									Datos principales del documento
								</p>
							</div>
						</div>
					</div>
					<div className="p-4 sm:p-6 space-y-4">
						<div className="grid grid-cols-1 gap-4">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									{loadingClients ? (
										<div className="flex items-center text-sm text-gray-500">
											Cargando clientes...
										</div>
									) : clientOptions.length === 0 ? (
										<div className="flex flex-col gap-2">
											<p className="text-sm font-medium text-gray-700">
												Cliente *
											</p>
											<p className="text-sm text-gray-500">
												No hay clientes disponibles
											</p>
										</div>
									) : (
										<form.AppField name="clientId">
											{(field) => (
												<field.SelectField
													label="Cliente *"
													values={clientOptions}
													placeholder="Seleccionar cliente"
												/>
											)}
										</form.AppField>
									)}
								</div>
								<Button
									type="button"
									color="ghost"
									onPress={() => setIsClientModalOpen(true)}
									className="flex items-center gap-2 mt-8"
								>
									<Plus className="w-4 h-4" />
									Nuevo cliente
								</Button>
							</div>
						</div>

						<form.AppField name="quotationNumber">
							{(field) => (
								<field.TextField
									label="Número de Presupuesto *"
									isDisabled
									description="Generado automáticamente"
								/>
							)}
						</form.AppField>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<form.AppField name="issueDate">
								{(field) => (
									<field.TextField label="Fecha de Emisión *" type="date" />
								)}
							</form.AppField>

							<form.AppField name="validityDays">
								{(field) => (
									<field.SelectField
										label="Valido por:"
										values={[
											{ label: "7 días", value: "7" },
											{ label: "14 días", value: "14" },
											{ label: "30 días", value: "30" },
											{ label: "60 días", value: "60" },
										]}
										placeholder="Seleccionar días"
									/>
								)}
							</form.AppField>
						</div>

						<form.AppField name="termsAndConditions">
							{(field) => (
								<field.TextAreaField
									label="Términos y Condiciones"
									description="Opcional"
									rows={4}
								/>
							)}
						</form.AppField>

						<form.AppField name="internalNotes">
							{(field) => (
								<field.TextAreaField
									label="Notas Internas"
									description="No se mostrarán al cliente"
									rows={4}
								/>
							)}
						</form.AppField>
					</div>
				</section>

				{/* Line Items */}
				<section className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-5xl">
					<div className="p-4 sm:p-6 border-b border-gray-100">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
									<Calculator className="w-5 h-5 text-green-600" />
								</div>
								<div>
									<h2 className="text-base sm:text-lg font-semibold text-gray-900">
										Ítems del Presupuesto
									</h2>
									<p className="text-xs sm:text-sm text-gray-500">
										Agrega los productos o servicios
									</p>
								</div>
							</div>
							<Button
								type="button"
								onPress={addItem}
								size="sm"
								className="flex items-center gap-2"
							>
								<Plus className="w-4 h-4" />
								Agregar Ítem
							</Button>
						</div>
					</div>
					<div className="p-4 sm:p-6 space-y-4">
						{items.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								<p className="mb-3">No hay ítems agregados</p>
								<Button type="button" onPress={addItem} size="sm">
									<Plus className="w-4 h-4 mr-2" />
									Agregar primer ítem
								</Button>
							</div>
						) : (
							items.map(
								(item: { id: string; description: string }, index: number) => (
									<div
										key={item.id}
										className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50"
									>
										<div className="flex items-center justify-between mb-2">
											<h4 className="text-sm font-medium text-gray-700">
												Ítem {index + 1}
											</h4>
											{items.length > 1 && (
												<Button
													type="button"
													color="ghost"
													size="sm"
													onPress={() => removeItem(item.id)}
												>
													<Trash2 className="w-4 h-4 text-red-600" />
												</Button>
											)}
										</div>

										<form.AppField name={`items[${index}].description`}>
											{(field) => <field.TextField label="Descripción *" />}
										</form.AppField>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
											<form.AppField name={`items[${index}].quantity`}>
												{(field) => (
													<field.TextField
														label="Cantidad *"
														type="number"
														step="0.01"
														onBlur={() => updateItemLineTotal(item.id)}
													/>
												)}
											</form.AppField>

											<form.AppField name={`items[${index}].unitPrice`}>
												{(field) => (
													<field.TextField
														label="Precio Unitario *"
														type="text"
														leadingIcon={<DollarSign className="w-4 h-4" />}
														formatter={currencyFormatter}
														onBlur={() => updateItemLineTotal(item.id)}
													/>
												)}
											</form.AppField>

											<form.AppField name={`items[${index}].lineTotal`}>
												{(field) => (
													<field.TextField
														label="Total"
														type="text"
														leadingIcon={<DollarSign className="w-4 h-4" />}
														formatter={currencyFormatter}
														isDisabled
													/>
												)}
											</form.AppField>
										</div>
									</div>
								),
							)
						)}
					</div>
				</section>

				{/* Totals */}
				<section className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-5xl">
					<div className="p-4 sm:p-6">
						<div className="space-y-3 max-w-sm ml-auto">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600">Subtotal:</span>
								<span className="font-medium text-gray-900 flex items-center gap-1">
									<DollarSign className="w-4 h-4 text-gray-500" />
									{Number(form.state.values.subtotal || 0).toLocaleString(
										"en-US",
										{
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										},
									)}
								</span>
							</div>

							<div className="pt-3 border-t border-gray-200">
								<div className="flex items-center justify-between">
									<span className="text-lg font-semibold text-gray-900">
										Total:
									</span>
									<span className="text-2xl font-bold text-blue-600 flex items-center gap-1">
										<DollarSign className="w-5 h-5" />
										{Number(form.state.values.total || 0).toLocaleString(
											"en-US",
											{
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											},
										)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Form Actions */}
				<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:static sm:bg-transparent sm:border-0 sm:mt-6">
					<div className="px-4 py-3 sm:px-0 sm:py-0 max-w-5xl">
						<div className="flex items-center gap-3 justify-end">
							<Link to="/quotations">
								<Button color="ghost" variant="text">
									Cancelar
								</Button>
							</Link>
							<form.AppForm>
								<form.SubscribeButton
									label={
										mode === "create"
											? "Crear Presupuesto"
											: "Actualizar Presupuesto"
									}
								/>
							</form.AppForm>
						</div>
					</div>
				</div>
			</form>

			{/* Client Creation Modal */}
			<CreateClientModal
				isOpen={isClientModalOpen}
				onClose={() => setIsClientModalOpen(false)}
				onClientCreated={handleClientCreated}
			/>
		</>
	);
}
