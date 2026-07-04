import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

/**
 * When running against a pooled connection (e.g. Supabase's transaction pooler
 * on port 6543), migrations must go through a direct connection instead —
 * PgBouncer in transaction mode doesn't support the session-level features
 * Prisma migrations rely on.
 *
 * If `DIRECT_URL` is set, use it for migrations. Otherwise fall back to
 * `DATABASE_URL` (which is the direct URL locally against Docker Postgres).
 */
const migrationUrlVar = process.env.DIRECT_URL ? "DIRECT_URL" : "DATABASE_URL";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: env(migrationUrlVar),
  },
});
