import { ArrowRight } from "lucide-react";
import { HeroConstellation } from "./hero-constellation";
import { Eyebrow, LinkNode, PillLink } from "../kit";
import copy from "@/content/copy.json";

/** 首屏 — headline over the 3D constellation robot cell. */
export function HomeHero() {
  const t = copy.home.hero;
  return (
    <section className="theme-dark relative isolate flex min-h-svh flex-col justify-end overflow-hidden pt-28 pb-10">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <HeroConstellation />
      </div>

      <div className="container-x">
        <div className="max-w-4xl">
          <div className="intro">
            <Eyebrow>
              {t.eyebrow} · {t.badge}
            </Eyebrow>
          </div>
          <h1 className="display intro mt-8" style={{ animationDelay: "80ms" }}>
            {t.titleTop}，
            <br />
            <span className="text-primary">{t.titleBottom.slice(0, 2)}</span>
            {t.titleBottom.slice(2)}
          </h1>
          <p className="lead intro mt-8 max-w-xl" style={{ animationDelay: "200ms" }}>
            {t.subtitle}
          </p>
          <div className="intro mt-10 flex flex-wrap gap-3" style={{ animationDelay: "300ms" }}>
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
          className="intro mt-20 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground"
          style={{ animationDelay: "420ms" }}
        >
          {t.ticker.map((item, i) => (
            <span key={item} className="flex items-center gap-6">
              {i ? <LinkNode className="size-2 opacity-70" /> : null}
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
