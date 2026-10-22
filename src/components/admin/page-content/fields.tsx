"use client";

import { useId, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import type { Field, IllustrationField, ItemField, ListField } from "@/content/page-sections";
import { STEP_ART_GROUPS, STEP_ART_OPTIONS } from "@/content/step-art";
import { cn } from "@/lib/utils";
import { FieldError, useFieldError, useFormErrors } from "@/components/admin/action-form";
import { UploadField } from "@/components/admin/upload-field";
import { stepArtFor } from "@/components/site/home/step-art";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/*
 * Inputs for the page-content editor, one per field kind (see
 * src/content/page-sections.ts). Values are kept as the inputs show them —
 * numbers and one-per-line lists as text — and converted when saving.
 */

export type Draft = Record<string, unknown> & { _id?: string };

let seq = 0;
const newId = () => `item-${++seq}`;

/** Saved content → editable draft. */
export function toDraft(fields: readonly Field[], value: Record<string, unknown>): Draft {
  return Object.fromEntries(fields.map((field) => [field.name, draftOf(field, value[field.name])]));
}

function draftOf(field: Field, value: unknown): unknown {
  switch (field.kind) {
    case "lines":
      return Array.isArray(value) ? value.join("\n") : "";
    case "number":
      return typeof value === "number" ? String(value) : "";
    case "list":
      return (Array.isArray(value) ? value : []).map((item) => ({ _id: newId(), ...toDraft(field.fields, item ?? {}) }));
    default:
      return typeof value === "string" ? value : "";
  }
}

/** Draft → the content that gets saved (and validated on the server). */
export function fromDraft(fields: readonly Field[], draft: Draft): Record<string, unknown> {
  return Object.fromEntries(fields.map((field) => [field.name, valueOf(field, draft[field.name])]));
}

function valueOf(field: Field, draft: unknown): unknown {
  switch (field.kind) {
    case "lines":
      return String(draft ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    case "number": {
      const text = String(draft ?? "").trim();
      // null fails validation with "请填写…", which is what an empty box means
      return text === "" || !Number.isFinite(Number(text)) ? null : Number(text);
    }
    case "list":
      return (draft as Draft[]).map((item) => fromDraft(field.fields, item));
    default:
      return String(draft ?? "").trim();
  }
}

/** One field: label, input, hint, inline error. */
export function FieldInput({
  field,
  path,
  value,
  onChange,
}: {
  field: Field;
  /** Field path as the server reports errors: "title", "steps.2.desc". */
  path: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.kind === "list") {
    return <ListInput field={field} path={path} items={value as Draft[]} onChange={onChange} />;
  }
  if (field.kind === "illustration") {
    return <IllustrationInput field={field} value={String(value ?? "")} onChange={onChange} />;
  }
  if (field.kind === "image") {
    return (
      <div className="sm:col-span-2">
        <UploadField
          name={path}
          label={field.label}
          value={String(value ?? "")}
          onValueChange={onChange}
          folder={field.folder}
          accept="image/*"
          description={field.hint}
        />
      </div>
    );
  }
  return <ScalarInput field={field} path={path} value={String(value ?? "")} onChange={onChange} />;
}

function ScalarInput({
  field,
  path,
  value,
  onChange,
}: {
  field: Exclude<ItemField, IllustrationField>;
  path: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const error = useFieldError(path);
  const invalid = error ? { "aria-invalid": true, "aria-describedby": `${path}-error` } : {};
  const max = field.kind === "text" || field.kind === "textarea" ? field.max : undefined;
  const half = (field.kind === "text" || field.kind === "number") && field.half;

  return (
    <div className={half ? undefined : "sm:col-span-2"}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>
          {field.label} {field.required ? <span className="text-destructive">*</span> : null}
        </Label>
        {max ? (
          <span className={cn("mb-2 font-mono text-[0.625rem] tabular-nums", value.length > max ? "text-destructive-soft" : "text-faint")}>
            {value.length} / {max}
          </span>
        ) : null}
      </div>
      {field.kind === "text" ? (
        <Input id={id} value={value} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} {...invalid} />
      ) : field.kind === "number" ? (
        <Input id={id} type="number" inputMode="numeric" value={value} min={field.min} max={field.max} onChange={(e) => onChange(e.target.value)} {...invalid} />
      ) : (
        <Textarea
          id={id}
          value={value}
          rows={field.kind === "lines" ? Math.min(Math.max(value.split("\n").length, 3), 10) : (field.rows ?? 3)}
          className="min-h-0"
          onChange={(e) => onChange(e.target.value)}
          {...invalid}
        />
      )}
      <FieldError name={path} />
      {field.hint ? <p className="mt-2 text-xs text-faint">{field.hint}</p> : null}
    </div>
  );
}

/* ------------------------------ illustrations ------------------------------ */

/**
 * The current illustration as a small live preview; 选择插图 opens the whole
 * library (src/content/step-art.ts), every drawing animating, grouped.
 */
function IllustrationInput({ field, value, onChange }: { field: IllustrationField; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const Current = stepArtFor(value);
  const label = STEP_ART_OPTIONS.find((o) => o.key === value)?.label ?? "无插图";

  function pick(key: string) {
    onChange(key);
    setOpen(false);
  }

  return (
    <div className="sm:col-span-2">
      <Label>{field.label}</Label>
      <div className="flex items-center gap-4">
        <ArtFrame className="w-36 shrink-0">{Current ? <Current /> : <NoArt />}</ArtFrame>
        <div className="min-w-0">
          <p className="text-sm text-foreground">{label}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setOpen(true)}>
            选择插图
          </Button>
        </div>
      </div>
      {field.hint ? <p className="mt-2 text-xs text-faint">{field.hint}</p> : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>选择插图</DialogTitle>
            <DialogDescription>点一张即可选中。线稿会随网站配色显示，并循环播放动画。</DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[70dvh] space-y-6 overflow-y-auto">
            <div role="radiogroup" aria-label={field.label} className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <ArtOption label="无插图" selected={!value} onSelect={() => pick("")}>
                  <NoArt />
                </ArtOption>
              </div>
              {STEP_ART_GROUPS.map((group) => (
                <section key={group}>
                  <h3 className="mb-3 font-mono text-[0.625rem] tracking-[0.2em] text-faint uppercase">{group}</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {STEP_ART_OPTIONS.filter((o) => o.group === group).map((o) => {
                      const Art = stepArtFor(o.key)!;
                      return (
                        <ArtOption key={o.key} label={o.label} selected={value === o.key} onSelect={() => pick(o.key)}>
                          <Art />
                        </ArtOption>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** The illustration as the site shows it: drawn on the dark grid. */
function ArtFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "theme-dark grid-lines grid-lines-sm flex aspect-3/2 items-center justify-center rounded-md border border-border p-2 text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

function NoArt() {
  return <span className="text-xs text-faint">无插图</span>;
}

function ArtOption({ label, selected, onSelect, children }: { label: string; selected: boolean; onSelect: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "rounded-(--radius) border p-2 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        selected ? "border-primary bg-primary/6" : "border-border hover:border-foreground/30"
      )}
    >
      <ArtFrame>{children}</ArtFrame>
      <span className={cn("mt-2 flex items-center justify-between gap-2 text-xs", selected ? "text-primary" : "text-foreground")}>
        {label}
        {selected ? <Check className="size-3.5" /> : null}
      </span>
    </button>
  );
}

/* ---------------------------------- lists ---------------------------------- */

/**
 * Repeatable cards (steps, milestones …): drag the grip to reorder (mouse,
 * touch or keyboard), collapse to see the order at a glance.
 */
function ListInput({ field, path, items, onChange }: { field: ListField; path: string; items: Draft[]; onChange: (items: Draft[]) => void }) {
  const dndId = useId();
  const errors = useFormErrors();
  const listError = useFieldError(path);
  // Cards start folded when there are many, so the order is visible at a glance.
  const [open, setOpen] = useState<Set<string>>(() => new Set(items.length > 3 ? [] : items.map((item) => item._id!)));
  const max = field.max ?? 20;
  const min = field.min ?? 0;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const position = (id: UniqueIdentifier) => items.findIndex((item) => item._id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `已拿起第 ${position(active.id)} 个${field.itemLabel}`,
    onDragOver: ({ active, over }) => (over ? `第 ${position(active.id)} 个${field.itemLabel}移到第 ${position(over.id)} 位` : "不在列表内"),
    onDragEnd: ({ active, over }) => (over ? `第 ${position(active.id)} 个${field.itemLabel}已放到第 ${position(over.id)} 位` : "已放下"),
    onDragCancel: () => "已取消拖动，顺序未改变",
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) onChange(arrayMove(items, position(active.id) - 1, position(over.id) - 1));
  }

  function add() {
    const item: Draft = { _id: newId(), ...toDraft(field.fields, {}) };
    onChange([...items, item]);
    setOpen((set) => new Set(set).add(item._id!));
  }

  const toggle = (id: string) =>
    setOpen((set) => {
      const next = new Set(set);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <div className="sm:col-span-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label>
          {field.label} <span className="text-faint normal-case">· {items.length} / {max}</span>
        </Label>
        {items.length > 1 ? (
          <button
            type="button"
            onClick={() => setOpen(open.size ? new Set() : new Set(items.map((item) => item._id!)))}
            className="mb-2 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            {open.size ? "全部收起" : "全部展开"}
          </button>
        ) : null}
      </div>

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        accessibility={{
          announcements,
          screenReaderInstructions: { draggable: "按空格键拿起，用方向键移动，再按空格键放下；按 Esc 取消。" },
        }}
      >
        <SortableContext items={items.map((item) => item._id!)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2">
            {items.map((item, index) => (
              <ListItem
                key={item._id}
                field={field}
                path={`${path}.${index}`}
                index={index}
                item={item}
                open={open.has(item._id!)}
                hasError={Object.keys(errors ?? {}).some((key) => key.startsWith(`${path}.${index}.`))}
                canRemove={items.length > min}
                onToggle={() => toggle(item._id!)}
                onChange={(next) => onChange(items.map((it) => (it._id === item._id ? next : it)))}
                onRemove={() => onChange(items.filter((it) => it._id !== item._id))}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      {listError ? (
        <p role="alert" className="mt-2 text-xs text-destructive-soft">
          {listError}
        </p>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={items.length >= max}>
          <Plus />
          添加{field.itemLabel}
        </Button>
        {field.hint ? <p className="text-xs text-faint">{field.hint}</p> : null}
      </div>
    </div>
  );
}

function ListItem({
  field,
  path,
  index,
  item,
  open,
  hasError,
  canRemove,
  onToggle,
  onChange,
  onRemove,
}: {
  field: ListField;
  path: string;
  index: number;
  item: Draft;
  open: boolean;
  hasError: boolean;
  canRemove: boolean;
  onToggle: () => void;
  onChange: (item: Draft) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item._id! });
  // The first text fields make the folded card's summary: "2024 · 公司成立".
  const summary = field.fields
    .filter((f) => f.kind !== "lines")
    .slice(0, 2)
    .map((f) => String(item[f.name] ?? "").trim())
    .filter(Boolean)
    .join(" · ");
  const n = String(index + 1).padStart(2, "0");

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative rounded-(--radius) border bg-card",
        isDragging ? "z-10 border-primary/60 shadow-lg" : hasError ? "border-destructive/50" : "border-border"
      )}
    >
      <div className="flex items-center gap-2 py-2 pr-2 pl-1.5">
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`拖动排序：第 ${index + 1} 个${field.itemLabel}`}
          className="inline-flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-faint transition-colors hover:bg-raised hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1 text-left"
        >
          <span className="shrink-0 font-mono text-[0.625rem] text-faint tabular-nums">
            {field.itemLabel} {n}
          </span>
          <span className={cn("truncate text-sm", summary ? "text-foreground" : "text-faint")}>{summary || "未填写"}</span>
          {hasError ? <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-label="有错误" /> : null}
          <ChevronDown className={cn("ml-auto size-4 shrink-0 text-faint transition-transform", open && "rotate-180")} />
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`删除第 ${index + 1} 个${field.itemLabel}`}
          className="text-muted-foreground hover:text-destructive-soft"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      {open ? (
        <div className="grid grid-cols-1 gap-5 border-t border-border p-4 sm:grid-cols-2">
          {field.fields.map((f) => (
            <FieldInput
              key={f.name}
              field={f}
              path={`${path}.${f.name}`}
              value={item[f.name]}
              onChange={(value) => onChange({ ...item, [f.name]: value })}
            />
          ))}
        </div>
      ) : null}
    </li>
  );
}
