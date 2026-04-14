import "server-only";

import { betterAuth } from "better-auth";
import { Pool } from "pg";

function createPostgresPool(): Pool {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || !url.startsWith("postgres")) {
    throw new Error(
      "Define DATABASE_URL con una cadena PostgreSQL (postgresql:// o postgres://usuario:clave@host:puerto/base)."
    );
  }
  return new Pool({ connectionString: url });
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: createPostgresPool(),
  emailAndPassword: {
    enabled: true,
  },
});
