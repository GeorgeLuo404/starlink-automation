import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteDownload } from "@/lib/admin-actions";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader, EmptyState, SetupNotice, StatusPill, iconAction, iconDanger } from "@/components/admin/ui";
import { formatBytes } from "@/lib/utils";

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
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {["资料", "类型", "大小", "下载", "状态", "操作"].map((head) => (
                  <TableHead key={head}>
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <span className="font-medium text-foreground">{row.titleZh}</span>
                    <span className="mt-1 block font-mono text-[0.625rem] text-faint">{row.slug}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-primary">{row.fileType}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{formatBytes(row.fileSize)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.downloadCount}</TableCell>
                  <TableCell><StatusPill status={row.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/downloads/${row.id}`} className={iconAction} aria-label="编辑">
                        <Edit3 className="size-3.5" />
                      </Link>
                      <ConfirmAction
                        action={deleteDownload}
                        id={row.id}
                        title="删除资料"
                        description={`确定删除资料「${row.titleZh}」吗？此操作不可撤销。`}
                        triggerLabel="删除"
                        triggerClassName={iconDanger}
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmAction>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
