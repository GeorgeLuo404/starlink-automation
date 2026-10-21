"use client";

import Link from "next/link";
import { Edit3, Trash2 } from "lucide-react";
import { deleteDownload } from "@/lib/admin-actions";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { columnsFor, DataTable } from "@/components/admin/data-table";
import { iconAction, iconDanger, publishStatusOptions, StatusPill } from "@/components/admin/ui";
import { formatBytes } from "@/lib/utils";

export type DownloadRow = {
  id: string;
  title: string;
  slug: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
  status: string;
};

const col = columnsFor<DownloadRow>();

const columns = col.columns([
  col.accessor("title", {
    header: "资料",
    meta: { className: "min-w-60" },
    cell: ({ row }) => (
      <>
        <span className="font-medium text-foreground">{row.original.title}</span>
        <span className="mt-1 block font-mono text-[0.625rem] text-faint">{row.original.slug}</span>
      </>
    ),
  }),
  col.accessor("fileType", {
    header: "类型",
    filterFn: "equalsString",
    meta: { className: "whitespace-nowrap font-mono text-xs text-primary" },
  }),
  col.accessor("fileSize", {
    header: "大小",
    enableGlobalFilter: false,
    cell: ({ getValue }) => formatBytes(getValue()),
    meta: { className: "whitespace-nowrap font-mono text-xs text-muted-foreground" },
  }),
  col.accessor("downloadCount", {
    header: "下载",
    enableGlobalFilter: false,
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
        <Link href={`/admin/downloads/${row.original.id}`} className={iconAction} aria-label="编辑">
          <Edit3 className="size-3.5" />
        </Link>
        <ConfirmAction
          action={deleteDownload}
          id={row.original.id}
          title="删除资料"
          description={`确定删除资料「${row.original.title}」吗？此操作不可撤销。`}
          triggerLabel="删除"
          triggerClassName={iconDanger}
        >
          <Trash2 className="size-3.5" />
        </ConfirmAction>
      </div>
    ),
  }),
]);

export function DownloadsTable({ rows }: { rows: DownloadRow[] }) {
  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchPlaceholder="搜索资料…"
      filters={[
        { column: "fileType", label: "类型", options: [...new Set(rows.map((row) => row.fileType))].map((type) => ({ value: type, label: type })) },
        { column: "status", label: "状态", options: publishStatusOptions },
      ]}
    />
  );
}
