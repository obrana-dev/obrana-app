import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useCallback, useState } from "react";
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
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const handleMenuClick = useCallback(() => {
		setSidebarOpen((prev) => !prev);
	}, []);

	const handleClose = useCallback(() => {
		setSidebarOpen(false);
	}, []);

	return (
		<div className="flex flex-col h-screen">
			<Topbar onMenuClick={handleMenuClick} />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar isOpen={sidebarOpen} onClose={handleClose} />
				<main className="flex-1 overflow-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
