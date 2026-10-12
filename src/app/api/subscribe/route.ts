import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/data";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
    }
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
