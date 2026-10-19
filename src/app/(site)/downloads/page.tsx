import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { listDownloads } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { DownloadList } from "@/components/site/download-list";
import { EmptyState } from "@/components/site/kit";
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

      <section className="theme-white section-y">
        <div className="container-x">
          {items.length === 0 ? <EmptyState hint={copy.downloads.emptyHint} /> : <DownloadList items={items} />}
          <p className="mt-10 text-sm text-muted-foreground">如需特定技术文档或图纸样例，请通过联系页面告知我们，我们会按需提供。</p>
        </div>
      </section>

      <Toaster />
    </>
  );
}
