"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { bilibiliEmbedUrl } from "@/lib/bilibili";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type PreviewItem = { kind: "IMAGE" | "VIDEO"; url: string; posterUrl?: string | null; caption?: string | null };

/** Display name for a stored file: the key's last segment without its random prefix. */
export function fileName(url: string) {
  const last = url.split(/[?#]/)[0].split("/").pop() || url;
  try {
    return decodeURIComponent(last).replace(/^[a-z0-9]{8}-/, "");
  } catch {
    return last;
  }
}

/**
 * Admin preview popup for uploaded images and videos (and B站 links): the
 * full image uncropped, or the video playing. Open it by setting `index`;
 * ← → step through `items`.
 */
export function MediaPreview({
  items,
  index,
  onIndexChange,
}: {
  items: PreviewItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}) {
  const item = index !== null ? items[index] : null;
  const many = items.length > 1;
  const step = (by: number) => {
    if (index !== null) onIndexChange((index + by + items.length) % items.length);
  };
  const embed = item?.kind === "VIDEO" ? bilibiliEmbedUrl(item.url) : null;

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-5xl gap-0 overflow-hidden"
        onKeyDown={(e) => {
          if (!many || e.target instanceof HTMLInputElement) return;
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {item ? (
          <>
            <DialogHeader>
              <DialogTitle className="truncate font-mono text-sm font-normal">{embed ? item.url : fileName(item.url)}</DialogTitle>
              {item.caption ? <p className="text-sm text-muted-foreground">{item.caption}</p> : null}
            </DialogHeader>

            <div className="relative flex min-h-48 items-center justify-center bg-background">
              {item.kind === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={item.url} src={item.url} alt={item.caption ?? ""} className="max-h-[70dvh] max-w-full object-contain" />
              ) : embed ? (
                <iframe
                  key={item.url}
                  src={embed}
                  title={item.caption || "B站 视频"}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full border-0"
                />
              ) : (
                <video
                  key={item.url}
                  src={item.url}
                  poster={item.posterUrl ?? undefined}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[70dvh] w-full"
                />
              )}
              {many ? (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    shape="pill"
                    onClick={() => step(-1)}
                    aria-label="上一项"
                    className="absolute left-3 bg-background/80 backdrop-blur-sm"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    shape="pill"
                    onClick={() => step(1)}
                    aria-label="下一项"
                    className="absolute right-3 bg-background/80 backdrop-blur-sm"
                  >
                    <ChevronRight />
                  </Button>
                </>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground">
              <span className="font-mono tabular-nums">
                {many ? `${String((index ?? 0) + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}` : null}
              </span>
              <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">
                <ExternalLink className="size-3.5" />
                在新标签页打开
              </a>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
