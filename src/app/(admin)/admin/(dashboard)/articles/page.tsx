import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteArticle, setArticleStatus } from "@/lib/admin-actions";
import { AdminCard, AdminPageHeader, EmptyState, SetupNotice, StatusPill } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title="文章 / 新闻" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:push 后即可管理文章。</p>
        </SetupNotice>
      </>
    );
  }

  let articles: Awaited<ReturnType<typeof db.article.findMany>> = [];
  try {
    articles = await db.article.findMany({ orderBy: [{ createdAt: "desc" }] });
  } catch {
    articles = [];
  }

  return (
    <>
      <AdminPageHeader
        title="文章 / 新闻"
        description="发布公司动态与技术分享文章，支持中英双语与草稿状态。"
        action={
          <Link href="/admin/articles/new" className="btn btn-primary h-10 px-4">
            <Plus className="size-4" />
            新建文章
          </Link>
        }
      />

      {articles.length === 0 ? (
        <EmptyState
          title="还没有文章"
          description="创建第一篇文章，或运行 pnpm db:seed 导入内置的示例内容。"
          action={
            <Link href="/admin/articles/new" className="btn btn-primary h-10 px-4">
              <Plus className="size-4" />
              新建文章
            </Link>
          }
        />
      ) : (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1b1f27]">
                  {["标题", "状态", "发布日期", "阅读", "操作"].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left font-mono text-[0.625rem] tracking-[0.14em] text-[#5c6472] uppercase whitespace-nowrap"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-[#1b1f27] last:border-0 hover:bg-white/2">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="line-clamp-1 font-medium text-[#e8ebf0]">{article.titleZh}</span>
                        {article.featured ? (
                          <span className="rounded-full border border-[#22e0ff]/30 px-2 py-0.5 font-mono text-[0.5625rem] text-[#22e0ff]">
                            精选
                          </span>
                        ) : null}
                      </div>
                      <span className="mt-1 block font-mono text-[0.625rem] text-[#5c6472]">/{article.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={article.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {article.publishedAt ? formatDate(article.publishedAt) : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{article.viewCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="inline-flex size-8 items-center justify-center rounded border border-[#1b1f27] text-muted-foreground transition-colors hover:border-[#22e0ff]/40 hover:text-[#22e0ff]"
                          aria-label="编辑"
                        >
                          <Edit3 className="size-3.5" />
                        </Link>

                        <form action={setArticleStatus}>
                          <input type="hidden" name="id" value={article.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"}
                          />
                          <button
                            type="submit"
                            className="rounded border border-[#1b1f27] px-2.5 py-1.5 font-mono text-[0.625rem] text-muted-foreground transition-colors hover:border-success/40 hover:text-success"
                          >
                            {article.status === "PUBLISHED" ? "下架" : "发布"}
                          </button>
                        </form>

                        <form action={deleteArticle}>
                          <input type="hidden" name="id" value={article.id} />
                          <button
                            type="submit"
                            className="inline-flex size-8 items-center justify-center rounded border border-[#1b1f27] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-[#ff8a8c]"
                            aria-label="删除"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </>
  );
}
