import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { recordUpload } from "@/lib/data";
import { buildKey, isAllowedUpload, maxUploadBytes, putObject } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin file upload through the server — the path taken with the local storage
 * driver. With the s3 driver the browser uploads straight to the bucket instead
 * (see ./sign and ./complete). Auth is checked here because the admin proxy
 * only covers /admin pages, not route handlers.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_form" }, { status: 400 });
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "general").slice(0, 40);

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file_required" }, { status: 400 });
  }
  const maxBytes = maxUploadBytes();
  if (file.size > maxBytes) {
    return NextResponse.json({ ok: false, error: "file_too_large", maxBytes }, { status: 413 });
  }
  if (!isAllowedUpload(file.name, file.type)) {
    return NextResponse.json({ ok: false, error: "unsupported_type", type: file.type }, { status: 415 });
  }

  const key = buildKey(file.name || "upload", folder);
  const mimeType = file.type || "application/octet-stream";

  try {
    await putObject(key, Buffer.from(await file.arrayBuffer()), mimeType);
  } catch (error) {
    console.error("[upload] storage failed:", error);
    return NextResponse.json(
      { ok: false, error: "storage_failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }

  const asset = await recordUpload({ key, name: file.name || "upload", mimeType, size: file.size });
  return NextResponse.json({ ok: true, ...asset });
}
