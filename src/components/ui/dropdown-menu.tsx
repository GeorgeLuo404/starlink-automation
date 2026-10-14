"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function DropdownMenu({
  trigger,
  children,
  align = "end",
  className,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = React.useCallback(() => setOpen(false), []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-2 min-w-44 overflow-hidden rounded-(--radius) border border-border bg-card p-1 shadow-2xl",
            align === "end" ? "right-0" : "left-0",
            className
          )}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-sm text-body transition-colors hover:bg-white/5 hover:text-white",
        className
      )}
      {...props}
    />
  );
}
