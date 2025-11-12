import { createFileRoute } from "@tanstack/react-router";
import { ClientFormHeader } from "@/components/clients/client-form-header";
import { ClientForm } from "@/components/forms/client-form";

export const Route = createFileRoute("/_authed/clients/new")({
	component: NewClient,
});

function NewClient() {
	return (
		<div className="bg-gray-50 pb-20 sm:pb-6">
			<ClientFormHeader
				title="Nuevo Cliente"
				subtitle="Completa la información del cliente"
			/>

			<div className="px-4 py-6 sm:px-6 lg:px-8">
				<ClientForm mode="create" />
			</div>
		</div>
	);
}
