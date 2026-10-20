import { MARK_VIEWBOX, markShapes, polyPath } from "@/lib/brand-mark";
import { cn } from "@/lib/utils";

const UPPER = polyPath(markShapes.upper);
const LOWER = polyPath(markShapes.lower);
const STAR = polyPath(markShapes.star);

/**
 * 星链自动化品牌标识 / Starlink Automation brand mark — the isometric S
 * (src/lib/brand-mark.ts): upper half in the accent, lower half in the text
 * colour of the section, the star between them. Same shapes as the favicon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox={MARK_VIEWBOX} className={className} aria-hidden="true">
      <path d={UPPER} className="fill-primary" />
      <path d={LOWER} className="fill-foreground" />
      <path d={STAR} className="fill-primary" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "size-7", md: "size-9", lg: "size-12" };
  const title = { sm: "text-[0.9rem]", md: "text-[1.02rem]", lg: "text-xl" };
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn(dims[size], "shrink-0")} />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className={cn("font-semibold tracking-tight text-foreground", title[size])}>星链自动化</span>
          <span className="mt-1 font-mono text-[0.5rem] tracking-[0.28em] text-muted-foreground uppercase">
            Starlink Automation
          </span>
        </span>
      ) : null}
    </span>
  );
}
