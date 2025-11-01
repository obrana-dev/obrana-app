import { createFileRoute } from "@tanstack/react-router";
import { Link } from "react-aria-components";
import LoginForm from "@/components/forms/login-form";
import { Button } from "@/components/ui";
import { useLoginWithGoogle } from "@/queries/auth";

export const Route = createFileRoute("/_public/sign_in")({
	component: RouteComponent,
});

function RouteComponent() {
	const mutation = useLoginWithGoogle();

	return (
		<div className="flex-col h-full w-full flex flex-1 items-center justify-center">
			<div className="w-80 flex flex-col items-center justify-center">
				<h1 className="text-3xl font-semibold mb-10">Obrana</h1>
				<LoginForm />
				<div className="my-3"> o </div>
				<Button onPress={() => mutation.mutate()} className="w-full">
					Iniciar sesión con Google
				</Button>
				<span className="mt-4 text-sm">
					¿No tenés una cuenta?{" "}
					<Link className="text-blue-500 hover:underline" href="/sign_up">
						Registrate
					</Link>
				</span>
			</div>
		</div>
	);
}
