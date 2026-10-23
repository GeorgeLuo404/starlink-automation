import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { buildKey, isAllowedUpload, maxUploadBytes, presignUpload, storageDriver } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.string().max(255),
  size: z.number().int().positive(),
  folder: z.string().max(40).default("general"),
});

/**
 * Step 1 of an admin upload: validate the file and say where to send it.
 *   · s3 driver    → { mode: "direct", key, url, headers }: PUT the file to the
 *                    presigned URL, then call ./complete
 *   · local driver → { mode: "form" }: POST it as multipart to /api/upload
 */
export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const { name, type, size, folder } = parsed.data;
  const maxBytes = maxUploadBytes();
  if (size > maxBytes) {
    return NextResponse.json({ ok: false, error: "file_too_large", maxBytes }, { status: 413 });
  }
  if (!isAllowedUpload(name, type)) {
    return NextResponse.json({ ok: false, error: "unsupported_type", type }, { status: 415 });
  }

  if (storageDriver() !== "s3") {
    return NextResponse.json({ ok: true, mode: "form" });
  }

  const key = buildKey(name, folder);
  try {
    const { url, headers } = await presignUpload(key, type, size);
    return NextResponse.json({ ok: true, mode: "direct", key, url, headers });
  } catch (error) {
    console.error("[upload] presign failed:", error);
    return NextResponse.json({ ok: false, error: "storage_failed" }, { status: 500 });
  }
}
