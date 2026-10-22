import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration — read by the CLI only (migrate, seed, studio).
 * The app connects through @prisma/adapter-pg with DATABASE_URL (src/lib/prisma.ts).
 *
 *  · The datasource URL lives here, not in schema.prisma (Prisma 7).
 *  · .env is loaded explicitly; variables already set in the shell win.
 *  · DIRECT_URL, when set, is used instead of DATABASE_URL: migrations need a
 *    session-level connection, while a serverless app connects through a
 *    transaction-mode pooler (Supabase: port 6543 for the app, 5432 here).
 */
try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // .env is optional — production containers provide real environment variables.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    // tsx (not plain node) so the seed can resolve the "@/..." path aliases used by src/lib.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
