import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localeHref } from "@/components/site/nav-items";
import { coverSrc, formatDate } from "@/lib/utils";
import type { ArticleView } from "@/lib/data";

export function ArticleCard({
  article,
  locale,
  dict,
  className,
}: {
  article: ArticleView;
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <Link
      href={localeHref(locale, `/news/${article.slug}`)}
      className={`card-industrial corner-ticks group flex h-full flex-col overflow-hidden ${className ?? ""}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={coverSrc("article", article)}
          alt={article.title[locale]}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/20 to-transparent" />
        <span className="absolute top-4 left-4 rounded-full border border-primary/25 bg-background/80 px-2.5 py-1 font-mono text-[0.625rem] tracking-wider text-primary backdrop-blur-sm">
          {article.category[locale]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 font-mono text-[0.625rem] tracking-wider text-faint">
          <span>{formatDate(article.publishedAt, locale)}</span>
          <span>·</span>
          <span>
            {article.readMinutes} {dict.news.minRead}
          </span>
        </div>

        <h3 className="mt-3.5 line-clamp-2 text-base leading-snug font-semibold text-white transition-colors group-hover:text-primary">
          {article.title[locale]}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {article.excerpt[locale]}
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          {dict.common.readMore}
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
