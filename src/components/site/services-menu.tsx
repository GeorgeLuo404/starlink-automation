"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { coverSrc, cn } from "@/lib/utils";
import { LinkNode } from "./kit";
import type { NavService } from "./nav-items";
import copy from "@/content/copy.json";

/**
 * 业务能力 in the desktop nav, with its dropdown: each service with its cover
 * thumbnail, plus a tile to the overview page. Opens on hover (with a short
 * close delay, so moving the pointer down into the panel never drops it) and on
 * keyboard focus; Escape closes it and returns focus to the link.
 */
export function ServicesMenu({ services, active }: { services: NavService[]; active: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  // Escape hands focus back to the link; that focus must not reopen the panel.
  const skipFocusOpen = useRef(false);

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = (delay = 120) => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), delay);
  };

  // Close after navigating (the header stays mounted between pages).
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={() => hide()}
      onFocus={() => {
        if (skipFocusOpen.current) skipFocusOpen.current = false;
        else show();
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide(0);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          window.clearTimeout(closeTimer.current);
          setOpen(false);
          skipFocusOpen.current = document.activeElement !== triggerRef.current;
          triggerRef.current?.focus();
        }
      }}
    >
      <Link
        ref={triggerRef}
        href="/services"
        aria-current={active ? "page" : undefined}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "relative inline-flex items-center gap-1 text-sm transition-colors hover:text-foreground",
          active || open ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {copy.nav.services}
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
        {active ? (
          <span className="absolute -bottom-2 left-[calc(50%-0.5rem)] size-1 -translate-x-1/2 rounded-full bg-primary" aria-hidden="true" />
        ) : null}
      </Link>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            // pt bridges the gap to the link, so the pointer can travel into the panel.
            className="absolute top-full left-1/2 w-176 -translate-x-1/2 pt-7"
          >
            <div className="theme-dark rounded-[1.25rem] border border-border bg-background/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <ul className="grid grid-cols-2 gap-1">
                {services.map((service, i) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === `/services/${service.slug}` ? "page" : undefined}
                      className="group flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-foreground/5 aria-[current=page]:bg-foreground/5"
                    >
                      <span className="relative aspect-16/10 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                        <Image src={coverSrc("service", service)} alt="" fill sizes="96px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                          <span className="text-sm text-foreground">{service.title}</span>
                        </span>
                        <span className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{service.summary}</span>
                      </span>
                      <ArrowUpRight className="mr-1 size-4 shrink-0 text-primary-text opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
                {/* Fills the grid's last cell (or a whole row when the count is even). */}
                <li className={cn(services.length % 2 === 0 && "col-span-2")}>
                  <Link
                    href="/services"
                    onClick={() => setOpen(false)}
                    className="group flex h-full min-h-17 items-center justify-between gap-4 rounded-xl border border-dashed border-border px-5 transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span className="flex items-center gap-3 text-sm">
                      <LinkNode />
                      {copy.home.services.cta}
                    </span>
                    <ArrowUpRight className="size-4 text-primary-text transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
