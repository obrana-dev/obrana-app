import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "@/components/forms/login-form";

export const Route = createFileRoute("/_public/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex-col h-full w-full flex flex-1 items-center justify-center">
			<h1>Login</h1>
			<LoginForm />
		</div>
	);
}
