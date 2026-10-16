import { getPrisma } from "@/lib/prisma";
import { AdminPageHeader, EmptyState, SetupNotice } from "@/components/admin/ui";
import { MediaUploader } from "@/components/admin/media-uploader";
import { MediaGrid, type MediaRow } from "@/components/admin/media-grid";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder } = await searchParams;
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title="媒体库" description="统一管理图片、视频与文档资源。" />
        <SetupNotice title="数据库尚未连接">
          <p>媒体库需要数据库来索引文件。请先配置 DATABASE_URL 并执行 pnpm db:deploy。</p>
        </SetupNotice>
      </>
    );
  }

  let assets: MediaRow[] = [];
  let error: string | null = null;

  try {
    const rows = await db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    assets = rows.map((row) => ({
      id: row.id,
      url: row.url,
      storageKey: row.storageKey,
      originalName: row.originalName,
      mimeType: row.mimeType,
      kind: row.kind,
      size: row.size,
      folder: row.folder,
      alt: row.alt,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (dbError) {
    error = dbError instanceof Error ? dbError.message : String(dbError);
  }

  if (error) {
    return (
      <>
        <AdminPageHeader title="媒体库" description="统一管理图片、视频与文档资源。" />
        <SetupNotice title="无法读取媒体库">
          <p className="font-mono text-xs">{error}</p>
          <p>请确认数据库已迁移：pnpm db:deploy</p>
        </SetupNotice>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="媒体库"
        description="上传后的文件会出现在这里，可复制链接后用于文章封面、案例图片或图库。"
      />

      <MediaUploader folder={folder ?? "general"} />

      <div className="mt-10">
        {assets.length === 0 ? (
          <EmptyState
            title="媒体库还是空的"
            description="上传第一张图片或视频后，就能在文章、案例与图库中引用它们。"
          />
        ) : (
          <MediaGrid rows={assets} />
        )}
      </div>
    </>
  );
}
