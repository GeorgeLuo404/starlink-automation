import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { getDictionary, isLocale, localeHtmlLang, locales, type Locale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ScrollProgress } from "@/components/motion";
import { siteUrl } from "@/lib/seo";
import { THEME_COLOR } from "@/lib/theme-color";

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${dict.meta.siteName} | ${dict.meta.tagline}`,
      template: `%s | ${dict.meta.siteShort}`,
    },
    description: dict.meta.description,
    keywords: dict.meta.keywords.split(","),
    applicationName: dict.meta.siteName,
    authors: [{ name: dict.meta.siteName }],
    creator: dict.meta.siteName,
    formatDetection: { telephone: true, address: true, email: true },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  return (
    <html lang={localeHtmlLang[typedLocale]} className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          {typedLocale === "zh" ? "跳到主要内容" : "Skip to content"}
        </a>
        <ScrollProgress />
        <SiteHeader locale={typedLocale} dict={dict} />
        <main id="main">{children}</main>
        <SiteFooter locale={typedLocale} dict={dict} />
      </body>
    </html>
  );
}
