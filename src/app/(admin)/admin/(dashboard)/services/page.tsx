import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteService } from "@/lib/admin-actions";
import { AdminCard, AdminPageHeader, EmptyState, SetupNotice, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="业务能力" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:push 后即可管理业务能力。</p>
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
        description="首页与业务页展示的五项核心能力。"
        action={
          <Link href="/admin/services/new" className="btn btn-primary h-10 px-4">
            <Plus className="size-4" />
            新建业务
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="还没有业务项" description="创建第一项业务能力，或运行 pnpm db:seed 导入内置示例。" />
      ) : (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1b1f27]">
                  {["名称", "图标", "排序", "状态", "操作"].map((head) => (
                    <th key={head} className="px-4 py-3 text-left font-mono text-[0.625rem] tracking-[0.14em] text-[#5c6472] uppercase whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#1b1f27] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="font-medium text-[#e8ebf0]">{row.titleZh}</span>
                      <span className="mt-1 block font-mono text-[0.625rem] text-[#5c6472]">/{row.slug}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#8a929e]">{row.icon ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#8a929e]">{row.sortOrder}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.published ? "PUBLISHED" : "DRAFT"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/services/${row.id}`} className="inline-flex size-8 items-center justify-center rounded border border-[#1b1f27] text-[#8a929e] transition-colors hover:border-[#22e0ff]/40 hover:text-[#22e0ff]" aria-label="编辑">
                          <Edit3 className="size-3.5" />
                        </Link>
                        <form action={deleteService}>
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className="inline-flex size-8 items-center justify-center rounded border border-[#1b1f27] text-[#8a929e] transition-colors hover:border-[#ff4d4f]/40 hover:text-[#ff8a8c]" aria-label="删除">
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
