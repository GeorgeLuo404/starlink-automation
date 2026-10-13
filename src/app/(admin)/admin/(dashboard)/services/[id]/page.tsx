import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/forms/service-form";

export const dynamic = "force-dynamic";

export default async function AdminServiceEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title={isNew ? "新建业务" : "编辑业务"} />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:push 后即可管理业务能力。</p>
        </SetupNotice>
      </>
    );
  }

  let record = null;
  if (!isNew) {
    try {
      record = await db.service.findUnique({ where: { id } });
    } catch {
      record = null;
    }
    if (!record) notFound();
  }

  return (
    <>
      <Link href="/admin/services" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-white">
        <ArrowLeft className="size-3.5" />
        返回业务列表
      </Link>
      <AdminPageHeader title={isNew ? "新建业务" : "编辑业务"} description={isNew ? "添加一项新的业务能力。" : `正在编辑：${record?.titleZh}`} />
      <ServiceForm record={record ?? undefined} />
    </>
  );
}
