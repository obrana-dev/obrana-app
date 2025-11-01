import { z } from "zod";
import { useAppForm } from "@/hooks/form";
import { useSignUp } from "@/queries/auth";

const SignUpForm = () => {
	const mutation = useSignUp();
	const form = useAppForm({
		defaultValues: { email: "", password: "", name: "" },
		onSubmit: async (data) => {
			mutation.mutate({
				name: data.value.name,
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
				name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
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

			<form.AppField name="name">
				{(field) => <field.TextField label="Nombre" autoComplete="name" />}
			</form.AppField>

			<form.AppForm>
				<form.SubscribeButton label="Registrarse" />
			</form.AppForm>
		</form>
	);
};

export default SignUpForm;
