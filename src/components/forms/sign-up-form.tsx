import { z } from "zod";
import { useAppForm } from "@/hooks/form";
import { useSignUp } from "@/queries/auth";

const SignUpForm = () => {
	const mutation = useSignUp();
	const form = useAppForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async (data) => {
			console.log("Signing up with", data.value);
			mutation.mutate({ data: data.value });
		},
		validators: {
			onChange: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(6, "Password must be at least 6 characters"),
				// name: z.string().min(2, "Name must be at least 2 characters"),
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

			{/* <form.AppField name="name">
				{(field) => <field.TextField label="Nombre" />}
			</form.AppField> */}

			<form.AppForm>
				<form.SubscribeButton label="Login" />
			</form.AppForm>
		</form>
	);
};

export default SignUpForm;
