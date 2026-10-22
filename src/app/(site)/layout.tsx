import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
// Self-hosted, unicode-range sliced CJK font: bundled into our own static assets,
// so it is served from our server / OSS in mainland China (no Google Fonts).
import "@fontsource-variable/noto-sans-sc";
import { fontVariables } from "@/app/fonts";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Analytics } from "@/components/site/analytics";
import { getSiteSettings, listServices } from "@/lib/data";
import { siteNoindex, siteUrl } from "@/lib/seo";
import { THEME_COLOR } from "@/lib/theme-color";
import copy from "@/content/copy.json";

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  width: "device-width",
  initialScale: 1,
};

/** Site-wide defaults; names, tagline, description and keywords come from 后台 → 站点设置. */
export async function generateMetadata(): Promise<Metadata> {
  const { companyName, companyShort, seo } = await getSiteSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${companyName} | ${seo.tagline}`,
      template: `%s | ${companyShort}`,
    },
    description: seo.description,
    keywords: seo.keywords.split(/[,，]/).map((k) => k.trim()).filter(Boolean),
    applicationName: companyName,
    authors: [{ name: companyName }],
    creator: companyName,
    formatDetection: { telephone: true, address: true, email: true },
    robots: siteNoindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSiteSettings(), listServices()]);
  // Header dropdown and footer follow what is edited in the admin.
  const navServices = services.map(({ slug, title, summary, coverUrl }) => ({ slug, title, summary, coverUrl }));

  // `data-scroll-behavior` tells Next.js that `scroll-behavior: smooth` comes from
  // our stylesheet (globals.css), so it can suspend it during route transitions.
  return (
    <html lang="zh-CN" className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="theme-dark min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          跳到主要内容
        </a>
        <SiteHeader services={navServices} />
        <main id="main">{children}</main>
        <SiteFooter settings={settings} services={navServices} />
        <Analytics id={settings.analyticsId} />
      </body>
    </html>
  );
}
