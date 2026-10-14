"use client";

import { useMemo, useState } from "react";
import { Copy, FileText, Film, Image as ImageIcon, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { deleteMediaAsset } from "@/lib/admin-actions";

export type MediaRow = {
  id: string;
  url: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  kind: string;
  size: number;
  folder: string;
  alt: string | null;
  createdAt: string;
};

export function MediaGrid({ rows }: { rows: MediaRow[] }) {
  const [kind, setKind] = useState<"ALL" | "IMAGE" | "VIDEO" | "DOCUMENT">("ALL");
  const [folder, setFolder] = useState("ALL");
  const [query, setQuery] = useState("");

  const folders = useMemo(() => ["ALL", ...new Set(rows.map((row) => row.folder))], [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (kind !== "ALL" && row.kind !== kind) return false;
        if (folder !== "ALL" && row.folder !== folder) return false;
        if (query && !row.originalName.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [rows, kind, folder, query]
  );

  const kinds: { key: typeof kind; label: string; icon: typeof ImageIcon }[] = [
    { key: "ALL", label: "全部", icon: Search },
    { key: "IMAGE", label: "图片", icon: ImageIcon },
    { key: "VIDEO", label: "视频", icon: Film },
    { key: "DOCUMENT", label: "文档", icon: FileText },
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {kinds.map((entry) => {
            const Icon = entry.icon;
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => setKind(entry.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  kind === entry.key
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-white"
                )}
              >
                <Icon className="size-3.5" />
                {entry.label}
              </button>
            );
          })}
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="field h-8 w-auto py-0 text-xs"
            aria-label="目录"
          >
            {folders.map((name) => (
              <option key={name} value={name}>
                {name === "ALL" ? "全部目录" : name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文件名…"
            className="field h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-(--radius) border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">没有匹配的资源</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((row) => (
            <div key={row.id} className="group overflow-hidden rounded-(--radius) border border-border bg-card">
              <div className="relative aspect-4/3 bg-surface">
                {row.kind === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.url} alt={row.alt ?? row.originalName} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-faint">
                    {row.kind === "VIDEO" ? <Film className="size-6" strokeWidth={1.4} /> : <FileText className="size-6" strokeWidth={1.4} />}
                    <span className="font-mono text-[0.625rem] uppercase">{row.mimeType.split("/")[1] ?? "file"}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(row.url);
                      toast.success("已复制链接 / URL copied");
                    }}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                    aria-label="复制链接"
                  >
                    <Copy className="size-3.5" />
                  </button>
                  <form action={deleteMediaAsset}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="storageKey" value={row.storageKey} />
                    <input type="hidden" name="redirectTo" value="/admin/media" />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm("删除该资源？此操作不可撤销。")) e.preventDefault();
                      }}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-destructive/40 text-destructive-soft transition-colors hover:bg-destructive/15"
                      aria-label="删除"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </form>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-foreground" title={row.originalName}>
                  {row.originalName}
                </p>
                <div className="mt-1.5 flex items-center justify-between font-mono text-[0.5625rem] text-faint">
                  <span>{formatBytes(row.size)}</span>
                  <span>{formatDate(row.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
