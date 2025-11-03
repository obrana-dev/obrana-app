import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

// Get user's linked accounts
export function useListAccounts() {
	return useQuery({
		queryKey: ["accounts"],
		queryFn: async () => {
			const response = await authClient.listAccounts();
			return response.data;
		},
	});
}

// Update user profile
export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { name?: string; image?: string }) => {
			const response = await authClient.updateUser(data);
			if (response.error) {
				throw new Error(response.error.message);
			}
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["session"] });
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
			toast.success("Perfil actualizado correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al actualizar el perfil");
		},
	});
}

// Change password
export function useChangePassword() {
	return useMutation({
		mutationFn: async (data: {
			currentPassword: string;
			newPassword: string;
			revokeOtherSessions?: boolean;
		}) => {
			const response = await authClient.changePassword(data);
			if (response.error) {
				throw new Error(response.error.message);
			}
			return response.data;
		},
		onSuccess: () => {
			toast.success("Contraseña cambiada correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al cambiar la contraseña");
		},
	});
}

// Link social account (Google)
export function useLinkSocial() {
	return useMutation({
		mutationFn: async (provider: "google") => {
			const response = await authClient.linkSocial({
				provider,
				callbackURL: `${window.location.origin}/settings`,
			});
			if (response.error) {
				throw new Error(response.error.message);
			}
			return response.data;
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al vincular la cuenta");
		},
	});
}

// Unlink social account (Google)
export function useUnlinkSocial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (provider: "google") => {
			const response = await authClient.unlinkAccount({
				providerId: provider,
			});
			if (response.error) {
				throw new Error(response.error.message);
			}
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
			toast.success("Cuenta desvinculada correctamente");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Error al desvincular la cuenta");
		},
	});
}
