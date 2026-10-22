import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getPageContent } from "@/lib/page-content";
import { listDownloads } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { DownloadList } from "@/components/site/download-list";
import { EmptyState } from "@/components/site/kit";
import { Toaster } from "@/components/ui/sonner";
import copy from "@/content/copy.json";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const header = await getPageContent("downloads.header");
  return buildMetadata({ title: copy.nav.downloads, description: header.lead, path: "/downloads" });
}

export default async function DownloadsPage() {
  const [items, header] = await Promise.all([listDownloads(), getPageContent("downloads.header")]);

  return (
    <>
      <PageHero
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.lead}
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
