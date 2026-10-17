import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteArticle, setArticleStatus } from "@/lib/admin-actions";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader, EmptyState, SetupNotice, StatusPill, iconAction, iconDanger } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title="文章 / 新闻" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理文章。</p>
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
          <Button asChild className="px-4">
            <Link href="/admin/articles/new">
              <Plus className="size-4" />
              新建文章
            </Link>
          </Button>
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
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {["标题", "状态", "发布日期", "阅读", "操作"].map((head) => (
                  <TableHead key={head}>
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="line-clamp-1 font-medium text-foreground">{article.titleZh}</span>
                      {article.featured ? (
                        <span className="rounded-full border border-primary/30 px-2 py-0.5 font-mono text-[0.5625rem] text-primary">
                          精选
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-1 block font-mono text-[0.625rem] text-faint">/{article.slug}</span>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={article.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {article.publishedAt ? formatDate(article.publishedAt) : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{article.viewCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className={iconAction}
                        aria-label="编辑"
                      >
                        <Edit3 className="size-3.5" />
                      </Link>

                      <ActionForm action={setArticleStatus} showSummary={false}>
                        <input type="hidden" name="id" value={article.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"}
                        />
                        <SubmitButton variant="outline" size="sm" className="h-8 px-2.5 font-mono text-[0.625rem]">
                          {article.status === "PUBLISHED" ? "下架" : "发布"}
                        </SubmitButton>
                      </ActionForm>

                      <ConfirmAction
                        action={deleteArticle}
                        id={article.id}
                        title="删除文章"
                        description={`确定删除文章「${article.titleZh}」吗？此操作不可撤销。`}
                        triggerLabel="删除"
                        triggerClassName={iconDanger}
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmAction>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
