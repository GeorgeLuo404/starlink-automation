"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#0d0f13",
          border: "1px solid #1b1f27",
          color: "#e8ebf0",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
        },
      }}
    />
  );
}
