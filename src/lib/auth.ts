import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import { Resend } from "resend";
import { db } from "@/db";
import * as schema from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	emailVerification: {
		sendVerificationEmail: async ({
			user,
			url,
		}: {
			user: { email: string; name: string };
			url: string;
		}) => {
			await resend.emails.send({
				from: "Obrana <noreply@notifications.obrana.io>",
				to: user.email,
				subject: "Verifica tu email",
				html: `
					<h2>Bienvenido a Obrana</h2>
					<p>Hola ${user.name},</p>
					<p>Por favor verifica tu email haciendo clic en el siguiente enlace:</p>
					<a href="${url}">Verificar Email</a>
					<p>Si no creaste esta cuenta, puedes ignorar este email.</p>
				`,
			});
		},
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	account: {
		accountLinking: {
			enabled: true,
		},
	},
	plugins: [reactStartCookies()],
});
