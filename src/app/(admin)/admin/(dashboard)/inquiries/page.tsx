import Link from "next/link";
import { Building2, Mail, Phone, Trash2 } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { deleteInquiry, updateInquiry } from "@/lib/admin-actions";
import { AdminCard, AdminPageHeader, EmptyState, SetupNotice, StatusPill } from "@/components/admin/ui";
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
          <p>配置 DATABASE_URL 并执行 pnpm db:push 后即可查看客户询盘。</p>
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
            !filter ? "border-[#22e0ff]/40 bg-[#22e0ff]/10 text-[#22e0ff]" : "border-[#1b1f27] text-muted-foreground hover:text-white"
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
              filter === entry ? "border-[#22e0ff]/40 bg-[#22e0ff]/10 text-[#22e0ff]" : "border-[#1b1f27] text-muted-foreground hover:text-white"
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
            <AdminCard key={row.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-semibold text-white">{row.name}</span>
                    <StatusPill status={row.status} />
                    <span className="font-mono text-[0.625rem] text-[#5c6472]">{formatDate(row.createdAt)}</span>
                    <span className="rounded-full border border-[#1b1f27] px-2 py-0.5 font-mono text-[0.5625rem] text-[#5c6472]">
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
                      <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#22e0ff]">
                        <Phone className="size-3.5" />
                        {row.phone}
                      </a>
                    ) : null}
                    {row.email ? (
                      <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1.5 hover:text-[#22e0ff]">
                        <Mail className="size-3.5" />
                        {row.email}
                      </a>
                    ) : null}
                    {row.service ? (
                      <span className="rounded-full border border-[#1b1f27] px-2 py-0.5">意向：{row.service}</span>
                    ) : null}
                  </div>

                  <p className="mt-4 rounded-(--radius) border border-[#1b1f27] bg-ink-900 p-4 text-sm leading-relaxed whitespace-pre-wrap text-[#c3c9d4]">
                    {row.message}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 lg:w-52">
                  <form action={updateInquiry} className="space-y-2">
                    <input type="hidden" name="id" value={row.id} />
                    <select name="status" defaultValue={row.status} className="field h-9 text-xs">
                      {STATUSES.map((entry) => (
                        <option key={entry} value={entry}>
                          {entry === "NEW" ? "新询盘" : entry === "IN_PROGRESS" ? "跟进中" : entry === "DONE" ? "已完成" : "垃圾信息"}
                        </option>
                      ))}
                    </select>
                    <input
                      name="note"
                      defaultValue={row.note ?? ""}
                      placeholder="跟进备注…"
                      className="field h-9 text-xs"
                    />
                    <button type="submit" className="btn btn-primary h-9 w-full px-3 text-xs">
                      更新状态
                    </button>
                  </form>

                  <form action={deleteInquiry}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-(--radius) border border-[#1b1f27] text-xs text-muted-foreground transition-colors hover:border-destructive/40 hover:text-[#ff8a8c]"
                    >
                      <Trash2 className="size-3.5" />
                      删除
                    </button>
                  </form>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </>
  );
}
