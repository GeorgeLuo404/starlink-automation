import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration.
 *
 * Two things changed in Prisma 7 and are handled here:
 *  1. The datasource URL moved out of schema.prisma into this file.
 *  2. .env is no longer loaded automatically — we load it explicitly for the CLI.
 *     (The Next.js runtime loads .env on its own; this file is only for the CLI.)
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
    url: process.env.DATABASE_URL ?? "",
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
