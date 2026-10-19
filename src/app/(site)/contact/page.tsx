import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Zap } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { services as defaultServices } from "@/content/defaults";
import { getSiteSettings, listServices } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";
import { Eyebrow } from "@/components/site/kit";
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
    { icon: Phone, label: t.phoneLabel, value: settings.phone, href: `tel:${settings.phone}` },
    { icon: Mail, label: t.emailLabel, value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: t.address, value: settings.address, href: undefined as string | undefined },
    { icon: Clock, label: t.hoursLabel, value: t.hoursValue, href: undefined },
    { icon: Zap, label: t.urgentLabel, value: t.urgentValue, href: undefined },
  ];

  return (
    <>
      <PageHero eyebrow={t.title} title={copy.home.cta.title} description={t.lead} crumbs={[{ label: copy.nav.contact }]} />

      <section className="theme-light section-y">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Card className="reveal p-7 sm:p-10 lg:col-span-7 lg:p-12">
            <h2 className="title-3 text-2xl">{t.formTitle}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t.formDesc}</p>
            <div className="mt-10">
              <ContactForm services={serviceNames} />
            </div>
          </Card>

          <aside className="lg:col-span-5">
            <Eyebrow>{t.infoTitle}</Eyebrow>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {info.map((row) => {
                const Icon = row.icon;
                const content = (
                  <div className="flex items-start gap-4 py-5">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-primary-text">
                      <Icon className="size-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">{row.label}</div>
                      <div className="mt-1.5 text-base wrap-break-word">{row.value}</div>
                    </div>
                  </div>
                );
                return (
                  <li key={row.label}>
                    {row.href ? (
                      <a href={row.href} className="block transition-colors hover:text-primary-text">
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="grid-lines relative mt-8 flex aspect-4/3 items-center justify-center overflow-hidden rounded-(--radius) border border-border bg-card">
              <div className="text-center">
                <span className="relative mx-auto flex size-3 items-center justify-center">
                  <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-primary" />
                  <span className="relative inline-flex size-3 rounded-full bg-primary" />
                </span>
                <p className="mt-5 text-sm">{t.mapTitle}</p>
                <p className="mt-1 px-6 text-xs text-muted-foreground">{settings.address}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
