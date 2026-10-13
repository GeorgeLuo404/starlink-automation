"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Switch({
  className,
  checked,
  onCheckedChange,
  disabled,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-[#22e0ff] bg-[#22e0ff]" : "border-[#1b1f27] bg-secondary",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[1.15rem]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export { Switch };
