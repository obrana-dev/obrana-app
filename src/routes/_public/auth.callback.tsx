import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { getSupabaseServerClient } from "@/integrations/supabase";

const querySchema = z.object({
	code: z.string().min(1, "Code is required"),
	next: z.string().optional(),
});

export const Route = createFileRoute("/_public/auth/callback")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const searchParams = Object.fromEntries(
					new URL(request.url).searchParams,
				);
				const { code, next } = querySchema.parse(searchParams);

				if (code) {
					const supabase = getSupabaseServerClient();
					const { error } = await supabase.auth.exchangeCodeForSession(code);

					if (!error) {
						throw redirect({ href: next || "/" });
					}
				}

				throw redirect({ to: "/login" });
			},
		},
	},
});
