import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { recordUpload } from "@/lib/data";
import { isValidKey, statObject } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  key: z.string().max(400),
  name: z.string().trim().min(1).max(255),
});

/**
 * Step 2 of a direct upload: confirm the object reached the bucket, then index
 * it in the media library. Size and type are read back from storage rather
 * than trusted from the browser.
 */
export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isValidKey(parsed.data.key)) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const { key, name } = parsed.data;
  const object = await statObject(key);
  if (!object) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const asset = await recordUpload({
    key,
    name,
    mimeType: object.contentType || "application/octet-stream",
    size: object.size,
  });
  return NextResponse.json({ ok: true, ...asset });
}
