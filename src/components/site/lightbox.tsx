"use client";

import { useCallback } from "react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import copy from "@/content/copy.json";

export type LightboxItem = { src: string; title: string; caption?: string | null };

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

/**
 * Full-screen photo viewer. A Radix Dialog (Escape, focus trap, scroll lock)
 * animated with motion, like the mobile menu; arrow keys step through the
 * photos. Open it by setting `index`, close by passing null.
 */
export function Lightbox({
  items,
  index,
  onIndexChange,
}: {
  items: LightboxItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}) {
  const current = index !== null ? items[index] : null;
  const many = items.length > 1;

  const step = useCallback(
    (by: number) => {
      if (index !== null) onIndexChange((index + by + items.length) % items.length);
    },
    [index, items.length, onIndexChange]
  );

  return (
    <Dialog.Root open={current !== null} onOpenChange={(next) => !next && onIndexChange(null)}>
      <AnimatePresence>
        {current ? (
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
                {many ? (
                  <Button variant="outline" size="icon" shape="pill" className="absolute left-4 z-10 size-11" onClick={() => step(-1)} aria-label={copy.gallery.prev}>
                    <ChevronLeft />
                  </Button>
                ) : null}

                <motion.figure
                  key={index}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-5xl"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden rounded-(--radius) border border-border">
                    <Image src={current.src} alt={current.title} fill sizes="90vw" className="object-contain" />
                  </div>
                  <figcaption className="mt-5 text-center">
                    <Dialog.Title className="text-base">{current.title}</Dialog.Title>
                    {current.caption ? <p className="mt-1 text-sm text-muted-foreground">{current.caption}</p> : null}
                    {many ? (
                      <p className="mt-3 text-xs text-muted-foreground tabular-nums">
                        {(index ?? 0) + 1} / {items.length}
                      </p>
                    ) : null}
                  </figcaption>
                </motion.figure>

                {many ? (
                  <Button variant="outline" size="icon" shape="pill" className="absolute right-4 z-10 size-11" onClick={() => step(1)} aria-label={copy.gallery.next}>
                    <ChevronRight />
                  </Button>
                ) : null}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
