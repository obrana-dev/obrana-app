import { z } from "zod";
import { useAppForm } from "@/hooks/form";
import { useLogin } from "@/queries/auth";

const LoginForm = () => {
	const mutation = useLogin();
	const form = useAppForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async (data) => {
			mutation.mutate({ data: data.value });
		},
		validators: {
			onChange: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(6, "Password must be at least 6 characters"),
			}),
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<form.AppField name="email">
				{(field) => <field.TextField label="Email" />}
			</form.AppField>

			<form.AppField name="password">
				{(field) => <field.TextField label="Password" />}
			</form.AppField>

			<form.AppForm>
				<form.SubscribeButton label="Login" />
			</form.AppForm>
		</form>
	);
};

export default LoginForm;
