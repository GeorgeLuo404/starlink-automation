import "server-only";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { requireDb } from "@/lib/prisma";

/**
 * Brute-force protection for the admin login.
 *
 * Failed attempts are counted per email and per client IP in the LoginAttempt
 * table — in PostgreSQL rather than in memory, because on Vercel consecutive
 * requests may run on different function instances. After LOCK_AFTER failures
 * a key is locked for a minute, doubling with every further failure up to
 * 15 minutes. A successful login deletes both keys; failures older than a day
 * are forgotten.
 *
 * An attempt is counted before its password is checked, with the rows locked
 * (SELECT … FOR UPDATE): parallel requests queue here one at a time, so a burst
 * cannot get more guesses through than the limit allows.
 */

const LOCK_AFTER = 5;
const FIRST_LOCK_MS = 60_000;
const MAX_LOCK_MS = 15 * 60_000;
const FORGET_AFTER_MS = 24 * 60 * 60_000;

type Row = { key: string; failures: number; lockedUntil: Date | null; lastFailureAt: Date };

/**
 * Count a login attempt against the email and the client IP. Returns null when
 * the attempt may go ahead; if either is locked, nothing is counted and the
 * time the lock ends is returned instead.
 */
export async function recordLoginAttempt(email: string): Promise<Date | null> {
  const keys = await keysFor(email);
  const db = requireDb();
  const now = new Date();
  const forgetBefore = new Date(now.getTime() - FORGET_AFTER_MS);

  // Housekeeping only: rows this old no longer count (see below).
  await db.loginAttempt.deleteMany({ where: { lastFailureAt: { lt: forgetBefore } } });

  return db.$transaction(async (tx) => {
    // Create the missing rows, then lock both — in key order, so two attempts cannot deadlock.
    await tx.loginAttempt.createMany({ data: keys.map((key) => ({ key, lastFailureAt: now })), skipDuplicates: true });
    const rows = await tx.$queryRaw<Row[]>`
      SELECT "key", "failures", "lockedUntil", "lastFailureAt" FROM "LoginAttempt"
      WHERE "key" IN (${Prisma.join(keys)}) ORDER BY "key" FOR UPDATE`;

    const lockedUntil = Math.max(0, ...rows.map((row) => row.lockedUntil?.getTime() ?? 0));
    if (lockedUntil > now.getTime()) {
      // Not counted: drop the rows just created for it.
      await tx.loginAttempt.deleteMany({ where: { key: { in: keys }, failures: 0 } });
      return new Date(lockedUntil);
    }

    for (const row of rows) {
      const failures = (row.lastFailureAt < forgetBefore ? 0 : row.failures) + 1;
      const lockMs = failures < LOCK_AFTER ? 0 : Math.min(FIRST_LOCK_MS * 2 ** (failures - LOCK_AFTER), MAX_LOCK_MS);
      await tx.loginAttempt.update({
        where: { key: row.key },
        data: { failures, lastFailureAt: now, lockedUntil: lockMs ? new Date(now.getTime() + lockMs) : null },
      });
    }
    return null;
  });
}

/** After a successful login: forget the failures counted against the email and the client IP. */
export async function clearLoginAttempts(email: string) {
  await requireDb().loginAttempt.deleteMany({ where: { key: { in: await keysFor(email) } } });
}

async function keysFor(email: string) {
  return [`email:${email}`, `ip:${await clientIp()}`];
}

/**
 * The client address reported by the proxy in front of the app. Vercel sets
 * both headers to the client. deploy/nginx.conf sets X-Real-IP to the
 * connecting address but appends it to whatever X-Forwarded-For the client
 * sent, so X-Real-IP is read first. Without a proxy (local `next start`),
 * Next.js fills in X-Forwarded-For from the socket.
 */
async function clientIp() {
  const list = await headers();
  const ip = (list.get("x-real-ip") ?? list.get("x-forwarded-for")?.split(",")[0] ?? "").trim();
  return isIP(ip) ? ip : "unknown";
}
