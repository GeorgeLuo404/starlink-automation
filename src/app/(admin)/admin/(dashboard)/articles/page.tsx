import Link from "next/link";
import { Plus } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { COVER_MEDIA, coverOf } from "@/lib/data";
import { AdminPageHeader, EmptyState, SetupNotice } from "@/components/admin/ui";
import { ArticlesTable, type ArticleRow } from "@/components/admin/tables/articles-table";
import { ListHeaderButton } from "@/components/admin/page-content/list-header-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title="新闻动态" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理文章。</p>
        </SetupNotice>
      </>
    );
  }

  let articles: ArticleRow[] = [];
  try {
    const records = await db.article.findMany({
      // Newest first, as on the site; drafts (no date yet) on top.
      orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
      include: { media: COVER_MEDIA, _count: { select: { media: true } } },
    });
    articles = records.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      pinned: row.pinned,
      publishedAt: row.publishedAt,
      viewCount: row.viewCount,
      cover: coverOf(row),
      mediaCount: row._count.media,
    }));
  } catch {
    articles = [];
  }

  return (
    <>
      <AdminPageHeader
        title="新闻动态"
        description="发布公司动态与技术分享文章，支持草稿与发布状态。"
        action={
          <div className="flex flex-wrap gap-2">
            <ListHeaderButton page="news" />
            <Button asChild className="px-4">
              <Link href="/admin/articles/new">
                <Plus className="size-4" />
                新建文章
              </Link>
            </Button>
          </div>
        }
      />

      {articles.length === 0 ? (
        <EmptyState
          title="还没有文章"
          description="创建第一篇文章，或运行 pnpm db:seed 导入内置的示例内容。"
          action={
            <Button asChild className="px-4">
              <Link href="/admin/articles/new">
                <Plus className="size-4" />
                新建文章
              </Link>
            </Button>
          }
        />
      ) : (
        <ArticlesTable rows={articles} />
      )}
    </>
  );
}
