import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { services } from "@/content/defaults";
import type { SiteSettings } from "@/lib/data";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import copy from "@/content/copy.json";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-surface">
      <div className="grid-blueprint pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="container-x relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo size="md" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">{copy.footer.desc}</p>
            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2.5 text-body transition-colors hover:text-primary"
              >
                <Phone className="size-3.5 text-primary" />
                {settings.phone}
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2.5 text-body transition-colors hover:text-primary"
              >
                <Mail className="size-3.5 text-primary" />
                {settings.email}
              </a>
              <p className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                {settings.address}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-eyebrow">{copy.footer.quickLinks}</h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {(["services", "cases", "news", "gallery", "downloads", "about"] as const).map((key) => (
                <li key={key}>
                  <Link
                    href={`/${key}`}
                    className="text-muted-foreground transition-colors hover:text-white"
                  >
                    {copy.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-eyebrow">{copy.footer.servicesTitle}</h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-muted-foreground transition-colors hover:text-white"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-eyebrow">{copy.footer.subscribe}</h3>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{copy.footer.subscribeDesc}</p>
            <NewsletterForm className="mt-5" />
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col gap-4 text-xs text-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {copy.meta.siteName}. {copy.footer.rights}.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-muted-foreground"
            >
              {settings.icp ?? copy.footer.icp}
            </a>
            <span className="hidden md:inline">|</span>
            <span>{copy.footer.police}</span>
            <Link href="/contact" className="transition-colors hover:text-muted-foreground">
              {copy.nav.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
