import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useResendVerificationEmail } from "@/queries/auth";

export const Route = createFileRoute("/_public/verify_email")({
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const searchParams = Route.useSearch() as { email?: string };
	const resendMutation = useResendVerificationEmail();

	const userEmail = searchParams.email;

	const handleResend = () => {
		if (userEmail) {
			resendMutation.mutate({ email: userEmail });
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="w-full max-w-md space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Verifica tu email</h1>
					<p className="text-muted-foreground">
						Te enviamos un enlace de verificación a{" "}
						{userEmail ? (
							<span className="font-medium">{userEmail}</span>
						) : (
							"tu correo"
						)}
						. Por favor revisa tu bandeja de entrada y haz clic en el enlace
						para continuar.
					</p>
				</div>

				<div className="space-y-3">
					<Button
						onPress={handleResend}
						isDisabled={!userEmail || resendMutation.isPending}
						className="w-full"
					>
						{resendMutation.isPending
							? "Reenviando..."
							: "Reenviar email de verificación"}
					</Button>

					{resendMutation.isSuccess && (
						<p className="text-sm text-green-600">
							Email reenviado correctamente. Revisa tu bandeja de entrada.
						</p>
					)}

					<button
						type="button"
						onClick={() => router.navigate({ to: "/sign_in" })}
						className="w-full text-sm text-muted-foreground hover:text-foreground"
					>
						Volver al inicio de sesión
					</button>
				</div>

				<p className="text-sm text-muted-foreground">
					¿No recibiste el email? Revisa tu carpeta de spam o solicita un nuevo
					enlace.
				</p>
			</div>
		</div>
	)
}
