"use client";

import Link from "next/link";
import { Edit3, Trash2 } from "lucide-react";
import { deleteService } from "@/lib/admin-actions";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { columnsFor, DataTable, RowThumb } from "@/components/admin/data-table";
import { iconAction, iconDanger, StatusPill } from "@/components/admin/ui";

export type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  icon: string;
  sortOrder: number;
  /** PUBLISHED or DRAFT, derived from Service.published. */
  status: string;
  cover: string | null;
  mediaCount: number;
};

const col = columnsFor<ServiceRow>();

const columns = col.columns([
  col.accessor("title", {
    header: "名称",
    meta: { className: "min-w-60" },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <RowThumb src={row.original.cover} />
        <div className="min-w-0">
          <span className="line-clamp-1 font-medium text-foreground">{row.original.title}</span>
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
  col.accessor("icon", {
    header: "图标",
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
        <Link href={`/admin/services/${row.original.id}`} className={iconAction} aria-label="编辑">
          <Edit3 className="size-3.5" />
        </Link>
        <ConfirmAction
          action={deleteService}
          id={row.original.id}
          title="删除业务"
          description={`确定删除业务「${row.original.title}」吗？此操作不可撤销。`}
          triggerLabel="删除"
          triggerClassName={iconDanger}
        >
          <Trash2 className="size-3.5" />
        </ConfirmAction>
      </div>
    ),
  }),
]);

export function ServicesTable({ rows }: { rows: ServiceRow[] }) {
  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchPlaceholder="搜索业务…"
      filters={[
        {
          column: "status",
          label: "状态",
          options: [
            { value: "PUBLISHED", label: "已发布" },
            { value: "DRAFT", label: "草稿" },
          ],
        },
      ]}
    />
  );
}
