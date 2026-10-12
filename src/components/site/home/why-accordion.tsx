"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { whyItems } from "@/content/defaults";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/utils";

export function HomeWhy({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState<string | null>(whyItems[0]?.no ?? null);
  const t = dict.home.why;

  return (
    <section className="section-y relative">
      <div className="container-x">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} />

        <div className="mt-14 border-t border-[#1b1f27]">
          {whyItems.map((item) => {
            const isOpen = open === item.no;
            return (
              <div key={item.no} className="border-b border-[#1b1f27]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.no)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center gap-6 py-6 text-left lg:py-7"
                >
                  <span
                    className={cn(
                      "font-mono text-xs tracking-widest transition-colors",
                      isOpen ? "text-[#22e0ff]" : "text-[#3d4552] group-hover:text-[#8a929e]"
                    )}
                  >
                    {item.no}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-lg font-medium tracking-tight transition-colors lg:text-xl",
                      isOpen ? "text-white" : "text-[#c3c9d4] group-hover:text-white"
                    )}
                  >
                    {item.title[locale]}
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isOpen ? "border-[#22e0ff]/50 text-[#22e0ff]" : "border-[#1b1f27] text-[#8a929e]"
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
                      <p className="max-w-3xl pb-7 pl-11 text-[0.9375rem] leading-relaxed text-[#8a929e] lg:pl-12">
                        {item.desc[locale]}
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
