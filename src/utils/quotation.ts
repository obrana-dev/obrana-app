/**
 * Get status badge styling and labels
 */
export function getQuotationStatusInfo(
	status: "DRAFT" | "REVIEW" | "APPROVED" | "REJECTED" | "CANCELED",
) {
	const statusConfig = {
		DRAFT: {
			label: "Borrador",
			color: "bg-gray-100 text-gray-700 border-gray-200",
		},
		REVIEW: {
			label: "En Revisión",
			color: "bg-blue-100 text-blue-700 border-blue-200",
		},
		APPROVED: {
			label: "Aprobado",
			color: "bg-green-100 text-green-700 border-green-200",
		},
		REJECTED: {
			label: "Rechazado",
			color: "bg-red-100 text-red-700 border-red-200",
		},
		CANCELED: {
			label: "Cancelado",
			color: "bg-orange-100 text-orange-700 border-orange-200",
		},
	};

	return statusConfig[status];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: string | number): string {
	const num = typeof amount === "string" ? parseFloat(amount) : amount;
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "ARS",
	}).format(num);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("es-AR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
}
