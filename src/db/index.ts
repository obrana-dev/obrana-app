import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * PostgreSQL connection pool configuration
 *
 * - max: Maximum number of connections in the pool (default: 10)
 *   Should be: (PostgreSQL max_connections / number of app instances) - safety margin
 *   PostgreSQL default max_connections is 100, so 10 is safe for single instance
 *
 * - min: Minimum number of connections to keep alive (default: 2)
 *   Keeps connections warm for faster response times
 *
 * - idleTimeoutMillis: Close idle connections after this time (default: 30000ms = 30s)
 *   Balance between keeping connections alive and releasing unused resources
 *
 * - connectionTimeoutMillis: Fail fast if no connection available (default: 5000ms = 5s)
 *   Prevents requests from hanging indefinitely when pool is exhausted
 */
export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 10,
	min: 2,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });
