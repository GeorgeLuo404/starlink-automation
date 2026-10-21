"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { GalleryView } from "@/lib/data";
import { Lightbox } from "@/components/site/lightbox";
import { cn } from "@/lib/utils";

const fallback = (i: number) => `/media/gallery-${String((i % 9) + 1).padStart(2, "0")}.svg`;

/** Photo grid; clicking a tile opens it in the full-screen <Lightbox>. */
export function GalleryGrid({ items }: { items: GalleryView[] }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <button
            type="button"
            key={`${item.title}-${i}`}
            onClick={() => setIndex(i)}
            className={cn(
              "reveal group relative block overflow-hidden rounded-[calc(var(--radius)-0.25rem)] border border-border bg-card text-left",
              i % 7 === 0 && "col-span-2 row-span-2"
            )}
          >
            {/* Spacer sets the minimum height; the image fills whatever the grid row stretches to. */}
            <div className="aspect-4/3" />
            <Image
              src={item.url ?? fallback(i)}
              alt={item.title}
              fill
              sizes={i % 7 === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
            {item.mediaKind === "VIDEO" ? (
              <span className="absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur-sm">
                <Play className="size-3.5" />
              </span>
            ) : null}
            <div className="absolute inset-x-4 bottom-4">
              <p className="text-sm">{item.title}</p>
              {item.caption ? <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.caption}</p> : null}
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        items={items.map((item, i) => ({ src: item.url ?? fallback(i), title: item.title, caption: item.caption }))}
        index={index}
        onIndexChange={setIndex}
      />
    </>
  );
}
