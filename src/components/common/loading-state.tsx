interface LoadingStateProps {
	message?: string;
}

export function LoadingState({ message = "Cargando..." }: LoadingStateProps) {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2" />
				<p className="text-gray-600">{message}</p>
			</div>
		</div>
	);
}
