import { NextResponse } from "next/server";
import { z } from "zod";
import { createInquiry } from "@/lib/data";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{6,20}$/;

const schema = z.object({
  name: z.string().trim().min(1).max(64),
  company: z.string().trim().max(128).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  email: z.string().trim().max(128).optional().or(z.literal("")),
  service: z.string().trim().max(128).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(4000),
  source: z.string().max(32).optional(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 422 });
  }

  const data = parsed.data;
  if (!data.phone && !data.email) {
    return NextResponse.json({ ok: false, error: "contact_required" }, { status: 422 });
  }
  if (data.phone && !PHONE_RE.test(data.phone)) {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 422 });
  }
  if (data.email && !EMAIL_RE.test(data.email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }

  const result = await createInquiry({
    name: data.name,
    company: data.company || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    service: data.service || undefined,
    message: data.message,
    source: data.source || "contact",
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "storage_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: result.stored });
}
