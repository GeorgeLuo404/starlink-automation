import type { CaseContent } from "@/content/defaults";
import { coverSrc } from "@/lib/utils";
import { MediaTile } from "./media-tile";
import copy from "@/content/copy.json";

/**
 * A delivered project as an image tile: industry and title; the summary shows
 * on hover, the figures on the case page. `lead` is the wide, taller one.
 */
export function CaseCard({
  item,
  lead = false,
  size = lead ? "xl" : "lg",
  sizes = lead ? "100vw" : "(max-width: 768px) 100vw, 60vw",
  priority,
  className,
}: {
  item: CaseContent;
  lead?: boolean;
  size?: "md" | "lg" | "xl";
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <MediaTile
      href={`/cases/${item.slug}`}
      src={coverSrc("case", item)}
      alt={item.title}
      sizes={sizes}
      priority={priority}
      eyebrow={
        <span className="inline-flex h-7 items-center rounded-full border border-foreground/25 bg-background/30 px-3 text-xs backdrop-blur-sm">
          {item.industry}
        </span>
      }
      title={item.title}
      summary={item.summary}
      cta={copy.cases.view}
      size={size}
      className={className}
    />
  );
}
