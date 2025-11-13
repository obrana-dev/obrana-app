import { useRouter } from "@tanstack/react-router";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
	error: Error;
	reset?: () => void;
}

/**
 * Error boundary component for route-level error handling
 * Displays a user-friendly error message with option to retry or go home
 */
export function RouteErrorBoundary({ error, reset }: ErrorBoundaryProps) {
	const router = useRouter();

	const handleRetry = () => {
		if (reset) {
			reset();
		} else {
			window.location.reload();
		}
	};

	const handleGoHome = () => {
		router.navigate({ to: "/" });
	};

	// Determine if error is a known type
	const isNotFound = error.message.includes("not found");
	const isUnauthorized = error.message.includes("Unauthorized");

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
				<div className="flex items-start gap-4">
					<div className="flex-shrink-0">
						<AlertCircle className="w-6 h-6 text-red-500" />
					</div>
					<div className="flex-1">
						<h2 className="text-lg font-semibold text-gray-900 mb-2">
							{isNotFound
								? "Recurso no encontrado"
								: isUnauthorized
									? "Acceso no autorizado"
									: "Algo salió mal"}
						</h2>
						<p className="text-sm text-gray-600 mb-4">
							{isNotFound
								? "El recurso que buscas no existe o fue eliminado."
								: isUnauthorized
									? "No tienes permiso para acceder a este recurso."
									: error.message ||
										"Ocurrió un error inesperado. Por favor intenta nuevamente."}
						</p>

						<div className="flex gap-3">
							<Button onPress={handleRetry} color="primary" size="sm">
								<RefreshCw className="w-4 h-4 mr-2" />
								Reintentar
							</Button>
							<Button onPress={handleGoHome} color="secondary" size="sm">
								Ir al inicio
							</Button>
						</div>

						{/* Show stack trace in development */}
						{import.meta.env.DEV && error.stack && (
							<details className="mt-4">
								<summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
									Detalles del error (solo en desarrollo)
								</summary>
								<pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
									{error.stack}
								</pre>
							</details>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Minimal error fallback for critical errors
 */
export function ErrorFallback({ error }: { error: Error }) {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="text-center">
				<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
				<h1 className="text-xl font-semibold text-gray-900 mb-2">
					Error crítico
				</h1>
				<p className="text-gray-600 mb-4">
					{error.message || "Ocurrió un error inesperado"}
				</p>
				<Button
					onPress={() => window.location.reload()}
					color="primary"
					size="sm"
				>
					Recargar página
				</Button>
			</div>
		</div>
	);
}
