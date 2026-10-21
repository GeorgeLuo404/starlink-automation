"use client";

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  FlexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/*
 * Admin list table — shadcn/ui's Data Table pattern on TanStack Table v9:
 * search, column filters, sortable headers and pagination, all client-side
 * (the lists are small; the server sends every row).
 */

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime, text: sortFn_text },
  filterFns: { includesString: filterFn_includesString, equalsString: filterFn_equalsString },
  columnMeta: {} as { className?: string },
});

type Features = typeof dataTableFeatures;

/** Column helper bound to the admin table features. */
export const columnsFor = <TData extends RowData>() => createColumnHelper<Features, TData>();

export type DataTableFilter = {
  /** Column id; the column needs `filterFn: "equalsString"`. */
  column: string;
  label: string;
  options: { value: string; label: string }[];
};

const ALL = "__all__";
const PAGE_SIZES = [10, 20, 50];

export function DataTable<TData extends RowData>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "搜索标题…",
  filters = [],
  initialSorting = [],
}: {
  data: TData[];
  columns: ColumnDef<Features, TData, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  getRowId: (row: TData) => string;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  initialSorting?: SortingState;
}) {
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId: (row) => getRowId(row),
    globalFilterFn: "includesString",
    initialState: { sorting: initialSorting, pagination: { pageIndex: 0, pageSize: PAGE_SIZES[1] } },
  });

  const { pageIndex, pageSize } = table.state.pagination;
  const filtered = table.getFilteredRowModel().rows.length;
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
          <Input
            value={String(table.state.globalFilter ?? "")}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 pl-9"
          />
        </div>
        {filters.map((filter) => {
          const column = table.getColumn(filter.column);
          return (
            <Select
              key={filter.column}
              value={String(column?.getFilterValue() ?? ALL)}
              onValueChange={(value) => column?.setFilterValue(value === ALL ? undefined : value)}
            >
              <SelectTrigger size="sm" className="h-9 sm:w-36" aria-label={filter.label}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>全部{filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
        <p className="font-mono text-[0.6875rem] text-faint tabular-nums sm:ml-auto">
          {filtered === data.length ? `共 ${data.length} 条` : `筛选出 ${filtered} / ${data.length} 条`}
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.className}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-1 uppercase transition-colors hover:text-foreground"
                        >
                          <FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3 text-primary" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3 text-primary" />
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-50" />
                          )}
                        </button>
                      ) : (
                        <FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  没有符合条件的记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {filtered > PAGE_SIZES[0] ? (
        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>每页</span>
            <Select value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
              <SelectTrigger size="sm" className="w-18" aria-label="每页条数">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="font-mono tabular-nums">
            第 {pageIndex + 1} / {Math.max(1, table.getPageCount())} 页
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="上一页"
            >
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="下一页">
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Small cover thumbnail for a table row; a dashed box when there is none. */
export function RowThumb({ src }: { src: string | null }) {
  return (
    <span
      className={cn(
        "relative block aspect-video w-16 shrink-0 overflow-hidden rounded-[calc(var(--radius)-0.375rem)] border bg-raised",
        src ? "border-border" : "border-dashed border-border"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" loading="lazy" className="size-full object-cover" /> : null}
    </span>
  );
}
