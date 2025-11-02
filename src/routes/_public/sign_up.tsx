import { createFileRoute } from "@tanstack/react-router";
import { Link } from "react-aria-components";
import SignUpForm from "@/components/forms/sign-up-form";

export const Route = createFileRoute("/_public/sign_up")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex-col h-full w-full flex flex-1 items-center justify-center">
			<div className="w-80 flex flex-col items-center justify-center">
				<h1 className="text-3xl font-semibold mb-10">Obrana</h1>
				<SignUpForm />
				<span className="mt-4 text-sm">
					¿Ya tienes una cuenta?{" "}
					<Link className="text-blue-500 hover:underline" href="/sign_in">
						Iniciar sesión
					</Link>
				</span>
			</div>
		</div>
	);
}
