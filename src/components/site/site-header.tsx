"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { services } from "@/content/defaults";
import { Logo } from "./logo";
import { navItems } from "./nav-items";
import { useScrolled } from "@/components/motion";
import copy from "@/content/copy.json";

export function SiteHeader() {
  const pathname = usePathname() ?? "";
  const scrolled = useScrolled(20);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border bg-background/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="container-x flex h-16 items-center justify-between gap-6 md:h-20 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="shrink-0 justify-self-start" aria-label={copy.meta.siteName}>
            <Logo size="md" />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label={copy.nav.menu}>
            {navItems.map((item) =>
              item.hasMenu ? (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-3 py-2 text-sm transition-colors",
                      isActive(item.href) ? "text-white" : "text-muted-foreground hover:text-white"
                    )}
                  >
                    {copy.nav[item.key]}
                    <ChevronDown
                      className={cn("size-3.5 transition-transform", servicesOpen && "rotate-180")}
                    />
                  </Link>
                  <AnimatePresence>
                    {servicesOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-1/2 w-136 -translate-x-1/2 pt-2"
                      >
                        <div className="grid grid-cols-2 gap-1 rounded-(--radius) border border-border bg-surface/97 p-2 backdrop-blur-xl">
                          {services.map((service) => (
                            <Link
                              key={service.slug}
                              href={`/services/${service.slug}`}
                              className="group flex flex-col gap-1 rounded p-3 transition-colors hover:bg-white/4"
                            >
                              <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                                {service.title}
                                <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                              </span>
                              <span className="line-clamp-1 text-xs text-muted-foreground">
                                {service.summary}
                              </span>
                            </Link>
                          ))}
                          <Link
                            href="/services"
                            className="col-span-2 mt-1 rounded border border-dashed border-border p-2.5 text-center text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            {copy.home.services.cta} →
                          </Link>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "relative rounded px-3 py-2 text-sm transition-colors",
                    isActive(item.href) ? "text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {copy.nav[item.key]}
                  {isActive(item.href) ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-0.5 h-px bg-primary"
                    />
                  ) : null}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <Link href="/contact" className="btn btn-primary hidden h-9 px-4 text-xs lg:inline-flex">
              {copy.nav.cta}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded border border-border text-foreground lg:hidden"
              aria-label={copy.nav.menu}
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-70 bg-background/97 backdrop-blur-xl lg:hidden"
          >
            <div className="container-x flex h-16 items-center justify-between">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded border border-border"
                aria-label={copy.nav.close}
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="container-x mt-6 flex flex-col" aria-label={copy.nav.menu}>
              {[{ key: "home" as const, href: "/" }, ...navItems.slice(1), { key: "contact" as const, href: "/contact" }].map(
                (item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between border-b border-border py-4 text-lg text-white"
                    >
                      {copy.nav[item.key]}
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    </Link>
                  </motion.div>
                )
              )}
              <div className="mt-6 flex justify-end">
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-primary h-9 px-4 text-xs"
                >
                  {copy.nav.cta}
                </Link>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
