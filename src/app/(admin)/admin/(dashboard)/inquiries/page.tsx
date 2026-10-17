import Link from "next/link";
import { Building2, Mail, Phone, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteInquiry, updateInquiry } from "@/lib/admin-actions";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPageHeader, EmptyState, SetupNotice, StatusPill, iconDanger } from "@/components/admin/ui";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "IN_PROGRESS", "DONE", "SPAM"] as const;

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const db = getPrisma();

  if (!db) {
    return (
      <>
        <AdminPageHeader title="客户询盘" />
        <SetupNotice title="数据库尚未连接">
          <p>配置 DATABASE_URL 并执行 pnpm db:deploy 后即可查看客户询盘。</p>
        </SetupNotice>
      </>
    );
  }

  const filter = status && (STATUSES as readonly string[]).includes(status) ? status : undefined;

  let rows: Awaited<ReturnType<typeof db.inquiry.findMany>> = [];
  try {
    rows = await db.inquiry.findMany({
      where: filter ? { status: filter as (typeof STATUSES)[number] } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch {
    rows = [];
  }

  return (
    <>
      <AdminPageHeader title="客户询盘" description="来自官网表单、资料下载与订阅的全部留言。" />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href="/admin/inquiries"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
            !filter ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-white"
          )}
        >
          全部
        </Link>
        {STATUSES.map((entry) => (
          <Link
            key={entry}
            href={`/admin/inquiries?status=${entry}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              filter === entry ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-white"
            )}
          >
            {entry === "NEW" ? "新询盘" : entry === "IN_PROGRESS" ? "跟进中" : entry === "DONE" ? "已完成" : "垃圾信息"}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="暂无询盘" description="当访客提交联系表单后，会显示在这里。" />
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <Card key={row.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-semibold text-white">{row.name}</span>
                    <StatusPill status={row.status} />
                    <span className="font-mono text-[0.625rem] text-faint">{formatDate(row.createdAt)}</span>
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.5625rem] text-faint">
                      {row.source}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    {row.company ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        {row.company}
                      </span>
                    ) : null}
                    {row.phone ? (
                      <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                        <Phone className="size-3.5" />
                        {row.phone}
                      </a>
                    ) : null}
                    {row.email ? (
                      <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                        <Mail className="size-3.5" />
                        {row.email}
                      </a>
                    ) : null}
                    {row.service ? (
                      <span className="rounded-full border border-border px-2 py-0.5">意向：{row.service}</span>
                    ) : null}
                  </div>

                  <p className="mt-4 rounded-(--radius) border border-border bg-surface p-4 text-sm leading-relaxed whitespace-pre-wrap text-body">
                    {row.message}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 lg:w-52">
                  <ActionForm action={updateInquiry} showSummary={false} className="space-y-2">
                    <input type="hidden" name="id" value={row.id} />
                    <Select name="status" defaultValue={row.status}>
                      <SelectTrigger className="h-9 text-xs" aria-label="状态">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((entry) => (
                          <SelectItem key={entry} value={entry} className="text-xs">
                            {entry === "NEW" ? "新询盘" : entry === "IN_PROGRESS" ? "跟进中" : entry === "DONE" ? "已完成" : "垃圾信息"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input name="note" defaultValue={row.note ?? ""} placeholder="跟进备注…" aria-label="跟进备注" className="h-9 text-xs" />
                    <SubmitButton size="sm" className="h-9 w-full">
                      更新状态
                    </SubmitButton>
                  </ActionForm>

                  <ConfirmAction
                    action={deleteInquiry}
                    id={row.id}
                    title="删除询盘"
                    description={`确定删除询盘「${row.name}」吗？此操作不可撤销。`}
                    triggerLabel="删除"
                    triggerClassName={cn(iconDanger, "h-9 w-full gap-1.5 text-xs")}
                  >
                    <Trash2 className="size-3.5" />
                      删除
                  </ConfirmAction>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
