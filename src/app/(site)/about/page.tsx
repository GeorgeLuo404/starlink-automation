import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/data";
import { getPageContent } from "@/lib/page-content";
import { Card } from "@/components/ui/card";
import { Counter } from "@/components/motion";
import { PageHero } from "@/components/site/page-hero";
import { Cover, Eyebrow, LinkNode, PillLink, SectionHead } from "@/components/site/kit";
import { CtaSection } from "@/components/site/cta-section";
import { StatGrid } from "@/components/site/stat-grid";
import copy from "@/content/copy.json";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const hero = await getPageContent("about.hero");
  return buildMetadata({ title: copy.about.title, description: hero.title, path: "/about" });
}

/** 关于我们 — every section's text comes from 后台 → 关于我们; the facts from 站点设置. */
export default async function AboutPage() {
  const t = copy.about;
  const [settings, hero, intro, stats, values, milestones, team, certifications] = await Promise.all([
    getSiteSettings(),
    getPageContent("about.hero"),
    getPageContent("about.intro"),
    getPageContent("about.stats"),
    getPageContent("about.values"),
    getPageContent("about.milestones"),
    getPageContent("about.team"),
    getPageContent("about.certifications"),
  ]);

  const facts = [
    { label: "公司名称", value: settings.companyName },
    { label: "成立年份", value: settings.founded },
    { label: copy.contact.address, value: settings.address },
    { label: copy.contact.emailLabel, value: settings.email },
  ];

  return (
    <>
      <PageHero eyebrow={t.title} title={hero.title} crumbs={[{ label: copy.nav.about }]} />

      {/* Intro + numbers ------------------------------------------------ */}
      <section className="theme-white section-y">
        <div className="container-x">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>{intro.title}</Eyebrow>
              <p className="reveal mt-8 text-xl leading-[1.9] lg:text-[1.375rem]">{intro.intro}</p>
              {intro.intro2 ? <p className="lead reveal mt-6">{intro.intro2}</p> : null}
              <div className="mt-10 flex flex-wrap gap-3">
                <PillLink href="/contact">
                  {copy.nav.cta}
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </PillLink>
                <PillLink href="/cases" variant="outline">
                  {copy.nav.cases}
                </PillLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Cover src={intro.image || "/media/factory.svg"} alt="作业现场" sizes="(max-width: 1024px) 100vw, 40vw" priority className="aspect-4/3 rounded-(--radius)" />
              <dl className="mt-6 divide-y divide-border border-y border-border">
                {facts.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="shrink-0 text-xs text-muted-foreground">{row.label}</dt>
                    <dd className="text-right text-sm">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <StatGrid items={stats.items} className="mt-14 sm:mt-20" />
        </div>
      </section>

      {/* Values ---------------------------------------------------------- */}
      <section className="theme-light section-y">
        <div className="container-x">
          <SectionHead eyebrow={t.title} title={values.title} />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {values.items.map((value, i) => (
              <Card key={i} className="reveal h-full p-8 lg:p-10">
                <span className="text-sm text-primary-text tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="title-3 mt-10">{value.title}</h3>
                <p className="mt-4 text-[0.9375rem] leading-7 text-muted-foreground">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones ------------------------------------------------------ */}
      <section className="theme-dark section-y">
        <div className="container-x">
          <SectionHead eyebrow={t.title} title={milestones.title} />
          <ol className="mt-16 grid gap-x-8 gap-y-12 border-t border-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {milestones.items.map((m, i) => (
              <li key={i} className="reveal relative pt-8">
                <span className="absolute -top-1.25 left-0 size-2.5 rounded-full border border-primary bg-background" aria-hidden="true" />
                <div className="text-sm text-primary-text tabular-nums">{m.year}</div>
                <h3 className="mt-3 text-base">{m.title}</h3>
                {m.desc ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{m.desc}</p> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team + certifications ------------------------------------------ */}
      <section className="theme-white section-y">
        <div className="container-x grid gap-16 lg:grid-cols-2">
          <div>
            <Eyebrow>{team.title}</Eyebrow>
            <div className="mt-10 grid grid-cols-2 gap-y-10 border-t border-border">
              {team.items.map((item, i) => (
                <div key={i} className={i % 2 ? "border-l border-border pt-8 pl-8" : "pt-8 pr-8"}>
                  <div className="text-5xl font-medium tracking-tight tabular-nums">
                    <Counter value={item.value} />
                    {item.suffix}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>{certifications.title}</Eyebrow>
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {certifications.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 py-5 text-base">
                  <LinkNode className="size-2.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
