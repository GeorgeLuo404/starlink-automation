"use client";

import Link from "next/link";
import { DndContext } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit3, GripVertical, Trash2 } from "lucide-react";
import { deleteGalleryItem, reorderList } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { StatusPill } from "@/components/admin/ui";
import { useReorder } from "@/components/admin/use-reorder";

export type GalleryRow = { id: string; title: string; url: string; album: string; status: string };

/** 现场图库 in the admin: a grid of cards in the 前台 order; drag a card's handle to move it. */
export function GalleryGrid({ rows }: { rows: GalleryRow[] }) {
  const { items, dndProps } = useReorder({
    rows,
    getId: (row) => row.id,
    label: (row) => row.title,
    save: (ids) => reorderList("galleryItem", ids),
  });

  return (
    <>
      <DndContext {...dndProps}>
        <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <GalleryCard key={item.id} item={item} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <p className="mt-4 text-xs text-faint">拖动卡片左下角的手柄调整顺序，松手即保存；前台图库按这个顺序展示。</p>
    </>
  );
}

function GalleryCard({ item }: { item: GalleryRow }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group relative overflow-hidden rounded-(--radius) border bg-card",
        isDragging ? "z-10 border-primary/60 shadow-lg" : "border-border"
      )}
    >
      <div className="relative aspect-4/3 bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.title} className="size-full object-cover" />
        {/* opacity-0 still receives clicks, so keep it inert until hovered */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          <Link href={`/admin/gallery/${item.id}`} className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10" aria-label="编辑">
            <Edit3 className="size-3.5" />
          </Link>
          <ConfirmAction
            action={deleteGalleryItem}
            id={item.id}
            title="删除图片"
            description={`确定删除图片「${item.title}」吗？此操作不可撤销。`}
            triggerLabel="删除"
            triggerClassName="inline-flex size-9 items-center justify-center rounded-full border border-destructive/40 text-destructive-soft hover:bg-destructive/15"
          >
            <Trash2 className="size-3.5" />
          </ConfirmAction>
        </div>
      </div>
      <div className="flex items-start gap-1.5 p-3 pl-1.5">
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`拖动排序：${item.title}`}
          className="inline-flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-faint transition-colors hover:bg-raised hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="min-w-0 flex-1 pt-1">
          <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="truncate font-mono text-[0.5625rem] text-faint">{item.album}</span>
            <StatusPill status={item.status} />
          </div>
        </div>
      </div>
    </li>
  );
}
