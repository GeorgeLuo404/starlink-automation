import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A brand's logo, drawn single-colour (white, for dark sections) so a dozen
 * brand palettes don't fight the page's own. Without a logo the name is set
 * in type instead. Hover styles key off a parent `group`. Shared by the
 * homepage row and the admin brand list.
 */
export function BrandMark({ name, logoUrl, className }: { name: string; logoUrl?: string | null; className?: string }) {
  if (!logoUrl) {
    return (
      <span
        className={cn(
          "flex h-10 items-center text-2xl font-medium tracking-tight whitespace-nowrap text-muted-foreground transition-colors group-hover:text-foreground",
          className
        )}
      >
        {name}
      </span>
    );
  }
  return (
    <span className={cn("relative block h-10 w-40", className)}>
      <Image
        src={logoUrl}
        alt={name}
        fill
        sizes="160px"
        // Small marks, mostly SVG: serve them as uploaded. This also accepts a
        // logo on any host, not only the image optimiser's allow-list.
        unoptimized
        className="object-contain opacity-60 brightness-0 invert transition-opacity group-hover:opacity-100"
      />
    </span>
  );
}
