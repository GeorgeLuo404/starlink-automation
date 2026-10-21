import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 client factory.
 *
 * Prisma 7 no longer bundles a query engine inside the client — PostgreSQL access
 * goes through a driver adapter (@prisma/adapter-pg over node-postgres). The
 * connection string therefore lives here, not in schema.prisma.
 *
 * The client is created lazily so a missing or unreachable database degrades the
 * public site to bundled content instead of crashing every request.
 */

/**
 * Dev keeps one client on globalThis so hot reloads don't open new pools. It
 * remembers which generated PrismaClient class made it: after `prisma
 * generate` the module (and class) is new, and a client built from the old
 * one would not know the new schema — so it is replaced instead of reused.
 */
const globalForPrisma = globalThis as unknown as {
  __starlinkPrisma?: { client: PrismaClient; generated: typeof PrismaClient } | PrismaClient;
};

let cached: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (cached) return cached;

  const stored = globalForPrisma.__starlinkPrisma;
  if (process.env.NODE_ENV !== "production" && stored) {
    if ("generated" in stored && stored.generated === PrismaClient) {
      cached = stored.client;
      return cached;
    }
    // Built from an older `prisma generate`: release its connections and start over.
    const stale = "generated" in stored ? stored.client : stored;
    void stale.$disconnect().catch(() => {});
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  cached = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__starlinkPrisma = { client: cached, generated: PrismaClient };
  }
  return cached;
}

/** Use in admin routes where a database is genuinely required. */
export function requireDb(): PrismaClient {
  const client = getPrisma();
  if (!client) {
    throw new Error(
      "数据库未配置 / Database not configured: set DATABASE_URL in your environment, then run `pnpm db:deploy`."
    );
  }
  return client;
}

/** True when the database is configured AND answering. */
export async function isDatabaseReady(): Promise<boolean> {
  const client = getPrisma();
  if (!client) return false;
  try {
    await client.$queryRawUnsafe("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
