import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Zap } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { company, services as defaultServices } from "@/content/defaults";
import { listServices } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";
import { Reveal } from "@/components/motion";

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
  return buildMetadata({ locale, title: dict.contact.title, description: dict.contact.lead, path: "/contact" });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.contact;

  let serviceNames: string[];
  try {
    serviceNames = (await listServices()).map((service) => service.title[locale]);
  } catch {
    serviceNames = defaultServices.map((service) => service.title[locale]);
  }

  const info = [
    {
      icon: MapPin,
      label: t.address,
      value: t.addressValue,
      href: undefined as string | undefined,
    },
    { icon: Phone, label: t.phoneLabel, value: company.phone, href: `tel:${company.phone}` },
    { icon: Mail, label: t.emailLabel, value: company.email, href: `mailto:${company.email}` },
    { icon: Clock, label: t.hoursLabel, value: t.hoursValue, href: undefined },
    { icon: Zap, label: t.urgentLabel, value: t.urgentValue, href: undefined },
  ];

  return (
    <>
      <PageHero
        locale={locale}
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.lead}
        crumbs={[{ label: dict.nav.contact }]}
      />

      <div className="container-x py-16 md:py-20">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="card-industrial p-7 lg:p-9">
                <h2 className="text-display text-2xl text-white">{t.formTitle}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{t.formDesc}</p>
                <div className="mt-8">
                  <ContactForm locale={locale} dict={dict} services={serviceNames} />
                </div>
              </div>
            </Reveal>
          </div>

          <aside className="lg:col-span-5">
            <h2 className="text-eyebrow">{t.infoTitle}</h2>
            <div className="mt-6 divide-y divide-[#1b1f27] border-y border-[#1b1f27]">
              {info.map((row) => {
                const Icon = row.icon;
                const content = (
                  <div className="flex items-start gap-4 py-5">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius) border border-[#1b1f27] bg-[#0d0f13] text-[#22e0ff]">
                      <Icon className="size-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono text-[0.625rem] tracking-[0.14em] text-[#5c6472] uppercase">
                        {row.label}
                      </div>
                      <div className="mt-1.5 text-sm wrap-break-word text-[#e8ebf0]">{row.value}</div>
                    </div>
                  </div>
                );
                return row.href ? (
                  <a key={row.label} href={row.href} className="block transition-colors hover:bg-white/2">
                    {content}
                  </a>
                ) : (
                  <div key={row.label}>{content}</div>
                );
              })}
            </div>

            <div className="mt-8 overflow-hidden rounded-(--radius) border border-[#1b1f27]">
              <div className="relative flex aspect-4/3 items-center justify-center bg-[#0d0f13]">
                <div className="grid-blueprint absolute inset-0 opacity-60" aria-hidden="true" />
                <div className="relative text-center">
                  <span className="relative mx-auto flex size-3 items-center justify-center">
                    <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-[#22e0ff]" />
                    <span className="relative inline-flex size-3 rounded-full bg-[#22e0ff]" />
                  </span>
                  <p className="mt-4 text-sm font-medium text-white">{t.mapTitle}</p>
                  <p className="mt-1 font-mono text-[0.625rem] tracking-wider text-[#5c6472]">
                    {locale === "zh" ? company.addressZh : company.addressEn}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 font-mono text-[0.6875rem] leading-relaxed tracking-wide text-[#5c6472]">
              {dict.home.cta.note}
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
