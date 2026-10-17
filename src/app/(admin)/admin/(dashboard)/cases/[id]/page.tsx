import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { CaseForm } from "@/components/admin/forms/case-form";

export const dynamic = "force-dynamic";

export default async function AdminCaseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title={isNew ? "新建案例" : "编辑案例"} />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理案例。</p>
        </SetupNotice>
      </>
    );
  }

  let record = null;
  if (!isNew) {
    try {
      record = await db.project.findUnique({ where: { id } });
    } catch {
      record = null;
    }
    if (!record) notFound();
  }

  return (
    <>
      <Link href="/admin/cases" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-white">
        <ArrowLeft className="size-3.5" />
        返回案例列表
      </Link>
      <AdminPageHeader title={isNew ? "新建案例" : "编辑案例"} description={isNew ? "记录一个已交付的项目。" : `正在编辑：${record?.titleZh}`} />
      <CaseForm record={record ?? undefined} />
    </>
  );
}
