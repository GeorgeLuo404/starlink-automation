import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";
import { localeHref } from "./nav-items";

export type Crumb = { label: string; href?: string };

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs = [],
  locale,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  locale: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-[#1b1f27]", className)}>
      <div className="grid-blueprint absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="absolute -top-32 left-1/4 h-64 w-160 rounded-full bg-[#22e0ff]/7 blur-[100px]"
        aria-hidden="true"
      />
      <div className="container-x relative pt-36 pb-14 md:pt-44 md:pb-20">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-[#5c6472]">
          <Link href={localeHref(locale, "/")} className="transition-colors hover:text-muted-foreground">
            {locale === "zh" ? "首页" : "Home"}
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              <ChevronRight className="size-3" />
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-muted-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-muted-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {eyebrow ? (
          <Reveal delay={0.04}>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-8 bg-[#22e0ff]" />
              <span className="text-eyebrow text-[#22e0ff]">{eyebrow}</span>
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={0.08}>
          <h1 className="text-display mt-5 max-w-4xl text-[2.1rem] text-white sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h1>
        </Reveal>

        {description ? (
          <Reveal delay={0.14}>
            <p className="mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
          </Reveal>
        ) : null}

        {children}
      </div>
    </section>
  );
}
