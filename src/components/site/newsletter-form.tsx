"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import copy from "@/content/copy.json";

export function NewsletterForm({ className }: { className?: string }) {
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
      <p className={cn("flex items-center gap-2 text-sm text-success", className)}>
        <Check className="size-4" />
        {copy.footer.subscribeSuccess}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={cn("flex gap-2", className)}>
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={copy.footer.subscribePlaceholder}
        className="rounded-full px-5"
        aria-label={copy.footer.subscribePlaceholder}
      />
      <Button type="submit" size="icon" shape="pill" disabled={status === "loading"} className="size-11" aria-label={copy.footer.subscribeButton}>
        <ArrowRight />
      </Button>
    </form>
  );
}
