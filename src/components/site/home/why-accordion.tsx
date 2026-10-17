"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { whyItems } from "@/content/defaults";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/utils";
import copy from "@/content/copy.json";

export function HomeWhy() {
  const [open, setOpen] = useState<string | null>(whyItems[0]?.no ?? null);
  const t = copy.home.why;

  return (
    <section className="section-y relative">
      <div className="container-x">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} />

        <div className="mt-14 border-t border-border">
          {whyItems.map((item) => {
            const isOpen = open === item.no;
            return (
              <div key={item.no} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.no)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center gap-6 py-6 text-left lg:py-7"
                >
                  <span
                    className={cn(
                      "font-mono text-xs tracking-widest transition-colors",
                      isOpen ? "text-primary" : "text-ghost group-hover:text-muted-foreground"
                    )}
                  >
                    {item.no}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-lg font-medium tracking-tight transition-colors lg:text-xl",
                      isOpen ? "text-white" : "text-body group-hover:text-white"
                    )}
                  >
                    {item.title}
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isOpen ? "border-primary/50 text-primary" : "border-border text-muted-foreground"
                    )}
                  >
                    {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-3xl pb-7 pl-11 text-[0.9375rem] leading-relaxed text-muted-foreground lg:pl-12">
                        {item.desc}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
