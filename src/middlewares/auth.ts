import { createMiddleware } from "@tanstack/react-start";
import { fetchUserFn } from "@/services/auth";

const authMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const user = await fetchUserFn();

		if (!user) {
			throw new Error("Unauthorized");
		}
		return next({ context: { user } });
	},
);

export default authMiddleware;
