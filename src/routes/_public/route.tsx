import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
	beforeLoad: async ({ context }) => {
		console.log('context.user', context.user);
		if (context.user) {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
