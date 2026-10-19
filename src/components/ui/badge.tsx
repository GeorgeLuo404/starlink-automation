import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border font-medium whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-primary",
        outline: "border-border text-muted-foreground",
        /** Neutral tag in the text colour — industry labels, deliverables. */
        tag: "border-border font-normal text-foreground",
        solid: "border-transparent bg-secondary text-body",
        signal: "border-signal/30 bg-signal/10 text-signal",
        success: "border-success/30 bg-success/10 text-success",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
      },
      size: {
        default: "px-2.5 py-0.5 text-[0.6875rem]",
        md: "px-3 py-1 text-xs",
        lg: "px-3.5 py-1.5 text-[0.8125rem]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
