import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export const useSignUp = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: async (data: { email: string; password: string; name: string }) => {
			const result = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			});

			if (result.error) {
				throw new Error(result.error.message || "Error al registrarse");
			}

			return result;
		},
		onSuccess: () => {
			router.navigate({ to: "/" });
		},
		onError: (error) => {
			toast.error(error.message || "Error al registrarse");
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

			console.log({ result });

			if (result.error) {
				throw new Error(result.error.message || "Credenciales inválidas");
			}

			return result;
		},
		onSuccess: () => {
			router.navigate({ to: "/" });
		},
		onError: (error) => {
			toast.error(error.message || "Error al iniciar sesión");
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
				throw new Error(result.error.message || "Error al iniciar sesión con Google");
			}

			return result;
		},
		onError: (error) => {
			toast.error(error.message || "Error al iniciar sesión con Google");
		},
	});
};

// Export useSession from authClient for checking user state
export { useSession } from "@/lib/auth-client";
