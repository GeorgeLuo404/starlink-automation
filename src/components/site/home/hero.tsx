import { ArrowRight } from "lucide-react";
import { HeroConstellation } from "./hero-constellation";
import { getPageContent } from "@/lib/page-content";
import { Eyebrow, LinkNode, PillLink, highlight } from "../kit";

/**
 * 首屏 — headline over the 3D constellation robot cell. Text from 后台 → 首页 → 首屏.
 * On phones the constellation sits in the upper half, so the text below it is cut
 * to headline, one paragraph and the two buttons (no eyebrow, no service list).
 */
export async function HomeHero() {
  const t = await getPageContent("home.hero");
  return (
    <section className="theme-dark relative isolate flex min-h-svh flex-col justify-end overflow-hidden pt-28 pb-8 sm:pb-10">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <HeroConstellation />
      </div>

      <div className="container-x">
        <div className="max-w-4xl">
          <div className="intro max-sm:hidden">
            <Eyebrow>{[t.eyebrow, t.badge].filter(Boolean).join(" · ")}</Eyebrow>
          </div>
          <h1 className="display intro sm:mt-8" style={{ animationDelay: "80ms" }}>
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
