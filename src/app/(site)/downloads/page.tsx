import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { listDownloads } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { DownloadList } from "@/components/site/download-list";
import { Toaster } from "@/components/ui/sonner";
import copy from "@/content/copy.json";

export const revalidate = 120;

export const metadata: Metadata = buildMetadata({
  title: copy.downloads.title,
  description: copy.downloads.lead,
  path: "/downloads",
});

export default async function DownloadsPage() {
  const items = await listDownloads();

  return (
    <>
      <PageHero
        eyebrow={copy.downloads.eyebrow}
        title={copy.downloads.title}
        description={copy.downloads.lead}
        crumbs={[{ label: copy.nav.downloads }]}
      />

      <div className="container-x py-16 md:py-20">
        {items.length === 0 ? (
          <div className="rounded-(--radius) border border-dashed border-border py-24 text-center">
            <p className="text-sm text-muted-foreground">{copy.downloads.emptyHint}</p>
          </div>
        ) : (
          <DownloadList items={items} />
        )}

        <p className="mt-10 font-mono text-[0.6875rem] leading-relaxed tracking-wide text-faint">
          如需特定技术文档或图纸样例，请通过联系页面告知我们，我们会按需提供。
        </p>
      </div>

      <Toaster />
    </>
  );
}
