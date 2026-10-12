import { NextResponse } from "next/server";
import { isDatabaseReady } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Container health probe.
 *
 * Always returns 200 while the process is serving — a database outage should
 * not cause the orchestrator to kill a perfectly healthy web container.
 * The database state is reported in the body instead.
 */
export async function GET() {
  const database = await isDatabaseReady();
  return NextResponse.json(
    { ok: true, database, uptime: Math.round(process.uptime()) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
