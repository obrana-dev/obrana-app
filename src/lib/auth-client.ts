import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL:
		import.meta.env.VITE_BASE_URL ||
		(typeof window !== "undefined" ? window.location.origin : ""),
});

export const { signIn, signUp, signOut, useSession } = authClient;
