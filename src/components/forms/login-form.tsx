import { z } from "zod";
import GoogleSignInButton from "@/components/ui/google-sign-in-button";
import { useAppForm } from "@/hooks/form";
import { useLogin, useLoginWithGoogle } from "@/queries/auth";

const LoginForm = () => {
	const mutation = useLogin();
	const googleMutation = useLoginWithGoogle();
	const form = useAppForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async (data) => {
			mutation.mutate({
				email: data.value.email,
				password: data.value.password,
			});
		},
		validators: {
			onChange: z.object({
				email: z.email("El email no es válido"),
				password: z
					.string()
					.min(6, "La contraseña debe tener al menos 6 caracteres"),
			}),
		},
	});

	return (
		<div className="flex flex-col gap-4 w-full">
			<GoogleSignInButton
				onClick={() => googleMutation.mutate()}
				isLoading={googleMutation.isPending}
			/>

			<div className="relative my-3">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-white px-2 pb-0.5 text-muted-foreground">
						O continuá con email
					</span>
				</div>
			</div>

			<form
				className="flex flex-col gap-4 w-full"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.AppField name="email">
					{(field) => <field.TextField label="Email" autoComplete="email" />}
				</form.AppField>

				<form.AppField name="password">
					{(field) => (
						<field.TextField
							label="Contraseña"
							description="Al menos 6 caracteres"
							type="password"
						/>
					)}
				</form.AppField>

				<form.AppForm>
					<form.SubscribeButton label="Iniciar sesión" />
				</form.AppForm>
			</form>
		</div>
	);
};

export default LoginForm;
