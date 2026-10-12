/**
 * Minimal PDF writer for placeholder documents.
 *
 * The demo content ships without real PDF files, so `/api/download/[slug]`
 * generates a valid one-page document on the fly. Replace it with your real
 * assets by uploading them in the admin → 资料下载 section.
 *
 * The writer produces ASCII-only pages (base-14 Helvetica has no CJK glyphs);
 * callers should pass a transliterated or English title.
 */

function escapePdfText(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

export function buildPlaceholderPdf({
  title,
  subtitle,
  lines = [],
  brand = "STARLINK AUTOMATION",
}: {
  title: string;
  subtitle?: string;
  lines?: string[];
  brand?: string;
}): Buffer {
  const content: string[] = [];
  const push = (text: string, size: number, x: number, y: number, gray = 0) => {
    content.push(
      `BT /${gray === 0 ? "F1" : "F1"} ${size} Tf ${gray} g ${x} ${y} Td (${escapePdfText(text)}) Tj ET`
    );
  };

  // Header band
  content.push("0.043 0.055 0.067 rg 0 762 595 80 re f");
  push(brand, 9, 48, 812, 1);
  push("SHENZHEN STARLINK AUTOMATION CO., LTD.", 7, 48, 796, 1);

  // Title
  push(title.slice(0, 58), 19, 48, 706, 0);
  if (subtitle) push(subtitle.slice(0, 86), 10, 48, 684, 0.42);

  content.push("0.85 0.85 0.85 rg 48 668 499 1 re f");

  // Body
  let y = 636;
  for (const line of lines.slice(0, 22)) {
    push(line.slice(0, 96), 10, 48, y, 0.2);
    y -= 17;
  }

  content.push("0.85 0.85 0.85 rg 48 96 499 1 re f");
  push("This is a generated placeholder document.", 8, 48, 78, 0.55);
  push("Replace it in Admin > Downloads with your real file.", 8, 48, 64, 0.55);

  const stream = content.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}
