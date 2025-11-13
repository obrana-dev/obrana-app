import { useRouter } from "@tanstack/react-router";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 Not Found page component
 * Displays when a route doesn't exist
 */
export function NotFound() {
	const router = useRouter();

	const handleGoHome = () => {
		router.navigate({ to: "/" });
	};

	const handleGoBack = () => {
		router.history.back();
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full text-center">
				<div className="mb-8">
					<FileQuestion className="w-24 h-24 text-gray-400 mx-auto mb-4" />
					<h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
					<h2 className="text-2xl font-semibold text-gray-700 mb-4">
						Página no encontrada
					</h2>
					<p className="text-gray-600 mb-8">
						La página que buscas no existe o fue movida a otra ubicación.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button onPress={handleGoHome} color="primary">
						<Home className="w-4 h-4 mr-2" />
						Ir al inicio
					</Button>
					<Button onPress={handleGoBack} color="secondary">
						Volver atrás
					</Button>
				</div>
			</div>
		</div>
	);
}
