import { ArrowRight } from "lucide-react";
import { HeroConstellation } from "./hero-constellation";
import { getPageContent } from "@/lib/page-content";
import { Eyebrow, LinkNode, PillLink, highlight } from "../kit";

/**
 * 首屏 — headline and the 3D constellation robot cell. Text from 后台 → 首页 → 首屏.
 * Wide screens: the constellation fills the section and the copy sits over its
 * quiet left side. Narrow screens: it is a band above the copy that takes
 * whatever height the copy leaves, so the two never overlap and the scene needs
 * no scrim. Phones skip only the service list.
 */
export async function HomeHero() {
  const t = await getPageContent("home.hero");
  return (
    <section className="theme-dark relative isolate flex min-h-svh flex-col justify-end overflow-hidden pb-8 sm:pb-10 lg:pt-28">
      <div className="relative -z-10 min-h-48 flex-1 lg:absolute lg:inset-0" aria-hidden="true">
        <HeroConstellation />
      </div>

      <div className="container-x">
        <div className="max-w-4xl">
          <div className="intro">
            {/* Phones: no trailing rule, and a wrap falls between the two phrases, not inside one. */}
            <Eyebrow className="break-keep max-sm:[&>[data-slot=separator]]:hidden">
              {[t.eyebrow, t.badge].filter(Boolean).join(" · ")}
            </Eyebrow>
          </div>
          <h1 className="display intro mt-4 sm:mt-8" style={{ animationDelay: "80ms" }}>
            {t.titleTop}
            <br />
            {highlight(t.titleBottom, t.titleAccent, "text-primary")}
          </h1>
          <p className="lead intro mt-5 max-w-xl sm:mt-8" style={{ animationDelay: "200ms" }}>
            {t.subtitle}
          </p>
          <div className="intro mt-7 flex flex-wrap gap-3 sm:mt-10" style={{ animationDelay: "300ms" }}>
            <PillLink href="/contact">
              {t.ctaPrimary}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </PillLink>
            <PillLink href="/cases" variant="outline">
              {t.ctaSecondary}
            </PillLink>
          </div>
        </div>

        <div
          className="intro mt-20 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground max-sm:hidden"
          style={{ animationDelay: "420ms" }}
        >
          {t.ticker.map((item, i) => (
            <span key={i} className="flex items-center gap-6">
              {i ? <LinkNode className="size-2 opacity-70" /> : null}
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
