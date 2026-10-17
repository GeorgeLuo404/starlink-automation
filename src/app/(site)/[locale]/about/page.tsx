import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Quote } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { aboutValues, certifications, company, milestones, teamComposition } from "@/content/defaults";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { localeHref } from "@/components/site/nav-items";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 300;

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.about.title, description: dict.about.lead, path: "/about" });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.about;
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        locale={locale}
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.lead}
        crumbs={[{ label: dict.nav.about }]}
      />

      {/* Stats ---------------------------------------------------------- */}
      <section className="border-b border-border bg-surface">
        <div className="container-x grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {t.stats.map((item) => (
            <div key={item.label} className="border-l border-border pl-6">
              <div className="text-display text-4xl text-white tabular-nums">
                <Counter value={item.value} />
                <span className="text-primary">{item.suffix}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Intro ---------------------------------------------------------- */}
      <section className="section-y">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <span className="text-eyebrow text-primary">{t.introTitle}</span>
            </div>
            <Reveal delay={0.06}>
              <p className="mt-8 text-[1.0625rem] leading-[1.85] text-body">{t.intro}</p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 text-[1.0625rem] leading-[1.85] text-muted-foreground">{t.intro2}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href={localeHref(locale, "/contact")} className="btn btn-primary">
                  {dict.nav.cta}
                  <ArrowRight className="size-4" />
                </Link>
                <Link href={localeHref(locale, "/cases")} className="btn btn-ghost">
                  {dict.nav.cases}
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-4/3 overflow-hidden rounded-(--radius) border border-border">
              <Image
                src="/media/factory.svg"
                alt={locale === "zh" ? "作业现场" : "On the shop floor"}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>

            <div className="card-industrial mt-6 divide-y divide-border">
              {[
                { label: locale === "zh" ? "公司名称" : "Company", value: locale === "zh" ? company.nameZh : company.nameEn },
                { label: locale === "zh" ? "成立年份" : "Founded", value: String(company.founded) },
                { label: dict.contact.address, value: settings.address[locale] },
                { label: locale === "zh" ? "邮箱" : "Email", value: settings.email },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-6 p-5">
                  <span className="font-mono text-[0.625rem] tracking-[0.14em] text-faint uppercase">
                    {row.label}
                  </span>
                  <span className="text-right text-sm text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values --------------------------------------------------------- */}
      <section className="section-y border-y border-border bg-surface">
        <div className="container-x">
          <SectionHeading eyebrow={t.eyebrow} title={t.valuesTitle} />
          <Stagger className="mt-14 grid gap-4 md:grid-cols-3" gap={0.1}>
            {aboutValues.map((value, i) => (
              <StaggerItem key={value.title.zh} className="h-full">
                <div className="card-industrial h-full p-7">
                  <Quote className="size-5 text-primary" strokeWidth={1.5} />
                  <h3 className="mt-6 text-lg font-semibold text-white">{value.title[locale]}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.desc[locale]}</p>
                  <span className="mt-6 block font-mono text-[0.625rem] tracking-[0.2em] text-ghost">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Milestones ----------------------------------------------------- */}
      <section className="section-y">
        <div className="container-x">
          <SectionHeading eyebrow={t.eyebrow} title={t.milestonesTitle} />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {milestones.map((milestone, i) => (
              <Reveal key={milestone.year} delay={i * 0.05}>
                <div className="border-t border-border pt-6">
                  <div className="font-mono text-sm tracking-[0.2em] text-primary">{milestone.year}</div>
                  <h3 className="mt-3 text-base font-semibold text-white">{milestone.title[locale]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{milestone.desc[locale]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team + certifications ----------------------------------------- */}
      <section className="section-y border-t border-border bg-surface">
        <div className="container-x grid gap-14 lg:grid-cols-2">
          <div>
            <h2 className="text-display text-2xl text-white">{t.teamTitle}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {teamComposition.map((item) => (
                <div key={item.label.zh} className="border-l border-border pl-5">
                  <div className="text-display text-3xl text-white tabular-nums">
                    <Counter value={item.value} />
                    {item.suffix}
                  </div>
                  <p className="mt-2 text-[0.8125rem] text-muted-foreground">{item.label[locale]}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-display text-2xl text-white">{t.certificationsTitle}</h2>
            <ul className="mt-8 space-y-3">
              {certifications.map((item) => (
                <li
                  key={item.zh}
                  className="flex items-center gap-3 rounded-(--radius) border border-border bg-card p-4"
                >
                  <Award className="size-4 shrink-0 text-primary" strokeWidth={1.5} />
                  <span className="text-sm text-body">{item[locale]}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-(--radius) border border-primary/25 bg-primary/6 p-6">
              <h3 className="text-sm font-semibold text-white">{t.contactTitle}</h3>
              <p className="mt-2 text-sm text-subtle">{settings.phone}</p>
              <p className="text-sm text-subtle">{settings.email}</p>
              <Link href={localeHref(locale, "/contact")} className="btn btn-primary mt-5 h-10 px-4">
                {dict.nav.contact}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
