import { NextResponse } from "next/server";
import { incrementArticleViews } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fire-and-forget article view counter (called by <ViewCounter />). */
export async function POST(request: Request) {
  try {
    const { slug } = (await request.json()) as { slug?: string };
    if (!slug || typeof slug !== "string" || slug.length > 200) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await incrementArticleViews(slug);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
