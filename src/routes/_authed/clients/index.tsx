import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { ClientCard } from "@/components/clients/client-card";
import { ClientListHeader } from "@/components/clients/client-list-header";
import { TextField } from "@/components/ui/text-field";
import { useClients } from "@/queries/clients";

export const Route = createFileRoute("/_authed/clients/")({
	component: ClientsPage,
});

function ClientsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const { data: clients, isLoading, error } = useClients(searchTerm);

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Error al cargar clientes
					</h2>
					<p className="text-gray-600">{error.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<ClientListHeader totalClients={clients?.length ?? 0} />

			<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
				{/* Search Bar */}
				<div className="mb-6">
					<TextField
						value={searchTerm}
						onChange={(value) => setSearchTerm(value)}
						label="Buscar clientes"
						className="w-full"
					>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Buscar por nombre, email o teléfono..."
							/>
						</div>
					</TextField>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="flex items-center justify-center py-12">
						<div className="text-gray-600">Cargando clientes...</div>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && clients && clients.length === 0 && (
					<div className="text-center py-12">
						<div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
							<Search className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{searchTerm
								? "No se encontraron clientes"
								: "No hay clientes aún"}
						</h3>
						<p className="text-gray-600">
							{searchTerm
								? "Intenta con otros términos de búsqueda"
								: "Comienza agregando tu primer cliente"}
						</p>
					</div>
				)}

				{/* Clients Grid */}
				{!isLoading && clients && clients.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{clients.map((client) => (
							<ClientCard key={client.id} client={client} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
