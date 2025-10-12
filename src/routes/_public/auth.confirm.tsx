import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { getSupabaseServerClient } from "@/integrations/supabase";

const otpTypes = [
	"magiclink",
	"signup",
	"invite",
	"recovery",
	"email",
	"email_change",
] as const;

const querySchema = z.object({
	token_hash: z.string().min(1, "Token is required"),
	type: z.enum(otpTypes),
	next: z.string().optional(),
});

export const Route = createFileRoute("/_public/auth/confirm")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				console.log(request);

				const searchParams = Object.fromEntries(
					new URL(request.url).searchParams,
				);
				console.log(searchParams);
				const { token_hash, type, next } = querySchema.parse(searchParams);

				if (token_hash && type) {
					const supabase = getSupabaseServerClient();

					const { error } = await supabase.auth.verifyOtp({
						type,
						token_hash,
					});
					if (!error) {
						throw redirect({ href: next || "/" });
					}
				}

				throw redirect({ to: "/login" });
			},
		},
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_public/auth/confirm"!</div>;
}
