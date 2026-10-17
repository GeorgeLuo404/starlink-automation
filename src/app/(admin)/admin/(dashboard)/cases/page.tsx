import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteCase } from "@/lib/admin-actions";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { AdminCard, AdminPageHeader, EmptyState, SetupNotice, StatusPill } from "@/components/admin/ui";

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
          <Link href="/admin/cases/new" className="btn btn-primary h-10 px-4">
            <Plus className="size-4" />
            新建案例
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="还没有案例" description="创建第一个项目案例，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["项目", "行业", "年份", "状态", "操作"].map((head) => (
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
                      <span className="line-clamp-1 font-medium text-foreground">{row.titleZh}</span>
                      <span className="mt-1 block font-mono text-[0.625rem] text-faint">/{row.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.industryZh ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.year ?? "—"}</td>
                    <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/cases/${row.id}`} className="inline-flex size-8 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary" aria-label="编辑">
                          <Edit3 className="size-3.5" />
                        </Link>
                        <ConfirmAction
                          action={deleteCase}
                          id={row.id}
                          title="删除案例"
                          description={`确定删除案例「${row.titleZh}」吗？此操作不可撤销。`}
                          triggerLabel="删除"
                          triggerClassName="inline-flex size-8 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive-soft"
                        >
                          <Trash2 className="size-3.5" />
                        </ConfirmAction>
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
