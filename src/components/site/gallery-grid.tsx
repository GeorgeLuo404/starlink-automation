"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { GalleryView } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import copy from "@/content/copy.json";

const fallback = (i: number) => `/media/gallery-${String((i % 9) + 1).padStart(2, "0")}.svg`;
const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

/**
 * Photo grid with a lightbox. The lightbox is a Radix Dialog (Escape, focus
 * trap, scroll lock) animated with motion, like the mobile menu; arrow keys
 * step through the photos.
 */
export function GalleryGrid({ items }: { items: GalleryView[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const current = index !== null ? items[index] : null;

  const step = useCallback(
    (by: number) => setIndex((i) => (i === null ? i : (i + by + items.length) % items.length)),
    [items.length]
  );

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

      <Dialog.Root open={open} onOpenChange={(next) => !next && setIndex(null)}>
        <AnimatePresence>
          {open && current ? (
            <Dialog.Portal forceMount>
              <Dialog.Overlay forceMount asChild>
                <motion.div {...fade} className="theme-dark fixed inset-0 z-100 bg-background/94 backdrop-blur-md" />
              </Dialog.Overlay>
              <Dialog.Content
                forceMount
                asChild
                aria-describedby={undefined}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") step(1);
                  if (e.key === "ArrowLeft") step(-1);
                }}
              >
                <motion.div {...fade} className="theme-dark fixed inset-0 z-100 flex items-center justify-center bg-transparent p-4 md:p-10">
                  <Dialog.Close asChild>
                    <Button variant="outline" size="icon" shape="pill" className="absolute top-5 right-5" aria-label={copy.gallery.close}>
                      <X />
                    </Button>
                  </Dialog.Close>
                  <Button variant="outline" size="icon" shape="pill" className="absolute left-4 z-10 size-11" onClick={() => step(-1)} aria-label={copy.gallery.prev}>
                    <ChevronLeft />
                  </Button>

                  <motion.figure
                    key={index}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-5xl"
                  >
                    <div className="relative aspect-16/10 w-full overflow-hidden rounded-(--radius) border border-border">
                      <Image src={current.url ?? fallback(index ?? 0)} alt={current.title} fill sizes="90vw" className="object-contain" />
                    </div>
                    <figcaption className="mt-5 text-center">
                      <Dialog.Title className="text-base">{current.title}</Dialog.Title>
                      {current.caption ? <p className="mt-1 text-sm text-muted-foreground">{current.caption}</p> : null}
                      <p className="mt-3 text-xs text-muted-foreground tabular-nums">
                        {(index ?? 0) + 1} / {items.length}
                      </p>
                    </figcaption>
                  </motion.figure>

                  <Button variant="outline" size="icon" shape="pill" className="absolute right-4 z-10 size-11" onClick={() => step(1)} aria-label={copy.gallery.next}>
                    <ChevronRight />
                  </Button>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
