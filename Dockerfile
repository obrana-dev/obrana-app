# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies stage - install all dependencies for building
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder stage - build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate drizzle migrations if they don't exist
RUN if [ ! -d "drizzle" ]; then pnpm db:generate; fi

# Build the application
RUN pnpm run build

# Production stage - optimized runtime image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built output and necessary files for migrations
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/db ./src/db

# Install all dependencies (need drizzle-kit for migrations)
RUN pnpm install --frozen-lockfile

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 tanstack && \
    chown -R tanstack:nodejs /app

USER tanstack

EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "pnpm db:migrate && node .output/server/index.mjs"]
