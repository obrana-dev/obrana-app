import { createFileRoute } from "@tanstack/react-router";
import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { QuotationCard } from "@/components/quotations/quotation-card";
import { QuotationListHeader } from "@/components/quotations/quotation-list-header";
import { TextField } from "@/components/ui/text-field";
import { useQuotations } from "@/queries/quotations";

export const Route = createFileRoute("/_authed/quotations/")({
	component: QuotationsPage,
});

const STATUS_FILTERS = [
	{ value: undefined, label: "Todos" },
	{ value: "DRAFT", label: "Borrador" },
	{ value: "REVIEW", label: "En Revisión" },
	{ value: "APPROVED", label: "Aprobado" },
	{ value: "REJECTED", label: "Rechazado" },
	{ value: "CANCELED", label: "Cancelado" },
] as const;

function QuotationsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"DRAFT" | "REVIEW" | "APPROVED" | "REJECTED" | "CANCELED" | undefined
	>(undefined);

	const {
		data: quotations,
		isLoading,
		error,
	} = useQuotations({
		searchTerm,
		status: statusFilter,
	});

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Error al cargar presupuestos
					</h2>
					<p className="text-gray-600">{error.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<QuotationListHeader totalQuotations={quotations?.length ?? 0} />

			<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
				{/* Filters */}
				<div className="mb-6 space-y-4">
					{/* Search Bar */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<TextField
							value={searchTerm}
							onChange={(value) => setSearchTerm(value)}
							label="Buscar presupuestos"
							className="w-full"
						>
							<input
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Buscar por número o notas..."
							/>
						</TextField>
					</div>

					{/* Status Filter */}
					<div className="flex items-center gap-2 overflow-x-auto pb-2">
						<Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
						{STATUS_FILTERS.map((filter) => (
							<button
								key={filter.label}
								type="button"
								onClick={() => setStatusFilter(filter.value)}
								className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
									statusFilter === filter.value
										? "bg-blue-600 text-white"
										: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
								}`}
							>
								{filter.label}
							</button>
						))}
					</div>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="flex items-center justify-center py-12">
						<div className="text-gray-600">Cargando presupuestos...</div>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && quotations && quotations.length === 0 && (
					<div className="text-center py-12">
						<div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
							<Search className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{searchTerm || statusFilter
								? "No se encontraron presupuestos"
								: "No hay presupuestos aún"}
						</h3>
						<p className="text-gray-600">
							{searchTerm || statusFilter
								? "Intenta con otros filtros de búsqueda"
								: "Comienza creando tu primer presupuesto"}
						</p>
					</div>
				)}

				{/* Quotations Grid */}
				{!isLoading && quotations && quotations.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{quotations.map((quotation) => (
							<QuotationCard key={quotation.id} quotation={quotation} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
