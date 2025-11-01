import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSessionFn } from "@/services/auth";

export const Route = createFileRoute("/_public")({
	beforeLoad: async () => {
		const session = await getSessionFn();

		if (session?.user) {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
