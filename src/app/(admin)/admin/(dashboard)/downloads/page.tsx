import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteDownload } from "@/lib/admin-actions";
import { AdminCard, AdminPageHeader, EmptyState, SetupNotice, StatusPill } from "@/components/admin/ui";
import { formatBytes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDownloadsPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="下载资料" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:push 后即可管理下载资料。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: Awaited<ReturnType<typeof db.downloadFile.findMany>> = [];
  try {
    rows = await db.downloadFile.findMany({ orderBy: { sortOrder: "asc" } });
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader
        title="下载资料"
        description="宣传册、白皮书与参数表，前台可统计下载次数。"
        action={
          <Link href="/admin/downloads/new" className="btn btn-primary h-10 px-4">
            <Plus className="size-4" />
            上传资料
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="还没有资料" description="上传第一份 PDF 或文档，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["资料", "类型", "大小", "下载", "状态", "操作"].map((head) => (
                    <th key={head} className="px-4 py-3 text-left font-mono text-[0.625rem] tracking-[0.14em] text-faint uppercase whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-white/2">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{row.titleZh}</span>
                      <span className="mt-1 block font-mono text-[0.625rem] text-faint">{row.slug}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{row.fileType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{formatBytes(row.fileSize)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.downloadCount}</td>
                    <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/downloads/${row.id}`} className="inline-flex size-8 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary" aria-label="编辑">
                          <Edit3 className="size-3.5" />
                        </Link>
                        <form action={deleteDownload}>
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className="inline-flex size-8 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive-soft" aria-label="删除">
                            <Trash2 className="size-3.5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </>
  );
}
