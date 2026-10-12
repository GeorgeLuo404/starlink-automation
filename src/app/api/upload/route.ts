import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { buildKey, isAllowedType, mediaKindOf, publicUrlFor, putObject } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = Number(process.env.MAX_UPLOAD_MB ?? 200) * 1024 * 1024;

/**
 * Admin file upload.
 *
 * Writes to the configured storage driver (local disk or S3/OSS) and records
 * the asset in the media library. Auth is enforced here as well as in the
 * proxy, because route handlers are reachable directly.
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
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "file_too_large", maxBytes: MAX_BYTES },
      { status: 413 }
    );
  }
  if (!isAllowedType(file.type)) {
    return NextResponse.json({ ok: false, error: "unsupported_type", type: file.type }, { status: 415 });
  }

  const key = buildKey(file.name || "upload", folder);
  const buffer = Buffer.from(await file.arrayBuffer());

  let url: string;
  try {
    ({ url } = await putObject(key, buffer, file.type || "application/octet-stream"));
  } catch (error) {
    console.error("[upload] storage failed:", error);
    return NextResponse.json(
      { ok: false, error: "storage_failed", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }

  const kind = mediaKindOf(file.type);
  const db = getPrisma();

  let assetId: string | null = null;
  if (db) {
    try {
      const asset = await db.mediaAsset.create({
        data: {
          filename: key.split("/").pop() ?? key,
          originalName: file.name || "upload",
          mimeType: file.type || "application/octet-stream",
          kind,
          size: file.size,
          url,
          storageKey: key,
          folder: folder || "general",
        },
      });
      assetId = asset.id;
    } catch (error) {
      // The file is on disk; failing to index it should not fail the upload.
      console.error("[upload] could not index asset:", error);
    }
  }

  return NextResponse.json({
    ok: true,
    id: assetId,
    key,
    url,
    kind,
    size: file.size,
    name: file.name,
    fallbackUrl: publicUrlFor(key),
  });
}
