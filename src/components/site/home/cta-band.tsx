import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localeHref } from "@/components/site/nav-items";
import { Magnetic, Reveal } from "@/components/motion";

export function HomeCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.cta;
  return (
    <section className="relative overflow-hidden border-t border-[#1b1f27] bg-ink-900">
      <div className="grid-blueprint absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 h-80 w-184 -translate-x-1/2 rounded-full bg-[#22e0ff]/8 blur-[110px]"
        aria-hidden="true"
      />
      <div className="container-x relative py-20 text-center md:py-28">
        <Reveal>
          <div className="mx-auto flex max-w-fit items-center gap-3">
            <span className="h-px w-8 bg-[#22e0ff]" />
            <span className="text-eyebrow text-[#22e0ff]">{t.eyebrow}</span>
            <span className="h-px w-8 bg-[#22e0ff]" />
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="text-display mx-auto mt-6 max-w-3xl text-3xl text-white sm:text-4xl lg:text-[3.25rem]">
            {t.title}
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">{t.desc}</p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Link href={localeHref(locale, "/contact")} className="btn btn-primary group h-12 px-7">
                {t.primary}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
            <Link href={localeHref(locale, "/downloads")} className="btn btn-ghost h-12 px-7">
              <Download className="size-4" />
              {t.secondary}
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="mt-7 font-mono text-[0.6875rem] tracking-wide text-[#5c6472]">{t.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
