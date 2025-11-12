import { createFileRoute } from "@tanstack/react-router";
import { QuotationForm } from "@/components/forms/quotation-form";
import { QuotationFormHeader } from "@/components/quotations/quotation-form-header";

export const Route = createFileRoute("/_authed/quotations/new")({
	component: NewQuotation,
});

function NewQuotation() {
	return (
		<div className="bg-gray-50 pb-20 sm:pb-6">
			<QuotationFormHeader
				title="Nuevo Presupuesto"
				subtitle="Crea un presupuesto para tu cliente"
			/>

			<div className="px-4 py-6 sm:px-6 lg:px-8">
				<QuotationForm mode="create" />
			</div>
		</div>
	);
}
