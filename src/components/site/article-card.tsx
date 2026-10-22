import Link from "next/link";
import { Pin } from "lucide-react";
import type { ArticleView } from "@/lib/data";
import { coverSrc, cn, formatDate } from "@/lib/utils";
import { Cover } from "./kit";

/**
 * A news item: cover, category and date, title. The excerpt waits on the
 * cover and shows over it on hover, so the list reads as headlines. A pinned
 * article (置顶 in the admin) is marked, since it sits out of date order.
 */
export function ArticleCard({ article, priority, className }: { article: ArticleView; priority?: boolean; className?: string }) {
  return (
    <Link href={`/news/${article.slug}`} className={cn("reveal group block", className)}>
      <div className="relative">
        <Cover
          src={coverSrc("article", article)}
          alt={article.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="rounded-(--radius) border border-border"
        />
        {article.excerpt ? (
          <div
            aria-hidden="true"
            className="theme-dark absolute inset-0 flex items-end rounded-(--radius) bg-background/75 p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          >
            <p className="line-clamp-3 text-sm leading-6 text-body">{article.excerpt}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-5 flex items-center gap-3 text-xs">
        {article.pinned ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 text-[0.6875rem] leading-none text-primary-text">
            <Pin className="size-3" aria-hidden="true" />
            置顶
          </span>
        ) : null}
        <span className="text-primary-text">{article.category}</span>
        <span className="text-muted-foreground tabular-nums">{formatDate(article.publishedAt)}</span>
      </div>
      <h3 className="title-3 mt-2.5 line-clamp-2 text-xl transition-colors group-hover:text-primary-text">{article.title}</h3>
    </Link>
  );
}
