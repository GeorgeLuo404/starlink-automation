import { NextResponse } from "next/server";
import { z } from "zod";
import { createInquiry } from "@/lib/data";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Same bound as the contact form's email field.
const schema = z.object({ email: z.string().trim().max(128).regex(EMAIL_RE) });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
    }
    const { email } = parsed.data;
    // Newsletter subscriptions are stored as inquiries so the admin has a single
    // place to review every inbound contact.
    await createInquiry({
      name: email.split("@")[0] || "newsletter",
      email,
      message: `Newsletter subscription: ${email}`,
      source: "newsletter",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
