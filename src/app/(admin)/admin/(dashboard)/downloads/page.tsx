import Link from "next/link";
import { Plus } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { AdminPageHeader, EmptyState, SetupNotice } from "@/components/admin/ui";
import { DownloadsTable, type DownloadRow } from "@/components/admin/tables/downloads-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDownloadsPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="下载资料" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理下载资料。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: DownloadRow[] = [];
  try {
    const records = await db.downloadFile.findMany({ orderBy: { sortOrder: "asc" } });
    rows = records.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      fileType: row.fileType,
      fileSize: row.fileSize,
      downloadCount: row.downloadCount,
      status: row.status,
    }));
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader
        title="下载资料"
        description="宣传册、白皮书与参数表，前台可统计下载次数。"
        action={
          <Button asChild className="px-4">
            <Link href="/admin/downloads/new">
              <Plus className="size-4" />
              上传资料
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="还没有资料" description="上传第一份 PDF 或文档，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <DownloadsTable rows={rows} />
      )}
    </>
  );
}
