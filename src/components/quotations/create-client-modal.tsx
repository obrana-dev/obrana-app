import { X } from "lucide-react";
import { ClientForm } from "@/components/forms/client-form";

interface CreateClientModalProps {
	isOpen: boolean;
	onClose: () => void;
	onClientCreated: (clientId: string) => void;
}

export function CreateClientModal({
	isOpen,
	onClose,
	onClientCreated,
}: CreateClientModalProps) {
	if (!isOpen) return null;

	const handleSuccess = (clientId: string) => {
		onClientCreated(clientId);
		onClose();
	};

	return (
		<>
			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
					{/* Header */}
					<div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
						<div>
							<h2 className="text-xl font-bold text-gray-900">
								Crear Cliente Nuevo
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								El cliente será seleccionado automáticamente
							</p>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
							aria-label="Cerrar"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Form */}
					<div className="p-4 sm:p-6">
						<ClientForm
							mode="create"
							redirectOnSuccess={false}
							onSuccessCallback={handleSuccess}
							onClose={onClose}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
