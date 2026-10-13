import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { DownloadForm } from "@/components/admin/forms/download-form";

export const dynamic = "force-dynamic";

export default async function AdminDownloadEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title={isNew ? "上传资料" : "编辑资料"} />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:push 后即可管理下载资料。</p>
        </SetupNotice>
      </>
    );
  }

  let record = null;
  if (!isNew) {
    try {
      record = await db.downloadFile.findUnique({ where: { id } });
    } catch {
      record = null;
    }
    if (!record) notFound();
  }

  return (
    <>
      <Link href="/admin/downloads" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-white">
        <ArrowLeft className="size-3.5" />
        返回资料列表
      </Link>
      <AdminPageHeader title={isNew ? "上传资料" : "编辑资料"} description={isNew ? "添加一份可下载的资料。" : `正在编辑：${record?.titleZh}`} />
      <DownloadForm record={record ?? undefined} />
    </>
  );
}
