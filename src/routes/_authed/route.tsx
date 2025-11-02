import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSessionFn } from "@/services/auth";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async () => {
		const session = await getSessionFn();

		if (!session?.user) {
			throw redirect({ to: "/sign_in" });
		}

		// With requireEmailVerification: true, users won't have a session
		// until email is verified, so no need to check emailVerified here
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
