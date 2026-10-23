import { NextResponse } from "next/server";
import { getDownload, incrementDownloadCount } from "@/lib/data";
import { buildPlaceholderPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Download endpoint.
 *
 * Increments the counter and either redirects to the uploaded asset (OSS / CDN)
 * or — when no file has been uploaded yet — streams a generated placeholder PDF
 * so the download button always does something useful.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDownload(slug);
  if (!item) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  await incrementDownloadCount(slug);

  // "#" is the legacy "no file yet" marker; relative paths (local storage driver)
  // must be resolved against the request because redirects need absolute URLs.
  if (item.fileUrl && item.fileUrl !== "#") {
    return NextResponse.redirect(new URL(item.fileUrl, request.url), 302);
  }

  const pdf = buildPlaceholderPdf({
    // Base-14 Helvetica has no CJK glyphs, so the placeholder is titled by its slug.
    title: slug,
    subtitle: item.version ? `Version ${item.version}` : undefined,
    lines: [
      "File type:  " + item.fileType,
      "Version:    " + (item.version || "-"),
      "",
      "This placeholder was generated because no file has been uploaded yet.",
      "Upload the real document in the admin area: /admin/downloads",
    ].filter(Boolean),
  });

  const filename = `${slug}-${item.version || "v1"}.pdf`;
  // Header values must be Latin-1 and slugs may be Chinese: send an ASCII
  // fallback plus the real name in RFC 5987 form.
  const asciiName = filename.replace(/[^\x20-\x7e]|["\\]/g, "_");

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
