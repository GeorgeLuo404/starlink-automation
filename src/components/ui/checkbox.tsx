"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
        className
      )}
      {...props}
    >
      {checked ? <Check className="size-3" strokeWidth={3} /> : null}
    </button>
  );
}

export { Checkbox };
