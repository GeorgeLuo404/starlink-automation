import type { ServiceContent } from "@/content/defaults";
import { coverSrc } from "@/lib/utils";
import { MediaTile } from "./media-tile";
import copy from "@/content/copy.json";

/** A service as an image tile: number and title; the summary shows on hover. */
export function ServiceCard({
  service,
  index,
  size = "lg",
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
}: {
  service: ServiceContent;
  index: number;
  size?: "md" | "lg";
  sizes?: string;
  className?: string;
}) {
  return (
    <MediaTile
      href={`/services/${service.slug}`}
      src={coverSrc("service", service)}
      alt={service.title}
      sizes={sizes}
      eyebrow={<span className="text-primary-text tabular-nums">{String(index + 1).padStart(2, "0")}</span>}
      title={service.title}
      summary={service.summary}
      cta={copy.common.viewDetail}
      size={size}
      className={className}
    />
  );
}
