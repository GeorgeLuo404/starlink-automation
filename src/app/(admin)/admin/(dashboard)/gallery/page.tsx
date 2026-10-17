import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteGalleryItem } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { AdminPageHeader, EmptyState, SetupNotice, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="图库" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理图库。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: Awaited<ReturnType<typeof db.galleryItem.findMany>> = [];
  try {
    rows = await db.galleryItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader
        title="图库"
        description="现场照片与视频，按相册归类后展示在前台图库页。"
        action={
          <Button asChild className="px-4">
            <Link href="/admin/gallery/new">
              <Plus className="size-4" />
              添加图片
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="图库还是空的" description="上传现场照片，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((row) => (
            <div key={row.id} className="group overflow-hidden rounded-(--radius) border border-border bg-card">
              <div className="relative aspect-4/3 bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.url} alt={row.title} className="size-full object-cover" />
                {/* opacity-0 still receives clicks, so keep it inert until hovered */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                  <Link href={`/admin/gallery/${row.id}`} className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10" aria-label="编辑">
                    <Edit3 className="size-3.5" />
                  </Link>
                  <ConfirmAction
                    action={deleteGalleryItem}
                    id={row.id}
                    title="删除图片"
                    description={`确定删除图片「${row.title}」吗？此操作不可撤销。`}
                    triggerLabel="删除"
                    triggerClassName="inline-flex size-9 items-center justify-center rounded-full border border-destructive/40 text-destructive-soft hover:bg-destructive/15"
                  >
                    <Trash2 className="size-3.5" />
                  </ConfirmAction>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-foreground">{row.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[0.5625rem] text-faint">{row.album}</span>
                  <StatusPill status={row.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
