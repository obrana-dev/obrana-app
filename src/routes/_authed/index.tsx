import { createFileRoute } from "@tanstack/react-router";
import { useLogout, useSession } from "@/queries/auth";

export const Route = createFileRoute("/_authed/")({
	component: App,
});

function App() {
	const mutation = useLogout();
	const { data } = useSession();
	return (
		<div className="flex-col h-full w-full flex flex-1 items-center justify-center">
			<div className="max-w-100">{JSON.stringify(data, null, 3)}</div>
			<button onClick={() => mutation.mutate()} type="button">
				Logout
			</button>
			Authenticated dashboard
		</div>
	);
}
