import Link from "next/link";
import { Plus } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { GalleryGrid, type GalleryRow } from "@/components/admin/gallery-grid";
import { AdminPageHeader, EmptyState, SetupNotice } from "@/components/admin/ui";
import { ListHeaderButton } from "@/components/admin/page-content/list-header-button";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="现场图库" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理图库。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: GalleryRow[] = [];
  try {
    const records = await db.galleryItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
    rows = records.map(({ id, title, url, album, status }) => ({ id, title, url, album, status }));
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader
        title="现场图库"
        description="现场照片与视频，按相册归类后展示在前台图库页。"
        action={
          <div className="flex flex-wrap gap-2">
            <ListHeaderButton page="gallery" />
            <Button asChild className="px-4">
              <Link href="/admin/gallery/new">
                <Plus className="size-4" />
                添加图片
              </Link>
            </Button>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="图库还是空的" description="上传现场照片，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <GalleryGrid rows={rows} />
      )}
    </>
  );
}
