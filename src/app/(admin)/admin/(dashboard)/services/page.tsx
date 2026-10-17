import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteService } from "@/lib/admin-actions";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader, EmptyState, SetupNotice, StatusPill, iconAction, iconDanger } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="业务能力" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理业务能力。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: Awaited<ReturnType<typeof db.service.findMany>> = [];
  try {
    rows = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader
        title="业务能力"
        description="首页与业务页展示的核心能力。"
        action={
          <Button asChild className="px-4">
            <Link href="/admin/services/new">
              <Plus className="size-4" />
              新建业务
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="还没有业务项" description="创建第一项业务能力，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {["名称", "图标", "排序", "状态", "操作"].map((head) => (
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
                    <span className="mt-1 block font-mono text-[0.625rem] text-faint">/{row.slug}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.icon ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.sortOrder}</TableCell>
                  <TableCell>
                    <StatusPill status={row.published ? "PUBLISHED" : "DRAFT"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/services/${row.id}`} className={iconAction} aria-label="编辑">
                        <Edit3 className="size-3.5" />
                      </Link>
                      <ConfirmAction
                        action={deleteService}
                        id={row.id}
                        title="删除业务"
                        description={`确定删除业务「${row.titleZh}」吗？此操作不可撤销。`}
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
