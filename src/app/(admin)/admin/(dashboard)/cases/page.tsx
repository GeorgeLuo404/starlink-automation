import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteCase } from "@/lib/admin-actions";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader, EmptyState, SetupNotice, StatusPill, iconAction, iconDanger } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminCasesPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="项目案例" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理案例。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: Awaited<ReturnType<typeof db.project.findMany>> = [];
  try {
    rows = await db.project.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader
        title="项目案例"
        description="展示交付过的真实项目，含行业、成果指标与现场影像。"
        action={
          <Button asChild className="px-4">
            <Link href="/admin/cases/new">
              <Plus className="size-4" />
              新建案例
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="还没有案例" description="创建第一个项目案例，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {["项目", "行业", "年份", "状态", "操作"].map((head) => (
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
                    <span className="line-clamp-1 font-medium text-foreground">{row.titleZh}</span>
                    <span className="mt-1 block font-mono text-[0.625rem] text-faint">/{row.slug}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.industryZh ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.year ?? "—"}</TableCell>
                  <TableCell><StatusPill status={row.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/cases/${row.id}`} className={iconAction} aria-label="编辑">
                        <Edit3 className="size-3.5" />
                      </Link>
                      <ConfirmAction
                        action={deleteCase}
                        id={row.id}
                        title="删除案例"
                        description={`确定删除案例「${row.titleZh}」吗？此操作不可撤销。`}
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
