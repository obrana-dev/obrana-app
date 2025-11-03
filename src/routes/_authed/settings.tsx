import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import { useSession } from "@/lib/auth-client";
import {
	useChangePassword,
	useLinkSocial,
	useListAccounts,
	useUnlinkSocial,
	useUpdateUser,
} from "@/queries/user";

export const Route = createFileRoute("/_authed/settings")({
	component: Settings,
});

function Settings() {
	const { data: session } = useSession();
	const { data: accounts } = useListAccounts();
	const updateUser = useUpdateUser();
	const changePassword = useChangePassword();
	const linkSocial = useLinkSocial();
	const unlinkSocial = useUnlinkSocial();

	// Check which accounts are linked
	const hasGoogleAccount = accounts?.some(
		(account) => account.providerId === "google",
	);
	const hasPasswordAccount = accounts?.some(
		(account) => account.providerId === "credential",
	);

	// Profile update form
	const profileForm = useAppForm({
		defaultValues: {
			name: session?.user?.name || "",
		},
		onSubmit: async (data) => {
			updateUser.mutate({ name: data.value.name });
		},
		validators: {
			onChange: z.object({
				name: z.string().min(1, "El nombre es requerido"),
			}),
		},
	});

	// Change password form
	const passwordForm = useAppForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		onSubmit: async (data) => {
			changePassword.mutate(
				{
					currentPassword: data.value.currentPassword,
					newPassword: data.value.newPassword,
				},
				{
					onSuccess: () => {
						passwordForm.reset();
					},
				},
			);
		},
		validators: {
			onChange: z
				.object({
					currentPassword: z
						.string()
						.min(6, "La contraseña debe tener al menos 6 caracteres"),
					newPassword: z
						.string()
						.min(6, "La contraseña debe tener al menos 6 caracteres"),
					confirmPassword: z
						.string()
						.min(6, "La contraseña debe tener al menos 6 caracteres"),
				})
				.refine((data) => data.newPassword === data.confirmPassword, {
					message: "Las contraseñas no coinciden",
					path: ["confirmPassword"],
				}),
		},
	});

	const handleLinkGoogle = () => {
		linkSocial.mutate("google");
	};

	const handleUnlinkGoogle = () => {
		unlinkSocial.mutate("google");
	};

	const handleSetPassword = () => {
		// Redirect to forgot password flow
		window.location.href = "/recovery";
	};

	return (
		<div className="p-6 max-w-4xl">
			<h1 className="text-2xl font-semibold text-gray-900 mb-6">
				Configuración
			</h1>

			{/* Personal Information Section */}
			<section className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Información Personal
				</h2>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						profileForm.handleSubmit();
					}}
				>
					<profileForm.AppField name="name">
						{(field) => (
							<div className="w-full max-w-md">
								<field.TextField label="Nombre" />
							</div>
						)}
					</profileForm.AppField>

					<div className="w-full max-w-md">
						<label className="mb-1 font-medium text-lg block" htmlFor="email">
							Email
						</label>
						<input
							type="email"
							value={session?.user?.email || ""}
							readOnly
							className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 cursor-not-allowed"
						/>
						<p className="text-sm text-gray-500 mt-1">
							El email no puede ser modificado
						</p>
					</div>

					<profileForm.AppForm>
						<profileForm.SubscribeButton label="Guardar cambios" />
					</profileForm.AppForm>
				</form>
			</section>

			{/* Authentication Methods Section */}
			<section className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Métodos de Autenticación
				</h2>
				<div className="space-y-4">
					{/* Google Account */}
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
								<svg
									className="w-5 h-5"
									viewBox="0 0 24 24"
									aria-label="google"
									role="image"
								>
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
							</div>
							<div>
								<p className="font-medium text-gray-900">Google</p>
								<p className="text-sm text-gray-500">
									{hasGoogleAccount ? "Cuenta vinculada" : "No vinculada"}
								</p>
							</div>
						</div>
						{hasGoogleAccount ? (
							<Button
								onPress={handleUnlinkGoogle}
								size="sm"
								color="error"
								isDisabled={unlinkSocial.isPending}
							>
								{unlinkSocial.isPending ? "Desvinculando..." : "Desvincular"}
							</Button>
						) : (
							<Button
								onPress={handleLinkGoogle}
								size="sm"
								isDisabled={linkSocial.isPending}
							>
								Vincular
							</Button>
						)}
					</div>

					{/* Email/Password Account */}
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
								<Mail className="w-5 h-5 text-gray-600" />
							</div>
							<div>
								<p className="font-medium text-gray-900">Email y Contraseña</p>
								<p className="text-sm text-gray-500">
									{hasPasswordAccount
										? "Contraseña configurada"
										: "No configurada"}
								</p>
							</div>
						</div>
						{hasPasswordAccount ? (
							<Check className="w-5 h-5 text-success" />
						) : (
							<Button onPress={handleSetPassword} size="sm">
								Configurar contraseña
							</Button>
						)}
					</div>
				</div>
			</section>

			{/* Change Password Section - Only show if user has password */}
			{hasPasswordAccount && (
				<section className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Cambiar Contraseña
					</h2>
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							passwordForm.handleSubmit();
						}}
					>
						<passwordForm.AppField name="currentPassword">
							{(field) => (
								<div className="w-full max-w-md">
									<field.TextField
										label="Contraseña actual"
										type="password"
										description="Al menos 6 caracteres"
									/>
								</div>
							)}
						</passwordForm.AppField>

						<passwordForm.AppField name="newPassword">
							{(field) => (
								<div className="w-full max-w-md">
									<field.TextField
										label="Nueva contraseña"
										type="password"
										description="Al menos 6 caracteres"
									/>
								</div>
							)}
						</passwordForm.AppField>

						<passwordForm.AppField name="confirmPassword">
							{(field) => (
								<div className="w-full max-w-md">
									<field.TextField
										label="Confirmar nueva contraseña"
										type="password"
										description="Al menos 6 caracteres"
									/>
								</div>
							)}
						</passwordForm.AppField>

						<passwordForm.AppForm>
							<passwordForm.SubscribeButton label="Cambiar contraseña" />
						</passwordForm.AppForm>
					</form>
				</section>
			)}
		</div>
	);
}
