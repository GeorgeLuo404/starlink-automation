import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { AdminPageHeader, SetupNotice } from "@/components/admin/ui";
import { GalleryForm } from "@/components/admin/forms/gallery-form";

export const dynamic = "force-dynamic";

export default async function AdminGalleryEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title={isNew ? "添加图片" : "编辑图片"} />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:push 后即可管理图库。</p>
        </SetupNotice>
      </>
    );
  }

  let record = null;
  if (!isNew) {
    try {
      record = await db.galleryItem.findUnique({ where: { id } });
    } catch {
      record = null;
    }
    if (!record) notFound();
  }

  return (
    <>
      <Link href="/admin/gallery" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#8a929e] transition-colors hover:text-white">
        <ArrowLeft className="size-3.5" />
        返回图库
      </Link>
      <AdminPageHeader title={isNew ? "添加图片" : "编辑图片"} description={isNew ? "添加一张现场照片或视频。" : `正在编辑：${record?.titleZh}`} />
      <GalleryForm record={record ?? undefined} />
    </>
  );
}
