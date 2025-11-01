import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSessionFn } from "@/services/auth";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async () => {
		const session = await getSessionFn();

		if (!session?.user) {
			throw redirect({ to: "/sign_in" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
