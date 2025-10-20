import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "react-aria-components";
import LoginForm from "@/components/forms/login-form";
import { Button } from "@/components/ui";
import { useLoginWithGoogle } from "@/queries/auth";

export const Route = createFileRoute("/_public/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const mutation = useLoginWithGoogle();

	return (
		<div className="flex-col h-full w-full flex flex-1 items-center justify-center">
			<h1>Login</h1>
			<LoginForm />
			<Separator orientation="horizontal" className="my-4 w-full" />
			<div>
				<Button onPress={() => mutation.mutate({})}>Login with Google</Button>
			</div>
		</div>
	);
}
