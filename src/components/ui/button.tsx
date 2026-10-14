"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-(--radius) text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground font-semibold hover:bg-white",
        brand: "bg-primary text-primary-foreground font-semibold hover:bg-white",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary/60 hover:bg-primary/8",
        secondary: "bg-secondary text-foreground hover:bg-secondary-hover",
        ghost: "text-foreground hover:bg-white/5",
        destructive: "bg-destructive text-white hover:bg-destructive-hover",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-[0.9375rem]",
        icon: "size-10 p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

/** Minimal Slot so <Button asChild> keeps working without Radix. */
function Slot({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  if (!React.isValidElement(children)) return null;
  const child = children as React.ReactElement<Record<string, unknown>>;
  return React.cloneElement(child, {
    ...props,
    ...child.props,
    className: cn(props.className, (child.props as { className?: string }).className),
  });
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp: React.ElementType = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
