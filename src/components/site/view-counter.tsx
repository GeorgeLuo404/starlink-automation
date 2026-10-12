"use client";

import { useEffect } from "react";

/**
 * Records one article view after the page is interactive.
 *
 * Article pages are statically generated, so the counter cannot be incremented
 * during render (that would only run at build/revalidate time). A tiny client
 * beacon gives accurate per-visit counts without making the page dynamic.
 */
export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        signal: controller.signal,
        keepalive: true,
      }).catch(() => {
        /* analytics must never surface an error to the reader */
      });
    }, 1200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [slug]);

  return null;
}
