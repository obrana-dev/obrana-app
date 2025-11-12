import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Building2,
	Calendar,
	CheckCircle,
	Clock,
	FileText,
	XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuotation, useUpdateQuotationStatus } from "@/queries/quotations";
import {
	formatCurrency,
	formatDate,
	getQuotationStatusInfo,
} from "@/utils/quotation";

export const Route = createFileRoute("/_authed/quotations/$quotationId")({
	component: QuotationDetail,
});

function QuotationDetail() {
	const { quotationId } = Route.useParams();
	const { data: quotation, isLoading, error } = useQuotation(quotationId);
	const updateStatus = useUpdateQuotationStatus();

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Error al cargar el presupuesto
					</h2>
					<p className="text-gray-600">{error.message}</p>
				</div>
			</div>
		);
	}

	if (isLoading || !quotation) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-gray-600">Cargando...</div>
			</div>
		);
	}

	const statusInfo = getQuotationStatusInfo(quotation.status);

	const handleStatusChange = (
		newStatus: "DRAFT" | "REVIEW" | "APPROVED" | "REJECTED" | "CANCELED",
	) => {
		const confirmMessages = {
			REVIEW: "¿Enviar este presupuesto a revisión?",
			APPROVED: "¿Aprobar este presupuesto?",
			REJECTED: "¿Rechazar este presupuesto?",
			CANCELED: "¿Cancelar este presupuesto?",
			DRAFT: "¿Volver este presupuesto a borrador?",
		};

		if (window.confirm(confirmMessages[newStatus])) {
			updateStatus.mutate({
				data: {
					id: quotationId,
					status: newStatus,
				},
			});
		}
	};

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="px-4 py-4 sm:px-6 lg:px-8">
					<Link
						to="/quotations"
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Volver a Presupuestos
					</Link>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
								{quotation.quotationNumber}
							</h1>
							<p className="text-sm text-gray-600 mt-1">
								Presupuesto para {quotation.client?.name}
							</p>
						</div>
						<span
							className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}
						>
							{statusInfo.label}
						</span>
					</div>
				</div>
			</div>

			<div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl">
				{/* Status Actions */}
				{quotation.status !== "APPROVED" && quotation.status !== "CANCELED" && (
					<section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
						<div className="p-4 sm:p-6">
							<h3 className="text-sm font-medium text-gray-900 mb-3">
								Acciones
							</h3>
							<div className="flex flex-wrap gap-2">
								{quotation.status === "DRAFT" && (
									<Button
										color="primary"
										size="sm"
										onPress={() => handleStatusChange("REVIEW")}
										isDisabled={updateStatus.isPending}
									>
										<Clock className="w-4 h-4 mr-2" />
										Enviar a Revisión
									</Button>
								)}
								{quotation.status === "REVIEW" && (
									<>
										<Button
											color="success"
											size="sm"
											onPress={() => handleStatusChange("APPROVED")}
											isDisabled={updateStatus.isPending}
										>
											<CheckCircle className="w-4 h-4 mr-2" />
											Aprobar
										</Button>
										<Button
											color="error"
											size="sm"
											onPress={() => handleStatusChange("REJECTED")}
											isDisabled={updateStatus.isPending}
										>
											<XCircle className="w-4 h-4 mr-2" />
											Rechazar
										</Button>
									</>
								)}
								{(quotation.status === "DRAFT" ||
									quotation.status === "REVIEW") && (
									<Button
										color="warning"
										size="sm"
										onPress={() => handleStatusChange("CANCELED")}
										isDisabled={updateStatus.isPending}
									>
										Cancelar Presupuesto
									</Button>
								)}
							</div>
						</div>
					</section>
				)}

				{/* Main Info */}
				<section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
					<div className="p-4 sm:p-6 border-b border-gray-100">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
								<FileText className="w-5 h-5 text-blue-600" />
							</div>
							<h2 className="text-lg font-semibold text-gray-900">
								Información General
							</h2>
						</div>
					</div>
					<div className="p-4 sm:p-6 space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500">Cliente</p>
								<div className="flex items-center gap-2 mt-1">
									<Building2 className="w-4 h-4 text-gray-400" />
									<p className="font-medium">{quotation.client?.name}</p>
								</div>
							</div>
							<div>
								<p className="text-sm text-gray-500">Fecha de Emisión</p>
								<div className="flex items-center gap-2 mt-1">
									<Calendar className="w-4 h-4 text-gray-400" />
									<p className="font-medium">
										{formatDate(quotation.issueDate)}
									</p>
								</div>
							</div>
							{quotation.validityDays && (
								<div>
									<p className="text-sm text-gray-500">Válido por</p>
									<p className="font-medium mt-1">
										{quotation.validityDays} días
									</p>
								</div>
							)}
						</div>

						{quotation.termsAndConditions && (
							<div>
								<p className="text-sm text-gray-500 mb-1">
									Términos y Condiciones
								</p>
								<p className="text-sm text-gray-700 whitespace-pre-wrap">
									{quotation.termsAndConditions}
								</p>
							</div>
						)}

						{quotation.internalNotes && (
							<div>
								<p className="text-sm text-gray-500 mb-1">Notas Internas</p>
								<p className="text-sm text-gray-700 whitespace-pre-wrap">
									{quotation.internalNotes}
								</p>
							</div>
						)}
					</div>
				</section>

				{/* Items */}
				<section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
					<div className="p-4 sm:p-6 border-b border-gray-100">
						<h2 className="text-lg font-semibold text-gray-900">Ítems</h2>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Descripción
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
										Cantidad
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
										Precio Unit.
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
										Total
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{quotation.items.map((item) => (
									<tr key={item.id}>
										<td className="px-4 py-3 text-sm text-gray-900">
											{item.description}
										</td>
										<td className="px-4 py-3 text-sm text-gray-900 text-right">
											{item.quantity}
										</td>
										<td className="px-4 py-3 text-sm text-gray-900 text-right">
											{formatCurrency(item.unitPrice)}
										</td>
										<td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
											{formatCurrency(item.lineTotal)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="p-4 sm:p-6 border-t border-gray-200">
						<div className="space-y-2 max-w-sm ml-auto">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Subtotal:</span>
								<span className="font-medium">
									{formatCurrency(quotation.subtotal)}
								</span>
							</div>
							<div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
								<span>Total:</span>
								<span className="text-blue-600">
									{formatCurrency(quotation.total)}
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* History */}
				<section className="bg-white rounded-xl border border-gray-200 shadow-sm">
					<div className="p-4 sm:p-6 border-b border-gray-100">
						<h2 className="text-lg font-semibold text-gray-900">Historial</h2>
					</div>
					<div className="p-4 sm:p-6">
						<div className="space-y-4">
							{quotation.history.map((entry, index) => (
								<div key={entry.id} className="flex gap-3">
									<div className="flex flex-col items-center">
										<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
											<Clock className="w-4 h-4 text-blue-600" />
										</div>
										{index < quotation.history.length - 1 && (
											<div className="w-0.5 h-full bg-gray-200 mt-2" />
										)}
									</div>
									<div className="flex-1 pb-4">
										<p className="text-sm font-medium text-gray-900">
											{entry.action}
										</p>
										<p className="text-xs text-gray-500 mt-1">
											{new Date(entry.createdAt).toLocaleString("es-AR")}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
