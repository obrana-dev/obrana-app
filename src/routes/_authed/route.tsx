import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
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
	return (
		<div className="flex flex-col h-screen">
			<Topbar />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar />
				<main className="flex-1 overflow-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
