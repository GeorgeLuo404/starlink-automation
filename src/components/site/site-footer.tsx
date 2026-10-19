import Link from "next/link";
import type { SiteSettings } from "@/lib/data";
import { Logo } from "./logo";
import type { NavService } from "./nav-items";
import { NewsletterForm } from "./newsletter-form";
import copy from "@/content/copy.json";

export function SiteFooter({ settings, services }: { settings: SiteSettings; services: NavService[] }) {
  const year = new Date().getFullYear();
  const link = "text-sm text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="theme-dark border-t border-border">
      <div className="container-x grid gap-12 py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo size="md" />
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">{copy.footer.desc}</p>
          <h3 className="mt-10 text-sm text-foreground">{copy.footer.subscribe}</h3>
          <p className="mt-2 max-w-sm text-xs leading-6 text-muted-foreground">{copy.footer.subscribeDesc}</p>
          <NewsletterForm className="mt-4 max-w-sm" />
        </div>

        <div className="lg:col-span-2 lg:col-start-6">
          <h3 className="text-sm text-foreground">{copy.footer.quickLinks}</h3>
          <ul className="mt-5 space-y-3">
            {(["services", "cases", "news", "gallery", "downloads", "about", "contact"] as const).map((key) => (
              <li key={key}>
                <Link href={`/${key}`} className={link}>
                  {copy.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm text-foreground">{copy.footer.servicesTitle}</h3>
          <ul className="mt-5 space-y-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className={link}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm text-foreground">{copy.footer.contactTitle}</h3>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li>
              <a href={`tel:${settings.phone}`} className={link}>
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className={link}>
                {settings.email}
              </a>
            </li>
            <li className="leading-7">{settings.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {copy.meta.siteName} · {copy.footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="https://beian.miit.gov.cn" target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-foreground">
              {settings.icp ?? copy.footer.icp}
            </a>
            <span>{copy.footer.police}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
