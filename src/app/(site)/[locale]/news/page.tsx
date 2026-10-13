import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { listArticleCategories, listArticles } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { ArticleCard } from "@/components/site/article-card";
import { localeHref } from "@/components/site/nav-items";
import { Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

export const revalidate = 60;

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
  return buildMetadata({ locale, title: dict.news.title, description: dict.news.lead, path: "/news" });
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
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
    return `${localeHref(locale, "/news")}${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHero
        locale={locale}
        eyebrow={dict.news.eyebrow}
        title={dict.news.title}
        description={dict.news.lead}
        crumbs={[{ label: dict.nav.news }]}
      >
        <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildQuery({ category: undefined, page: undefined })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                !category
                  ? "border-[#22e0ff]/40 bg-[#22e0ff]/10 text-[#22e0ff]"
                  : "border-[#1b1f27] text-muted-foreground hover:text-white"
              )}
            >
              {dict.common.all}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={buildQuery({ category: cat.slug, page: undefined })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                  category === cat.slug
                    ? "border-[#22e0ff]/40 bg-[#22e0ff]/10 text-[#22e0ff]"
                    : "border-[#1b1f27] text-muted-foreground hover:text-white"
                )}
              >
                {locale === "zh" ? cat.nameZh : cat.nameEn}
              </Link>
            ))}
          </div>

          <form action={localeHref(locale, "/news")} className="flex w-full max-w-xs gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query ?? ""}
              placeholder={dict.common.searchPlaceholder}
              className="field h-10"
              aria-label={dict.common.search}
            />
            <button type="submit" className="btn btn-ghost h-10 shrink-0 px-4">
              {dict.common.search}
            </button>
          </form>
        </div>
      </PageHero>

      <div className="container-x py-16 md:py-24">
        {items.length === 0 ? (
          <div className="rounded-(--radius) border border-dashed border-[#1b1f27] py-24 text-center">
            <p className="text-sm font-medium text-[#e8ebf0]">{dict.common.empty}</p>
            <p className="mt-2 text-sm text-muted-foreground">{dict.common.emptyHint}</p>
          </div>
        ) : (
          <>
            <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" gap={0.08}>
              {items.map((article) => (
                <StaggerItem key={article.slug} className="h-full">
                  <ArticleCard article={article} locale={locale} dict={dict} />
                </StaggerItem>
              ))}
            </Stagger>

            {totalPages > 1 ? (
              <nav className="mt-16 flex items-center justify-between border-t border-[#1b1f27] pt-8" aria-label="Pagination">
                <Link
                  href={buildQuery({ page: String(Math.max(1, page - 1)) })}
                  aria-disabled={page <= 1}
                  className={cn(
                    "btn btn-ghost h-10 px-4",
                    page <= 1 && "pointer-events-none opacity-40"
                  )}
                >
                  <ChevronLeft className="size-4" />
                  {dict.common.prev}
                </Link>

                <span className="font-mono text-xs tracking-wider text-muted-foreground">
                  {dict.common.page} {page} / {totalPages} · {total} {locale === "zh" ? "条" : "items"}
                </span>

                <Link
                  href={buildQuery({ page: String(Math.min(totalPages, page + 1)) })}
                  aria-disabled={page >= totalPages}
                  className={cn(
                    "btn btn-ghost h-10 px-4",
                    page >= totalPages && "pointer-events-none opacity-40"
                  )}
                >
                  {dict.common.next}
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
