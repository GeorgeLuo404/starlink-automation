import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { fontVariables } from "@/app/fonts";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Analytics } from "@/components/site/analytics";
import { getSiteSettings } from "@/lib/data";
import { ScrollProgress } from "@/components/motion";
import { siteUrl } from "@/lib/seo";
import { THEME_COLOR } from "@/lib/theme-color";
import copy from "@/content/copy.json";

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${copy.meta.siteName} | ${copy.meta.tagline}`,
    template: `%s | ${copy.meta.siteShort}`,
  },
  description: copy.meta.description,
  keywords: copy.meta.keywords.split(","),
  applicationName: copy.meta.siteName,
  authors: [{ name: copy.meta.siteName }],
  creator: copy.meta.siteName,
  formatDetection: { telephone: true, address: true, email: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  robots: { index: true, follow: true },
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  // `data-scroll-behavior` tells Next.js that `scroll-behavior: smooth` comes from
  // our stylesheet (globals.css), so it can suspend it during route transitions.
  return (
    <html
      lang="zh-CN"
      className={`dark ${fontVariables}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          跳到主要内容
        </a>
        <ScrollProgress />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter settings={settings} />
        <Analytics id={settings.analyticsId} />
      </body>
    </html>
  );
}
