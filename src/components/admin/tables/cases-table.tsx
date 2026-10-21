"use client";

import Link from "next/link";
import { Edit3, Trash2 } from "lucide-react";
import { deleteCase } from "@/lib/admin-actions";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { columnsFor, DataTable, RowThumb } from "@/components/admin/data-table";
import { iconAction, iconDanger, publishStatusOptions, StatusPill } from "@/components/admin/ui";

export type CaseRow = {
  id: string;
  title: string;
  slug: string;
  industry: string;
  year: number;
  status: string;
  featured: boolean;
  sortOrder: number;
  cover: string | null;
  mediaCount: number;
};

const col = columnsFor<CaseRow>();

const columns = col.columns([
  col.accessor("title", {
    header: "项目",
    meta: { className: "min-w-64" },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <RowThumb src={row.original.cover} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="line-clamp-1 font-medium text-foreground">{row.original.title}</span>
            {row.original.featured ? (
              <span className="shrink-0 rounded-full border border-primary/30 px-2 py-0.5 font-mono text-[0.5625rem] text-primary">首页</span>
            ) : null}
          </div>
          <span className="mt-1 block truncate font-mono text-[0.625rem] text-faint">/{row.original.slug}</span>
        </div>
      </div>
    ),
  }),
  col.accessor("mediaCount", {
    header: "影像",
    cell: ({ getValue }) => (getValue() ? `${getValue()} 项` : "—"),
    meta: { className: "whitespace-nowrap font-mono text-xs text-muted-foreground" },
  }),
  col.accessor("industry", {
    header: "行业",
    cell: ({ getValue }) => getValue() || "—",
    meta: { className: "whitespace-nowrap text-muted-foreground" },
  }),
  col.accessor("year", {
    header: "年份",
    cell: ({ getValue }) => getValue() || "—",
    meta: { className: "whitespace-nowrap font-mono text-xs text-muted-foreground" },
  }),
  col.accessor("sortOrder", {
    header: "排序",
    meta: { className: "whitespace-nowrap font-mono text-xs text-muted-foreground" },
  }),
  col.accessor("status", {
    header: "状态",
    filterFn: "equalsString",
    cell: ({ getValue }) => <StatusPill status={getValue()} />,
  }),
  col.display({
    id: "actions",
    header: "操作",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Link href={`/admin/cases/${row.original.id}`} className={iconAction} aria-label="编辑">
          <Edit3 className="size-3.5" />
        </Link>
        <ConfirmAction
          action={deleteCase}
          id={row.original.id}
          title="删除案例"
          description={`确定删除案例「${row.original.title}」吗？此操作不可撤销。`}
          triggerLabel="删除"
          triggerClassName={iconDanger}
        >
          <Trash2 className="size-3.5" />
        </ConfirmAction>
      </div>
    ),
  }),
]);

export function CasesTable({ rows }: { rows: CaseRow[] }) {
  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchPlaceholder="搜索项目、行业…"
      filters={[{ column: "status", label: "状态", options: publishStatusOptions }]}
    />
  );
}
