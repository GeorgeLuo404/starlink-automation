import { NextResponse } from "next/server";
import { getObject } from "@/lib/storage";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/**
 * Streams a stored object back to the client.
 *
 * The local driver writes into ./public/uploads (served statically), so this
 * route mainly exists for the S3/OSS driver and for forcing downloads with a
 * proper Content-Disposition header.
 */
export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.map(decodeURIComponent).join("/");

  // Prevent path traversal at the edge of the storage boundary.
  if (objectKey.includes("..")) {
    return NextResponse.json({ ok: false, error: "invalid_key" }, { status: 400 });
  }

  const object = await getObject(objectKey);
  if (!object) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const extension = objectKey.slice(objectKey.lastIndexOf(".")).toLowerCase();
  const contentType = object.contentType || MIME[extension] || "application/octet-stream";
  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";

  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  if (download) {
    headers.set("Content-Disposition", `attachment; filename="${objectKey.split("/").pop()}"`);
  }

  return new NextResponse(new Uint8Array(object.body), { headers });
}
