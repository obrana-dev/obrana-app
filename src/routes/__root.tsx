import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { ErrorFallback } from "@/components/common/error-boundary";
import { NotFound } from "@/components/common/not-found";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import "../styles.css";
import { getSessionFn } from "@/services/auth";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Obrana",
			},
		],
	}),

	beforeLoad: async () => {
		const session = await getSessionFn();

		return { session };
	},
	errorComponent: ({ error }) => <ErrorFallback error={error} />,

	notFoundComponent: NotFound,

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="h-screen w-screen">
				<Toaster position="top-right" richColors />
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
