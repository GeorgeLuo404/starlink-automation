"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useScrolled } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { navItems, usePagePath, type NavService } from "./nav-items";
import { ServicesMenu } from "./services-menu";
import copy from "@/content/copy.json";

const menuLinks = [...navItems, { key: "contact" as const, href: "/contact" }];
const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export function SiteHeader({ services }: { services: NavService[] }) {
  const pathname = usePagePath();
  const scrolled = useScrolled(24);
  const [menuOpen, setMenuOpen] = useState(false);

  // The menu is phones/tablets only: close it if the window widens to desktop,
  // or it would stay open (scroll locked) behind the desktop nav.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const close = () => desktop.matches && setMenuOpen(false);
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "theme-dark fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300",
        // Phones keep a solid bar (no backdrop blur), so it stays legible even while the
        // page is still loading or busy; from lg it is clear over the hero until scrolled.
        scrolled
          ? "border-b border-border bg-background/95 lg:backdrop-blur-xl"
          : "border-b border-transparent bg-background lg:bg-transparent"
      )}
    >
      {/* Three columns (1fr · auto · 1fr) so the nav is centred on the page, whatever the logo and button widths. */}
      <div className="container-x flex h-18 items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label={copy.meta.siteName} className="justify-self-start">
          <Logo size="md" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label={copy.nav.menu}>
          {navItems.map((item) =>
            item.hasMenu ? (
              <ServicesMenu key={item.key} services={services} active={isActive(item.href)} />
            ) : (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative text-sm transition-colors hover:text-foreground",
                  isActive(item.href) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {copy.nav[item.key]}
                {isActive(item.href) ? (
                  <span
                    className="absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                ) : null}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <Button asChild variant="inverse" shape="pill" className="hidden sm:inline-flex">
            <Link href="/contact">{copy.nav.cta}</Link>
          </Button>

          {/* Phones / tablets: the live site's full-screen menu (fade in, links rise in turn), on a Radix
              Dialog for Escape, focus trapping and scroll lock. */}
          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Trigger asChild>
              <Button variant="outline" size="icon" shape="pill" className="lg:hidden" aria-label={copy.nav.menu}>
                <Menu />
              </Button>
            </Dialog.Trigger>
            <AnimatePresence>
              {menuOpen ? (
                <Dialog.Portal forceMount>
                  {/* The backdrop is the Overlay because that is where Radix locks page scroll. */}
                  <Dialog.Overlay forceMount asChild>
                    <motion.div
                      {...fade}
                      className="theme-dark fixed inset-0 z-70 bg-background/97 backdrop-blur-xl lg:hidden"
                    />
                  </Dialog.Overlay>
                  <Dialog.Content forceMount asChild aria-describedby={undefined}>
                    <motion.div
                      {...fade}
                      className="theme-dark fixed inset-0 z-70 flex flex-col overflow-y-auto lg:hidden"
                    >
                      {/* Same row as the header, so opening only swaps the menu icon for the close button. */}
                      <div className="container-x flex h-18 shrink-0 items-center justify-between">
                        <Dialog.Title asChild>
                          <span>
                            <Logo size="md" />
                          </span>
                        </Dialog.Title>
                        <Dialog.Close asChild>
                          <Button variant="outline" size="icon" shape="pill" aria-label={copy.nav.close}>
                            <X />
                          </Button>
                        </Dialog.Close>
                      </div>

                      <nav className="container-x mt-6 flex flex-col" aria-label={copy.nav.menu}>
                        {menuLinks.map((item, i) => (
                          <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.04 * i,
                              duration: 0.4,
                              ease,
                            }}
                          >
                            <Dialog.Close asChild>
                              <Link
                                href={item.href}
                                aria-current={isActive(item.href) ? "page" : undefined}
                                className="flex items-center justify-between border-b border-border py-4 text-lg"
                              >
                                <span className="flex items-center gap-3">
                                  {copy.nav[item.key]}
                                  {isActive(item.href) ? (
                                    <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                                  ) : null}
                                </span>
                                <ArrowUpRight className="size-4 text-muted-foreground" />
                              </Link>
                            </Dialog.Close>
                          </motion.div>
                        ))}
                      </nav>

                      {/* The button rises inside its padding, so it never pokes past the bottom edge and flashes a scrollbar. */}
                      <div className="container-x mt-auto pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.04 * menuLinks.length,
                            duration: 0.4,
                            ease,
                          }}
                        >
                          <Dialog.Close asChild>
                            <Button asChild size="lg" shape="pill" className="w-full">
                              <Link href="/contact">{copy.nav.cta}</Link>
                            </Button>
                          </Dialog.Close>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              ) : null}
            </AnimatePresence>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
