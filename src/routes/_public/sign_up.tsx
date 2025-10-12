import { createFileRoute } from "@tanstack/react-router";
import SignUpForm from "@/components/forms/sign-up-form";

export const Route = createFileRoute("/_public/sign_up")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex-col h-full w-full flex flex-1 items-center justify-center">
			<h1>Sign Up</h1>
			<SignUpForm />
		</div>
	);
}
