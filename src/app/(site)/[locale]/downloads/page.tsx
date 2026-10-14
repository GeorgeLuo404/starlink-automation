import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { listDownloads } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { DownloadList } from "@/components/site/download-list";
import { Toaster } from "@/components/ui/toaster";

export const revalidate = 120;

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
  return buildMetadata({
    locale,
    title: dict.downloads.title,
    description: dict.downloads.lead,
    path: "/downloads",
  });
}

export default async function DownloadsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const items = await listDownloads();

  return (
    <>
      <PageHero
        locale={locale}
        eyebrow={dict.downloads.eyebrow}
        title={dict.downloads.title}
        description={dict.downloads.lead}
        crumbs={[{ label: dict.nav.downloads }]}
      />

      <div className="container-x py-16 md:py-20">
        {items.length === 0 ? (
          <div className="rounded-(--radius) border border-dashed border-border py-24 text-center">
            <p className="text-sm text-muted-foreground">{dict.downloads.emptyHint}</p>
          </div>
        ) : (
          <DownloadList items={items} locale={locale} dict={dict} />
        )}

        <p className="mt-10 font-mono text-[0.6875rem] leading-relaxed tracking-wide text-faint">
          {locale === "zh"
            ? "如需特定技术文档或图纸样例，请通过联系页面告知我们，我们会按需提供。"
            : "Need a specific datasheet or a drawing sample? Contact us and we will provide it on request."}
        </p>
      </div>

      <Toaster />
    </>
  );
}
