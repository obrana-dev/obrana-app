import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { RouteErrorBoundary } from "@/components/common/error-boundary";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async ({ context }) => {
		if (!context.session?.user) {
			throw redirect({ to: "/sign_in" });
		}
	},
	errorComponent: ({ error, reset }) => (
		<RouteErrorBoundary error={error} reset={reset} />
	),
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
