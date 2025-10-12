import { createFileRoute } from "@tanstack/react-router";
import { useLogout } from "@/queries/auth";

export const Route = createFileRoute("/_authed/")({
	component: App,
});

function App() {
	const mutation = useLogout();
	return (
		<div>
			Authenticated dashboard
			<button onClick={() => mutation.mutate({})} type="button">
				Logout
			</button>
		</div>
	);
}
