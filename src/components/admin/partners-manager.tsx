"use client";

import { startTransition, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit3, GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePartner, reorderList, savePartner, setPartnerActive } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";
import { useReorder } from "@/components/admin/use-reorder";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { FormField } from "@/components/admin/form-fields";
import { EmptyState, iconAction, iconDanger } from "@/components/admin/ui";
import { UploadField } from "@/components/admin/upload-field";
import { BrandMark } from "@/components/site/brand-mark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type PartnerRow = { id: string; name: string; nameZh: string | null; logoUrl: string | null; active: boolean };

const LOGO_ACCEPT = "image/svg+xml,image/png,image/webp";
/** Same shape the server accepts; anything else (half-typed) is not previewed. */
const LINK_RE = /^(https?:\/\/|\/)\S+$/i;

/**
 * 品牌平台: the brands in the homepage row, on the 首页 editor's brands tab.
 * Drag the grip to reorder (saved on drop), flip the switch to hide a brand
 * without deleting it, add or edit in a dialog.
 */
export function PartnersManager({ rows }: { rows: PartnerRow[] }) {
  // A drag or a switch shows at once (local copy, see useReorder).
  const { items, setItems, dndProps } = useReorder({
    rows,
    getId: (row) => row.id,
    label: (row) => row.name,
    save: (ids) => reorderList("partner", ids),
  });
  const [editing, setEditing] = useState<PartnerRow | "new" | null>(null);

  function setActive(id: string, active: boolean) {
    const before = items;
    setItems((list) => list.map((item) => (item.id === id ? { ...item, active } : item)));
    startTransition(async () => {
      const result = await setPartnerActive(id, active);
      if (!result.ok) {
        setItems(before);
        toast.error(result.message ?? "保存失败");
      }
    });
  }

  const addButton = (
    <Button className="px-4" onClick={() => setEditing("new")}>
      <Plus className="size-4" />
      新增品牌
    </Button>
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">品牌列表</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">首页滚动展示的品牌 Logo 与中文名。</p>
        </div>
        {items.length ? addButton : null}
      </div>

      {items.length === 0 ? (
        <EmptyState title="还没有品牌" description="添加品牌与 Logo 后，首页会以跑马灯形式展示。" action={addButton} />
      ) : (
        <>
          <DndContext {...dndProps}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <PartnerItem
                    key={item.id}
                    item={item}
                    index={index}
                    onEdit={() => setEditing(item)}
                    onActiveChange={(active) => setActive(item.id, active)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          <p className="mt-4 text-xs text-faint">拖动左侧手柄调整顺序，松手即保存；关闭开关可在首页隐藏该品牌而不删除。</p>
        </>
      )}

      <PartnerDialog target={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function PartnerItem({
  item,
  index,
  onEdit,
  onActiveChange,
}: {
  item: PartnerRow;
  index: number;
  onEdit: () => void;
  onActiveChange: (active: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative flex flex-wrap items-center gap-x-3 gap-y-2 rounded-(--radius) border bg-card py-2.5 pr-3 pl-2 sm:flex-nowrap sm:gap-4 sm:pr-4",
        isDragging ? "z-10 border-primary/60 shadow-lg" : "border-border"
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`拖动排序：${item.name}`}
        className="inline-flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-faint transition-colors hover:bg-raised hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="hidden w-5 shrink-0 font-mono text-[0.625rem] text-faint tabular-nums sm:block">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* As it looks on the homepage: single-colour on black. */}
      <span
        className={cn(
          "theme-dark flex h-12 w-28 shrink-0 items-center justify-center rounded-md border border-border px-3 sm:w-36",
          !item.active && "opacity-40"
        )}
      >
        {item.logoUrl ? (
          <BrandMark name={item.name} logoUrl={item.logoUrl} className="h-7 w-full" />
        ) : (
          <span className="text-[0.625rem] text-faint">无 Logo</span>
        )}
      </span>

      <div className="min-w-24 flex-1">
        <p className="truncate font-mono text-sm tracking-wide text-foreground">{item.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.nameZh || "—"}</p>
      </div>

      {/* Wraps under the name on narrow screens. */}
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          {item.active ? "首页显示" : "已隐藏"}
          <Switch checked={item.active} onCheckedChange={onActiveChange} aria-label={`在首页显示 ${item.name}`} />
        </label>
        <button type="button" onClick={onEdit} className={iconAction} aria-label={`编辑 ${item.name}`}>
          <Edit3 className="size-3.5" />
        </button>
        <ConfirmAction
          action={deletePartner}
          id={item.id}
          title="删除品牌"
          description={`确定删除「${item.name}」吗？此操作不可撤销。只想暂时不展示的话，关闭开关即可。`}
          triggerLabel={`删除 ${item.name}`}
          triggerClassName={iconDanger}
        >
          <Trash2 className="size-3.5" />
        </ConfirmAction>
      </div>
    </li>
  );
}

function PartnerDialog({ target, onClose }: { target: PartnerRow | "new" | null; onClose: () => void }) {
  // Keep showing the last record while the dialog animates closed.
  const [shown, setShown] = useState(target);
  if (target !== null && target !== shown) setShown(target);
  const record = shown === "new" ? null : shown;

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record ? `编辑「${record.name}」` : "新增品牌"}</DialogTitle>
          <DialogDescription>Logo 与中文名会显示在首页「支持的品牌与平台」中。</DialogDescription>
        </DialogHeader>
        {shown !== null ? <PartnerForm key={record?.id ?? "new"} record={record} onSaved={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function PartnerForm({ record, onSaved }: { record: PartnerRow | null; onSaved: () => void }) {
  const [logoUrl, setLogoUrl] = useState(record?.logoUrl ?? "");
  const [name, setName] = useState(record?.name ?? "");
  const [nameZh, setNameZh] = useState(record?.nameZh ?? "");

  return (
    <ActionForm
      action={savePartner}
      onSuccess={(state) => {
        toast.success(state.message ?? "已保存");
        onSaved();
      }}
    >
      <DialogBody className="space-y-6">
        {record ? <input type="hidden" name="id" value={record.id} /> : null}
        {/* The text fields stay uncontrolled; this only mirrors them into the preview. */}
        <div
          className="grid gap-4 sm:grid-cols-2"
          onInput={(event) => {
            const input = event.target as HTMLInputElement;
            if (input.name === "name") setName(input.value);
            if (input.name === "nameZh") setNameZh(input.value);
          }}
        >
          <FormField
            label="名称"
            name="name"
            required
            defaultValue={record?.name}
            placeholder="SIEMENS"
            description="没有 Logo 时直接显示这段文字。"
          />
          <FormField label="品牌中文名" name="nameZh" defaultValue={record?.nameZh} placeholder="西门子（可留空）" description="显示在 Logo 下方。" />
        </div>

        <UploadField
          name="logoUrl"
          label="Logo"
          value={logoUrl}
          onValueChange={setLogoUrl}
          folder="brands"
          accept={LOGO_ACCEPT}
          logo
          description="用透明背景的 SVG 或 PNG：首页会把 Logo 统一显示为白色，带底色的图片会变成一个白色方块。"
        />

        <div>
          {/* Captions a preview, not a form control, so not a <label>. */}
          <Label asChild>
            <span>首页效果</span>
          </Label>
          <div className="theme-dark flex min-h-36 flex-col items-center justify-center gap-4 rounded-(--radius) border border-border px-6 py-8">
            <BrandMark name={name.trim() || "品牌名称"} logoUrl={LINK_RE.test(logoUrl) ? logoUrl : null} />
            {nameZh.trim() ? <span className="text-base text-muted-foreground">{nameZh.trim()}</span> : null}
          </div>
        </div>
      </DialogBody>
      <DialogFooter className="border-t border-border p-5">
        <DialogClose asChild>
          <Button type="button" variant="ghost">
            取消
          </Button>
        </DialogClose>
        <SubmitButton className="px-6">{record ? "保存" : "添加"}</SubmitButton>
      </DialogFooter>
    </ActionForm>
  );
}
