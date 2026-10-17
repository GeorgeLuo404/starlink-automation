import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { listArticleCategories, listArticles } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { ArticleCard } from "@/components/site/article-card";
import { Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";
import copy from "@/content/copy.json";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({ title: copy.news.title, description: copy.news.lead, path: "/news" });

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const category = sp.category?.trim() || undefined;
  const query = sp.q?.trim() || undefined;

  const [{ items, total, totalPages }, categories] = await Promise.all([
    listArticles({ page, pageSize: 9, category, query }),
    listArticleCategories(),
  ]);

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { category, q: query, page: String(page), ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== "1" && !(key === "page" && value === "1")) next.set(key, value);
    }
    const qs = next.toString();
    return `/news${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHero
        eyebrow={copy.news.eyebrow}
        title={copy.news.title}
        description={copy.news.lead}
        crumbs={[{ label: copy.nav.news }]}
      >
        <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildQuery({ category: undefined, page: undefined })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                !category
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-white"
              )}
            >
              {copy.common.all}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={buildQuery({ category: cat.slug, page: undefined })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                  category === cat.slug
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-white"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <form action="/news" className="flex w-full max-w-xs gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query ?? ""}
              placeholder={copy.common.searchPlaceholder}
              className="field h-10"
              aria-label={copy.common.search}
            />
            <button type="submit" className="btn btn-ghost h-10 shrink-0 px-4">
              {copy.common.search}
            </button>
          </form>
        </div>
      </PageHero>

      <div className="container-x py-16 md:py-24">
        {items.length === 0 ? (
          <div className="rounded-(--radius) border border-dashed border-border py-24 text-center">
            <p className="text-sm font-medium text-foreground">{copy.common.empty}</p>
            <p className="mt-2 text-sm text-muted-foreground">{copy.common.emptyHint}</p>
          </div>
        ) : (
          <>
            <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" gap={0.08}>
              {items.map((article) => (
                <StaggerItem key={article.slug} className="h-full">
                  <ArticleCard article={article} />
                </StaggerItem>
              ))}
            </Stagger>

            {totalPages > 1 ? (
              <nav className="mt-16 flex items-center justify-between border-t border-border pt-8" aria-label="Pagination">
                <Link
                  href={buildQuery({ page: String(Math.max(1, page - 1)) })}
                  aria-disabled={page <= 1}
                  className={cn(
                    "btn btn-ghost h-10 px-4",
                    page <= 1 && "pointer-events-none opacity-40"
                  )}
                >
                  <ChevronLeft className="size-4" />
                  {copy.common.prev}
                </Link>

                <span className="font-mono text-xs tracking-wider text-muted-foreground">
                  {copy.common.page} {page} / {totalPages} · {total} 条
                </span>

                <Link
                  href={buildQuery({ page: String(Math.min(totalPages, page + 1)) })}
                  aria-disabled={page >= totalPages}
                  className={cn(
                    "btn btn-ghost h-10 px-4",
                    page >= totalPages && "pointer-events-none opacity-40"
                  )}
                >
                  {copy.common.next}
                  <ChevronRight className="size-4" />
                </Link>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
