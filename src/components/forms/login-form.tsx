import { z } from "zod";
import { useAppForm } from "@/hooks/form";
import { useLogin } from "@/queries/auth";

const LoginForm = () => {
	const mutation = useLogin();
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
	);
};

export default LoginForm;
