"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function NewsletterForm({ dict, className }: { dict: Dictionary; className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      /* the newsletter is best-effort — never block the visitor */
    }
    setStatus("done");
    setEmail("");
  }

  if (status === "done") {
    return (
      <p className={cn("flex items-center gap-2 text-sm text-[#35d07f]", className)}>
        <Check className="size-4" />
        {dict.footer.subscribeSuccess}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={cn("flex gap-2", className)}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={dict.footer.subscribePlaceholder}
        className="field h-10 flex-1"
        aria-label={dict.footer.subscribePlaceholder}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[#22e0ff] text-[#04141a] transition-colors hover:bg-white disabled:opacity-50"
        aria-label={dict.footer.subscribeButton}
      >
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
