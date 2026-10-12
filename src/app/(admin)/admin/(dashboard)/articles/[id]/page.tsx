import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/forms/article-form";

export const dynamic = "force-dynamic";

export default async function AdminArticleEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title={isNew ? "新建文章" : "编辑文章"} />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:push 后即可撰写文章。</p>
        </SetupNotice>
      </>
    );
  }

  let article = null;
  if (!isNew) {
    try {
      article = await db.article.findUnique({ where: { id } });
    } catch {
      article = null;
    }
    if (!article) notFound();
  }

  return (
    <>
      <Link
        href="/admin/articles"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#8a929e] transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" />
        返回文章列表
      </Link>

      <AdminPageHeader
        title={isNew ? "新建文章" : "编辑文章"}
        description={isNew ? "撰写一篇新的公司动态或技术分享。" : `正在编辑：${article?.titleZh}`}
      />

      <ArticleForm article={article ?? undefined} />
    </>
  );
}
