import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface AuthError {
	status: number;
	message: string;
	statusText: string;
	code: string;
}

export const useSignUp = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: async (data: {
			email: string;
			password: string;
			name: string;
		}) => {
			const result = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			});

			if (result.error) {
				throw result.error;
			}

			return { ...result, email: data.email };
		},
		onSuccess: (data) => {
			// Redirect to verification page with email in search params
			router.navigate({ to: "/verify_email", search: { email: data.email } });
		},
		onError: (error: AuthError) => {
			if (error.code?.includes("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL")) {
				toast.error(
					"Este email ya está registrado. Si utilizaste Google para registrarte, por favor inicia sesión con Google.",
				);
			} else {
				toast.error(error.message || "Error al registrarse");
			}
		},
	});
};

export const useLogin = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: async (data: { email: string; password: string }) => {
			const result = await authClient.signIn.email({
				email: data.email,
				password: data.password,
			});

			if (result.error) {
				const err = result.error as AuthError;
				throw { ...err, email: data.email };
			}

			return result;
		},
		onSuccess: () => {
			router.navigate({ to: "/" });
		},
		onError: (error: (Error | AuthError) & { email?: string }) => {
			if ("code" in error && error.code === "EMAIL_NOT_VERIFIED") {
				router.navigate({
					to: "/verify_email",
					search: { email: error.email },
				});
			} else {
				toast.error(error.message || "Error al iniciar sesión");
			}
		},
	});
};

export const useLogout = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: async () => {
			await authClient.signOut();
		},
		onSuccess: () => {
			router.navigate({ to: "/sign_in" });
		},
	});
};

export const useLoginWithGoogle = () => {
	return useMutation({
		mutationFn: async () => {
			const result = await authClient.signIn.social({
				provider: "google",
			});

			if (result.error) {
				throw result.error;
			}

			return result;
		},
		onError: (error) => {
			toast.error(error.message || "Error al iniciar sesión con Google");
		},
	});
};

export const useResendVerificationEmail = () => {
	return useMutation({
		mutationFn: async (data: { email: string }) => {
			const result = await authClient.sendVerificationEmail({
				email: data.email,
				callbackURL: "/",
			});

			if (result.error) {
				throw result.error;
			}

			return result;
		},
		onSuccess: () => {
			toast.success("Email de verificación reenviado correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al reenviar email de verificación");
		},
	});
};

// Export useSession from authClient for checking user state
export { useSession } from "@/lib/auth-client";
