import { Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deletePartner, savePartner } from "@/lib/admin-actions";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Card } from "@/components/ui/card";
import { AdminPageHeader, EmptyState, SetupNotice, iconDanger } from "@/components/admin/ui";
import { FormField } from "@/components/admin/form-fields";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const db = getPrisma();
  if (!db) {
    return (
      <>
        <AdminPageHeader title="合作伙伴" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可管理合作伙伴。</p>
        </SetupNotice>
      </>
    );
  }

  let rows: Awaited<ReturnType<typeof db.partner.findMany>> = [];
  try {
    rows = await db.partner.findMany({ orderBy: { sortOrder: "asc" } });
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader title="合作伙伴" description="首页滚动展示的技术平台与品牌伙伴。" />

      <Card className="mb-8 p-6">
        <h2 className="text-sm font-semibold text-white">新增合作伙伴</h2>
        {/* Re-keyed by row count so the inputs clear after a partner is added. */}
        <ActionForm key={rows.length} action={savePartner} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="名称" name="name" required placeholder="SIEMENS" />
          <FormField label="品牌中文名" name="url" placeholder="西门子（可留空）" />
          <FormField label="Logo 地址" name="logoUrl" placeholder="https://…（可留空）" />
          <FormField label="排序" name="sortOrder" type="number" defaultValue={rows.length + 1} />
          <input type="hidden" name="active" value="on" />
          <div className="sm:col-span-2 lg:col-span-4">
            <SubmitButton>添加</SubmitButton>
          </div>
        </ActionForm>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="还没有合作伙伴" description="添加品牌名称后，首页会以跑马灯形式展示。" />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="font-mono text-sm tracking-wide text-foreground">{row.name}</span>
                  {row.url ? <span className="text-xs text-muted-foreground">{row.url}</span> : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.625rem] text-faint">#{row.sortOrder}</span>
                  <ConfirmAction
                    action={deletePartner}
                    id={row.id}
                    title="删除合作伙伴"
                    description={`确定删除合作伙伴「${row.name}」吗？此操作不可撤销。`}
                    triggerLabel="删除"
                    triggerClassName={iconDanger}
                  >
                    <Trash2 className="size-3.5" />
                  </ConfirmAction>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
