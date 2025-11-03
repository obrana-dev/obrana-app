import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/_authed/")({
	component: Dashboard,
});

function getGreeting(hour: number): string {
	if (hour >= 6 && hour < 12) {
		return "Buen día";
	}
	if (hour >= 12 && hour < 20) {
		return "Buenas tardes";
	}
	return "Buenas noches";
}

function Dashboard() {
	const { data: session } = useSession();
	const hour = new Date().getHours();
	const greeting = getGreeting(hour);
	const name =
		session?.user?.name || session?.user?.email?.split("@")[0] || "Usuario";

	return (
		<div className="p-6">
			<h1 className="text-3xl font-semibold text-gray-900">
				{greeting}, {name}
			</h1>
		</div>
	);
}
