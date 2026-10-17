import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Zap } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { services as defaultServices } from "@/content/defaults";
import { getSiteSettings, listServices } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";
import { Reveal } from "@/components/motion";
import copy from "@/content/copy.json";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({ title: copy.contact.title, description: copy.contact.lead, path: "/contact" });

export default async function ContactPage() {
  const t = copy.contact;
  const settings = await getSiteSettings();

  let serviceNames: string[];
  try {
    serviceNames = (await listServices()).map((service) => service.title);
  } catch {
    serviceNames = defaultServices.map((service) => service.title);
  }

  const info = [
    {
      icon: MapPin,
      label: t.address,
      value: settings.address,
      href: undefined as string | undefined,
    },
    { icon: Phone, label: t.phoneLabel, value: settings.phone, href: `tel:${settings.phone}` },
    { icon: Mail, label: t.emailLabel, value: settings.email, href: `mailto:${settings.email}` },
    { icon: Clock, label: t.hoursLabel, value: t.hoursValue, href: undefined },
    { icon: Zap, label: t.urgentLabel, value: t.urgentValue, href: undefined },
  ];

  return (
    <>
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.lead}
        crumbs={[{ label: copy.nav.contact }]}
      />

      <div className="container-x py-16 md:py-20">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="card-industrial p-7 lg:p-9">
                <h2 className="text-display text-2xl text-white">{t.formTitle}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{t.formDesc}</p>
                <div className="mt-8">
                  <ContactForm services={serviceNames} />
                </div>
              </div>
            </Reveal>
          </div>

          <aside className="lg:col-span-5">
            <h2 className="text-eyebrow">{t.infoTitle}</h2>
            <div className="mt-6 divide-y divide-border border-y border-border">
              {info.map((row) => {
                const Icon = row.icon;
                const content = (
                  <div className="flex items-start gap-4 py-5">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius) border border-border bg-card text-primary">
                      <Icon className="size-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono text-[0.625rem] tracking-[0.14em] text-faint uppercase">
                        {row.label}
                      </div>
                      <div className="mt-1.5 text-sm wrap-break-word text-foreground">{row.value}</div>
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

            <div className="mt-8 overflow-hidden rounded-(--radius) border border-border">
              <div className="relative flex aspect-4/3 items-center justify-center bg-card">
                <div className="grid-blueprint absolute inset-0 opacity-60" aria-hidden="true" />
                <div className="relative text-center">
                  <span className="relative mx-auto flex size-3 items-center justify-center">
                    <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-primary" />
                    <span className="relative inline-flex size-3 rounded-full bg-primary" />
                  </span>
                  <p className="mt-4 text-sm font-medium text-white">{t.mapTitle}</p>
                  <p className="mt-1 font-mono text-[0.625rem] tracking-wider text-faint">
                    {settings.address}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 font-mono text-[0.6875rem] leading-relaxed tracking-wide text-faint">
              {copy.home.cta.note}
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
