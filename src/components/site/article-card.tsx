import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ArticleView } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { coverSrc, cn, formatDate } from "@/lib/utils";
import { Cover } from "./kit";
import copy from "@/content/copy.json";

export function ArticleCard({ article, priority, className }: { article: ArticleView; priority?: boolean; className?: string }) {
  return (
    <Link href={`/news/${article.slug}`} className={cn("reveal group block", className)}>
      <Card className="h-full p-2 transition-colors group-hover:border-lifted">
        <Cover
          src={coverSrc("article", article)}
          alt={article.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        <div className="flex flex-1 flex-col px-4 pt-5 pb-5 lg:px-5 lg:pb-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="tag" size="md">
              {article.category}
            </Badge>
            <span className="tabular-nums">{formatDate(article.publishedAt)}</span>
          </div>
          <h3 className="title-3 mt-5 line-clamp-2 text-xl">{article.title}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">{article.excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm">
            {copy.common.readMore}
            <ArrowUpRight className="size-4 text-primary-text transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
