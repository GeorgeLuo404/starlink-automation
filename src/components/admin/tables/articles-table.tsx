"use client";

import Link from "next/link";
import { Edit3, Trash2 } from "lucide-react";
import { deleteArticle, setArticleStatus } from "@/lib/admin-actions";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { columnsFor, DataTable, RowThumb } from "@/components/admin/data-table";
import { iconAction, iconDanger, publishStatusOptions, StatusPill } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  pinned: boolean;
  publishedAt: Date | null;
  viewCount: number;
  cover: string | null;
  mediaCount: number;
};

const col = columnsFor<ArticleRow>();

const columns = col.columns([
  col.accessor("title", {
    header: "标题",
    meta: { className: "min-w-72" },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <RowThumb src={row.original.cover} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="line-clamp-1 font-medium text-foreground">{row.original.title}</span>
            {row.original.pinned ? (
              <span className="shrink-0 rounded-full border border-primary/30 px-2 py-0.5 font-mono text-[0.5625rem] text-primary">置顶</span>
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
  col.accessor("status", {
    header: "状态",
    filterFn: "equalsString",
    cell: ({ getValue }) => <StatusPill status={getValue()} />,
  }),
  // Rows arrive newest first (see the admin page). Drafts have no date yet:
  // they stay on top whichever way the dates are sorted here.
  col.accessor((row) => row.publishedAt ?? undefined, {
    id: "publishedAt",
    header: "发布日期",
    sortFn: "datetime",
    sortUndefined: "first",
    enableGlobalFilter: false,
    cell: ({ getValue }) => formatDate(getValue()) || "—",
    meta: { className: "whitespace-nowrap font-mono text-xs text-muted-foreground" },
  }),
  col.accessor("viewCount", {
    header: "阅读",
    enableGlobalFilter: false,
    meta: { className: "whitespace-nowrap font-mono text-xs text-muted-foreground" },
  }),
  col.display({
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const article = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <Link href={`/admin/articles/${article.id}`} className={iconAction} aria-label="编辑">
            <Edit3 className="size-3.5" />
          </Link>
          <ActionForm action={setArticleStatus} showSummary={false}>
            <input type="hidden" name="id" value={article.id} />
            <input type="hidden" name="status" value={article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} />
            <SubmitButton variant="outline" size="sm" className="h-8 px-2.5 font-mono text-[0.625rem]">
              {article.status === "PUBLISHED" ? "下架" : "发布"}
            </SubmitButton>
          </ActionForm>
          <ConfirmAction
            action={deleteArticle}
            id={article.id}
            title="删除文章"
            description={`确定删除文章「${article.title}」吗？此操作不可撤销。`}
            triggerLabel="删除"
            triggerClassName={iconDanger}
          >
            <Trash2 className="size-3.5" />
          </ConfirmAction>
        </div>
      );
    },
  }),
]);

export function ArticlesTable({ rows }: { rows: ArticleRow[] }) {
  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      searchPlaceholder="搜索标题…"
      filters={[{ column: "status", label: "状态", options: publishStatusOptions }]}
    />
  );
}
