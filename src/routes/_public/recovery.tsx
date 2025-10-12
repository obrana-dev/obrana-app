import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/recovery")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_public/recovery"!</div>;
}
