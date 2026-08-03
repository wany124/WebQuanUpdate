import { Pool, type PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Managed Postgres providers (Render, Railway, Neon, Supabase, RDS, etc.)
// generally require SSL and present certs that node's default TLS trust
// store won't validate. Local/dev Postgres typically has no SSL configured
// at all, so we only enable it in production unless explicitly overridden
// via PGSSL=true|false.
const shouldUseSsl =
  process.env.PGSSL === "true" ||
  (process.env.PGSSL !== "false" && process.env.NODE_ENV === "production");

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ...(shouldUseSsl ? { ssl: { rejectUnauthorized: false } } : {}),
};

export const pool = new Pool(poolConfig);
export const db = drizzle({ client: pool, schema });
