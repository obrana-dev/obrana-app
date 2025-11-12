# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Directives

- **Do NOT create README files, setup guides, or documentation files unless explicitly requested by the user.**

## Project Overview

This is a full-stack React application built with TanStack Start, featuring authentication, routing, and database integration. The stack includes:
- TanStack Start for SSR/SSG React framework
- TanStack Router for file-based routing
- TanStack Query for data fetching
- Better Auth for authentication
- Drizzle ORM with PostgreSQL
- Tailwind CSS v4 for styling
- Biome for linting/formatting
- Vitest for testing

## Common Commands

### Development
```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Build for production
pnpm start        # Run production build
pnpm serve        # Preview production build
```

### Testing
```bash
pnpm test         # Run all tests with Vitest
```

### Code Quality
```bash
pnpm lint         # Lint code with Biome
pnpm format       # Format code with Biome
pnpm check        # Run both lint and format checks
```

### Database
```bash
pnpm db:generate  # Generate Drizzle migrations from schema
pnpm db:migrate   # Apply migrations to database
pnpm db:push      # Push schema changes directly (dev only)
pnpm db:studio    # Open Drizzle Studio GUI
```

Requires `DATABASE_URL` environment variable set to a PostgreSQL connection string.

## Architecture

### Routing Structure

The app uses TanStack Router with file-based routing in `src/routes/`:

- `__root.tsx` - Root layout with devtools, toaster, and global styles
- `_authed/` - Protected routes requiring authentication (redirects to `/sign_in` if not authenticated)
- `_public/` - Public routes that redirect to `/` if already authenticated (sign in, sign up, recovery, email confirm)
- `api/` - API endpoints (auth handler, health check)

Routes are auto-generated into `src/routeTree.gen.ts` by TanStack Router plugin.

### Authentication Flow

**Server-side (Better Auth):**
- `src/lib/auth.ts` - Better Auth instance configured with Drizzle adapter, email/password auth, Google OAuth, and email verification
  - Email/password auth requires email verification before login (security: prevents account takeover)
  - Email verification uses Resend API (requires `RESEND_API_KEY` environment variable)
  - Google OAuth requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
  - Redirect URI: `http://localhost:3000/api/auth/callback/google` (dev) or `https://yourdomain.com/api/auth/callback/google` (prod)
  - Account linking enabled: users can link multiple auth methods (Google + email/password) to same account
- `src/services/auth.ts` - Server function `getSessionFn` that retrieves session using Better Auth API
- `src/routes/api/auth/$.ts` - Catch-all API route handling Better Auth requests (email/password, OAuth flows, and email verification)

**Client-side:**
- `src/lib/auth-client.ts` - Better Auth React client with helpers: `signIn`, `signUp`, `signOut`, `useSession`
- Uses `VITE_BASE_URL` environment variable or `window.location.origin` fallback
- `src/queries/auth.ts` - React Query hooks for authentication: `useLogin`, `useSignUp`, `useLogout`, `useLoginWithGoogle`
- `src/components/ui/google-sign-in-button.tsx` - Google OAuth sign-in button component

**Route Protection:**
- `src/routes/_authed/route.tsx` - Uses `beforeLoad` to check session, redirects to `/sign_in` if not authenticated
- `src/routes/_public/route.tsx` - Uses `beforeLoad` to check session, redirects to `/` if authenticated
- `src/middlewares/auth.ts` - TanStack Start middleware for protecting server functions (throws "Unauthorized" error)

### Database Schema

Located in `src/db/schema.ts`, implements Better Auth tables:
- `user` - User accounts with email verification
- `session` - Active sessions with IP/user agent tracking
- `account` - OAuth accounts and password storage
- `verification` - Email verification tokens

Database client in `src/db/index.ts` uses `DATABASE_URL` environment variable.

### TanStack Query Integration

- `src/integrations/tanstack-query/root-provider.tsx` - Creates QueryClient and provider context
- `src/router.tsx` - Wraps router with QueryClient provider and sets up SSR/SSG query integration
- Query devtools integrated into `__root.tsx` via TanStack Devtools plugin

### Form Handling

Custom form system built on TanStack Form:
- `src/hooks/form.ts` - `useAppForm` hook with predefined field/form components
- `src/hooks/form-context.ts` - Form and field context definitions
- `src/components/ui/form-components/` - Reusable form field components (TextField, SelectField, TextAreaField, SubscribeButton)
- `src/components/forms/` - Complete form components that encapsulate both form logic (useAppForm) and UI
- `src/utils/form.ts` - Form error formatting utilities

**CRITICAL FORM PATTERN:**
- **NEVER** pass `form` or `field` as props to other components
- **NEVER** separate form logic (useAppForm) from form UI
- **ALWAYS** keep form logic and UI together in the same component (in `src/components/forms/`)
- Form components should handle their own submit buttons, cancel actions, and all form-related UI
- Route components should only render the form component, not contain any form logic

### UI Components

Component library in `src/components/ui/` built with React Aria Components and Tailwind CSS:
- Uses `tailwind-merge` and `tailwind-variants` for styling utilities
- Components include: Button, TextField, TextArea, Select, Label, Text
- Sonner for toast notifications (configured in `__root.tsx`)

### Path Aliases

TypeScript path alias `@/*` maps to `./src/*` (configured in `tsconfig.json` and `vite.config.ts` via `vite-tsconfig-paths`).

### Build Configuration

`vite.config.ts` includes plugins:
- `@tanstack/devtools-vite` - TanStack devtools
- `vite-tsconfig-paths` - Path alias resolution
- `@tailwindcss/vite` - Tailwind CSS v4
- `@tanstack/react-start/plugin/vite` - TanStack Start SSR/SSG
- `@tanstack/nitro-v2-vite-plugin` - Nitro server deployment
- `@vitejs/plugin-react` - React Fast Refresh

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID from Google Cloud Console (required for Google auth)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret from Google Cloud Console (required for Google auth)
- `RESEND_API_KEY` - Resend API key for sending verification emails (required for email/password signup)
- `VITE_BASE_URL` - Base URL for auth client (optional, defaults to window origin)

See `.env.example` for reference.

**Important**: For production, change the email sender in `src/lib/auth.ts` from `onboarding@resend.dev` to your verified domain.

## Key Patterns

1. **Server Functions**: Use `createServerFn` from `@tanstack/react-start` for server-side logic (see `src/services/auth.ts`)
2. **Route Loaders**: Use route `beforeLoad` for authentication checks and redirects
3. **SSR/SSG**: Router integrated with TanStack Query for SSR/SSG data fetching
4. **Type Safety**: Drizzle schema exports TypeScript types (`User`, `Session`, etc.)
