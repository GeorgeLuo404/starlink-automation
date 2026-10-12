import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { company, services } from "@/content/defaults";
import { Logo } from "./logo";
import { localeHref } from "./nav-items";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#1b1f27] bg-[#0a0b0e]">
      <div className="grid-blueprint pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="container-x relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo size="md" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#8a929e]">{dict.footer.desc}</p>
            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href={`tel:${company.phone}`}
                className="flex items-center gap-2.5 text-[#c3c9d4] transition-colors hover:text-[#22e0ff]"
              >
                <Phone className="size-3.5 text-[#22e0ff]" />
                {company.phone}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2.5 text-[#c3c9d4] transition-colors hover:text-[#22e0ff]"
              >
                <Mail className="size-3.5 text-[#22e0ff]" />
                {company.email}
              </a>
              <p className="flex items-start gap-2.5 text-[#8a929e]">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#22e0ff]" />
                {locale === "zh" ? company.addressZh : company.addressEn}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-eyebrow">{dict.footer.quickLinks}</h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {(["services", "cases", "news", "gallery", "downloads", "about"] as const).map((key) => (
                <li key={key}>
                  <Link
                    href={localeHref(locale, key === "about" ? "/about" : `/${key}`)}
                    className="text-[#8a929e] transition-colors hover:text-white"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-eyebrow">{dict.footer.servicesTitle}</h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={localeHref(locale, `/services/${service.slug}`)}
                    className="text-[#8a929e] transition-colors hover:text-white"
                  >
                    {service.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-eyebrow">{dict.footer.subscribe}</h3>
            <p className="mt-5 text-sm leading-relaxed text-[#8a929e]">{dict.footer.subscribeDesc}</p>
            <NewsletterForm dict={dict} className="mt-5" />
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col gap-4 text-xs text-[#5c6472] md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {dict.meta.siteName}. {dict.footer.rights}.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-[#8a929e]"
            >
              {dict.footer.icp}
            </a>
            <span className="hidden md:inline">|</span>
            <span>{dict.footer.police}</span>
            <Link href={localeHref(locale, "/contact")} className="transition-colors hover:text-[#8a929e]">
              {dict.nav.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
