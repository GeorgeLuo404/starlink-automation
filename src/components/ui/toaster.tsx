"use client";

import type { CSSProperties } from "react";
import { Toaster as SonnerToaster } from "sonner";

/**
 * Sonner exposes its own theming variables, so toasts can be driven by the same
 * semantic tokens as the rest of the site — no duplicated colour literals.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
    />
  );
}
