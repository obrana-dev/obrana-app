import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/integrations/supabase";

export const loginFn = createServerFn({ method: "POST" })
	.inputValidator(
		(d: { email: string; password: string; withoutRedirect?: boolean }) => d,
	)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		if (data.withoutRedirect) {
			return {
				error: false,
				message: "Login successful",
			};
		}

		throw redirect({ to: "/" });
	});

export const fetchUserFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();
		const { data, error: _error } = await supabase.auth.getUser();

		if (_error) {
			console.error(_error);
			return null;
		}

		if (!data.user) {
			return null;
		}

		return data.user;
	},
);

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
	const supabase = getSupabaseServerClient();
	await supabase.auth.signOut();
	throw redirect({ to: "/login" });
});

export const signupFn = createServerFn({ method: "POST" })
	.inputValidator(
		(d: { email: string; password: string; redirectUrl?: string }) => d,
	)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
		});

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		loginFn({ data: { email: data.email, password: data.password } });

		throw redirect({ to: "/email_confirm" });
	});
