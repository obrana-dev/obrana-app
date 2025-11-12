import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { ClientFormHeader } from "@/components/clients/client-form-header";
import { ClientForm } from "@/components/forms/client-form";
import { Button } from "@/components/ui/button";
import { useClient, useDeleteClient } from "@/queries/clients";

export const Route = createFileRoute("/_authed/clients/$clientId")({
	component: ClientDetail,
});

function ClientDetail() {
	const { clientId } = Route.useParams();
	const { data: client, isLoading, error } = useClient(clientId);
	const deleteClient = useDeleteClient();
	const navigate = useNavigate();

	const handleDelete = () => {
		if (
			window.confirm(
				`¿Estás seguro de eliminar al cliente "${client?.name}"? Esta acción no se puede deshacer.`,
			)
		) {
			deleteClient.mutate(
				{ data: clientId },
				{
					onSuccess: () => {
						navigate({ to: "/clients" });
					},
				},
			);
		}
	};

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Error al cargar el cliente
					</h2>
					<p className="text-gray-600">{error.message}</p>
				</div>
			</div>
		);
	}

	if (isLoading || !client) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-gray-600">Cargando...</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 pb-20 sm:pb-6">
			<ClientFormHeader
				title={`Editar Cliente: ${client.name}`}
				subtitle="Actualiza la información del cliente"
			/>

			<div className="px-4 py-6 sm:px-6 lg:px-8 space-y-4">
				<ClientForm
					mode="edit"
					initialData={{
						id: clientId,
						name: client.name,
						email: client.email,
						phone: client.phone,
						address: client.address,
					}}
				/>

				{/* Danger Zone */}
				<section className="bg-white rounded-xl border border-red-200 shadow-sm max-w-3xl">
					<div className="p-4 sm:p-6 border-b border-red-100">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
								<Trash2 className="w-5 h-5 text-red-600" />
							</div>
							<div>
								<h2 className="text-base sm:text-lg font-semibold text-gray-900">
									Zona de Peligro
								</h2>
								<p className="text-xs sm:text-sm text-gray-500">
									Las acciones aquí son irreversibles
								</p>
							</div>
						</div>
					</div>
					<div className="p-4 sm:p-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-medium text-gray-900">
									Eliminar Cliente
								</h3>
								<p className="text-xs text-gray-500 mt-1">
									Esta acción no se puede deshacer
								</p>
							</div>
							<Button
								color="error"
								onPress={handleDelete}
								isDisabled={deleteClient.isPending}
							>
								{deleteClient.isPending ? "Eliminando..." : "Eliminar"}
							</Button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
