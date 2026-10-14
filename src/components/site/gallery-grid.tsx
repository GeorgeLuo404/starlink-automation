"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { GalleryView } from "@/lib/data";
import { cn } from "@/lib/utils";

export function GalleryGrid({ items, locale }: { items: GalleryView[]; locale: Locale }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % items.length)), [items.length]);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close, next, prev]);

  const current = index !== null ? items[index] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <motion.button
            type="button"
            key={`${item.title.zh}-${i}`}
            onClick={() => setIndex(i)}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "group relative block overflow-hidden rounded-(--radius) border border-border text-left",
              i % 7 === 0 ? "col-span-2 row-span-2" : ""
            )}
          >
            <div className={i % 7 === 0 ? "aspect-square" : "aspect-4/3"}>
              <Image
                src={item.url ?? `/media/gallery-${String((i % 9) + 1).padStart(2, "0")}.svg`}
                alt={item.title[locale]}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-background/92 via-transparent to-transparent opacity-75 transition-opacity group-hover:opacity-95" />
            {item.mediaKind === "VIDEO" ? (
              <span className="absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
                <Play className="size-3.5 text-white" />
              </span>
            ) : null}
            <div className="absolute inset-x-4 bottom-4">
              <p className="text-sm font-medium text-white">{item.title[locale]}</p>
              {item.caption[locale] ? (
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.caption[locale]}</p>
              ) : null}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && current ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-5 right-5 inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
              aria-label="Previous"
            >
              <ChevronLeft className="size-5" />
            </button>

            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative max-h-[82vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-16/10 w-full overflow-hidden rounded-(--radius) border border-border">
                <Image
                  src={current.url ?? `/media/gallery-${String(((index ?? 0) % 9) + 1).padStart(2, "0")}.svg`}
                  alt={current.title[locale]}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-base font-medium text-white">{current.title[locale]}</p>
                {current.caption[locale] ? (
                  <p className="mt-1 text-sm text-muted-foreground">{current.caption[locale]}</p>
                ) : null}
              </div>
            </motion.div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
              aria-label="Next"
            >
              <ChevronRight className="size-5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
