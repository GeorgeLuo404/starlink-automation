"use client";

import { useEffect, useId, useRef, useState } from "react";
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
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Camera, Check, Film, GripVertical, ImagePlus, Loader2, Maximize2, Star, Trash2, Tv, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { canonicalBilibiliUrl, isBilibiliShortLink, isBilibiliUrl, parseBilibili } from "@/lib/bilibili";
import { uploadFile } from "@/lib/upload-client";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/admin/action-form";
import { Dropzone } from "@/components/admin/dropzone";
import { MediaPreview } from "@/components/admin/media-preview";
import { UploadField } from "@/components/admin/upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type MediaValue = {
  kind: "IMAGE" | "VIDEO";
  url: string;
  posterUrl: string | null;
  alt: string | null;
  caption: string | null;
};

/** A stored ContentMedia row (its kind is the shared MediaKind enum). */
export type MediaRecord = Omit<MediaValue, "kind"> & { kind: string };

type Draft = {
  id: string;
  kind: "IMAGE" | "VIDEO";
  url: string;
  posterUrl: string;
  alt: string;
  caption: string;
  /** blob: URL of a video uploaded in this session — lets 截取当前帧 work whatever the storage's CORS. */
  previewUrl?: string;
};

type Pending = { id: string; name: string; progress: number };

const MEDIA_ACCEPT = "image/*,video/*";

/** Same as MEDIA_LIMIT in admin-schemas (not imported, to keep zod out of the client bundle). */
const MAX_ITEMS = 30;

/**
 * 封面与影像 for cases and articles: the cover field plus the ordered list of
 * photos / videos behind the detail-page carousel.
 *
 * The list is sent to the server action as JSON in one hidden `media` input;
 * the action replaces the stored list as a whole. Items are reordered by
 * dragging the grip handle (dnd-kit: mouse, touch, or keyboard — Space to
 * pick up, arrows to move).
 */
export function MediaFields({
  folder,
  cover,
  media,
  shownIn = "详情页顶部",
  whenEmpty = "没有图片与视频时显示封面。",
}: {
  folder: string;
  cover?: string | null;
  media?: MediaRecord[];
  /** Where the carousel appears on the site, for the field's help text. */
  shownIn?: string;
  /** What the site shows when the list is empty. */
  whenEmpty?: string;
}) {
  const [coverUrl, setCoverUrl] = useState(cover ?? "");
  const [items, setItems] = useState<Draft[]>(() =>
    (media ?? []).map((item, i) => ({
      id: `m${i}`,
      kind: item.kind === "VIDEO" ? "VIDEO" : "IMAGE",
      url: item.url,
      posterUrl: item.posterUrl ?? "",
      alt: item.alt ?? "",
      caption: item.caption ?? "",
    }))
  );
  const [pending, setPending] = useState<Pending[]>([]);
  const [posterBusy, setPosterBusy] = useState<string[]>([]);
  const [bilibiliOpen, setBilibiliOpen] = useState(false);
  const [bilibiliUrl, setBilibiliUrl] = useState("");
  const [preview, setPreview] = useState<number | null>(null);
  const seq = useRef(items.length);
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const dndId = useId();
  // Every control gets an id: Chrome flags form fields with neither id nor name.
  const fieldId = useId();

  const nextId = () => `m${seq.current++}`;
  const busy = pending.length > 0 || posterBusy.length > 0;

  // Release blob: previews when the editor leaves the page.
  const previews = useRef<string[]>([]);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const position = (id: UniqueIdentifier) => items.findIndex((item) => item.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `已拿起第 ${position(active.id)} 项`,
    onDragOver: ({ active, over }) => (over ? `第 ${position(active.id)} 项移到第 ${position(over.id)} 位` : "不在列表内"),
    onDragEnd: ({ active, over }) => (over ? `第 ${position(active.id)} 项已放到第 ${position(over.id)} 位` : "已放下"),
    onDragCancel: () => "已取消拖动，顺序未改变",
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setItems((list) => {
      const from = list.findIndex((item) => item.id === active.id);
      const to = list.findIndex((item) => item.id === over.id);
      return arrayMove(list, from, to);
    });
  }

  function patch(id: string, update: Partial<Draft>) {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...update } : item)));
  }

  function remove(id: string) {
    setItems((list) => list.filter((item) => item.id !== id));
  }

  async function addFiles(files: FileList | File[] | null) {
    const list = Array.from(files ?? []);
    const room = MAX_ITEMS - items.length - pending.length;
    if (list.length > room) toast.error(`图片与视频最多 ${MAX_ITEMS} 项，已忽略多出的 ${list.length - Math.max(room, 0)} 个文件`);

    // Upload one at a time so the list keeps the order the files were picked in.
    for (const file of list.slice(0, Math.max(room, 0))) {
      const kind = file.type.startsWith("image/") ? "IMAGE" : file.type.startsWith("video/") ? "VIDEO" : null;
      if (!kind) {
        toast.error(`${file.name}：只能添加图片或视频`);
        continue;
      }
      const id = nextId();
      setPending((queue) => [...queue, { id, name: file.name, progress: 0 }]);
      try {
        const result = await uploadFile(file, folder, (progress) =>
          setPending((queue) => queue.map((p) => (p.id === id ? { ...p, progress } : p)))
        );
        let previewUrl: string | undefined;
        if (kind === "VIDEO") {
          previewUrl = URL.createObjectURL(file);
          previews.current.push(previewUrl);
        }
        setItems((current) => [...current, { id, kind, url: result.url, posterUrl: "", alt: "", caption: "", previewUrl }]);
      } catch (error) {
        toast.error(`${file.name} 上传失败：${error instanceof Error ? error.message : "unknown"}`);
      } finally {
        setPending((queue) => queue.filter((p) => p.id !== id));
      }
    }
  }

  async function uploadPoster(id: string, file: File) {
    setPosterBusy((ids) => [...ids, id]);
    try {
      const result = await uploadFile(file, folder);
      patch(id, { posterUrl: result.url });
      toast.success("视频封面已更新");
    } catch (error) {
      toast.error(`封面上传失败：${error instanceof Error ? error.message : "unknown"}`);
    } finally {
      setPosterBusy((ids) => ids.filter((x) => x !== id));
    }
  }

  function addBilibili() {
    const url = bilibiliUrl.trim();
    const video = parseBilibili(url);
    if (!video && !isBilibiliShortLink(url)) {
      toast.error("请粘贴 B站 视频页的链接，例如 https://www.bilibili.com/video/BV…");
      return;
    }
    if (items.length + pending.length >= MAX_ITEMS) {
      toast.error(`图片与视频最多 ${MAX_ITEMS} 项`);
      return;
    }
    // Short links are resolved when the form is saved.
    setItems((list) => [
      ...list,
      { id: nextId(), kind: "VIDEO", url: video ? canonicalBilibiliUrl(video) : url, posterUrl: "", alt: "", caption: "" },
    ]);
    setBilibiliUrl("");
    setBilibiliOpen(false);
  }

  const value: MediaValue[] = items.map((item) => ({
    kind: item.kind,
    url: item.url,
    posterUrl: item.posterUrl || null,
    alt: item.alt || null,
    caption: item.caption || null,
  }));

  return (
    <>
      <UploadField
        name="coverUrl"
        label="封面图片"
        folder={folder}
        value={coverUrl}
        onValueChange={setCoverUrl}
        accept="image/*"
        description="用于列表卡片、首页与分享卡片。留空时自动使用下方第一张图片（或视频封面）。"
      />

      <div role="group" aria-labelledby={`${fieldId}-label`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            {/* A caption for the whole group, not one control, so not a <label>. */}
            <Label asChild className="mb-0">
              <span id={`${fieldId}-label`}>图片与视频</span>
            </Label>
            <p className="mt-1.5 text-xs text-faint">
              {shownIn}按此顺序轮播；拖动 <GripVertical className="inline size-3 align-[-2px]" /> 调整顺序。{whenEmpty}
            </p>
          </div>
          <span className="font-mono text-[0.625rem] text-faint tabular-nums">
            {items.length} / {MAX_ITEMS}
          </span>
        </div>

        <input type="hidden" name="media" value={JSON.stringify(value)} />
        {busy ? (
          // Blocks submit until uploads finish; the browser shows the message.
          <input
            id={`${fieldId}-busy`}
            aria-hidden
            tabIndex={-1}
            required
            value=""
            onChange={() => {}}
            className="sr-only"
            ref={(el) => el?.setCustomValidity("图片或视频仍在上传，请等待完成后再保存")}
          />
        ) : null}

        <div className="mt-4 rounded-(--radius) border border-border p-3">
          {items.length > 0 || pending.length > 0 ? (
            <Dropzone multiple accept={MEDIA_ACCEPT} onFiles={(files) => void addFiles(files)} overlay="松开以添加图片或视频">
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
                <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
                  <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((item, index) => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        index={index}
                        isCover={Boolean(coverUrl) && coverUrl === (item.kind === "IMAGE" ? item.url : item.posterUrl)}
                        posterBusy={posterBusy.includes(item.id)}
                        onChange={(update) => patch(item.id, update)}
                        onRemove={() => remove(item.id)}
                        onSetCover={(url) => {
                          setCoverUrl(url);
                          toast.success("已设为封面，保存后生效");
                        }}
                        onPoster={(file) => uploadPoster(item.id, file)}
                        onPreview={() => setPreview(index)}
                      />
                    ))}
                    {pending.map((p) => (
                      <li key={p.id} className="flex aspect-video flex-col items-center justify-center gap-3 rounded-(--radius) border border-border bg-raised px-4">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span className="w-full truncate text-center font-mono text-[0.625rem] text-body">{p.name}</span>
                        <span className="h-1 w-3/4 overflow-hidden rounded-full bg-border">
                          <span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${p.progress}%` }} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </Dropzone>
          ) : (
            <Dropzone
              multiple
              accept={MEDIA_ACCEPT}
              onFiles={(files) => void addFiles(files)}
              title="拖拽图片或视频到此处，或点击上传"
              hint="可多选 · 图片 JPG / PNG / WebP · 视频建议 1080p MP4、50MB 以内"
            />
          )}

          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => imageInput.current?.click()}>
              <ImagePlus />
              上传图片
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => videoInput.current?.click()}>
              <Film />
              上传视频
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setBilibiliOpen((open) => !open)} aria-expanded={bilibiliOpen}>
              <Tv />
              添加 B站 视频
            </Button>
          </div>

          {bilibiliOpen ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                id={`${fieldId}-bilibili`}
                autoFocus
                value={bilibiliUrl}
                onChange={(e) => setBilibiliUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBilibili();
                  }
                }}
                placeholder="https://www.bilibili.com/video/BV…"
                aria-label="B站 视频链接"
                className="flex-1 font-mono text-xs"
              />
              <div className="flex gap-2">
                <Button type="button" onClick={addBilibili} className="h-11 px-4">
                  添加
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => setBilibiliOpen(false)} aria-label="取消" className="size-11">
                  <X />
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <input
          ref={imageInput}
          id={`${fieldId}-images`}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={videoInput}
          id={`${fieldId}-videos`}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <MediaPreview
          items={items.map((item) => ({ kind: item.kind, url: item.url, posterUrl: item.posterUrl, caption: item.caption }))}
          index={preview}
          onIndexChange={setPreview}
        />

        <FieldError name="media" />
        <p className="mt-2 text-xs text-faint">
          上传的视频建议压缩为 1080p MP4（50MB 以内）。B站 视频需要单独上传封面；外链播放器对未登录 B站 的访客通常画质较低。
        </p>
      </div>
    </>
  );
}

function MediaCard({
  item,
  index,
  isCover,
  posterBusy,
  onChange,
  onRemove,
  onSetCover,
  onPoster,
  onPreview,
}: {
  item: Draft;
  index: number;
  isCover: boolean;
  posterBusy: boolean;
  onChange: (update: Partial<Draft>) => void;
  onRemove: () => void;
  onSetCover: (url: string) => void;
  onPoster: (file: File) => void;
  onPreview: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const bilibili = item.kind === "VIDEO" && isBilibiliUrl(item.url);
  const coverCandidate = item.kind === "IMAGE" ? item.url : item.posterUrl;
  const n = String(index + 1).padStart(2, "0");

  async function captureFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast.error("请先播放或拖动视频到想要的画面");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob(resolve, "image/jpeg", 0.88);
      } catch {
        resolve(null); // canvas tainted by a cross-origin video
      }
    });
    if (!blob) {
      toast.error("无法截取画面：视频存储未开启跨域访问（CORS），请手动上传封面");
      return;
    }
    onPoster(new File([blob], `poster-${Date.now()}.jpg`, { type: "image/jpeg" }));
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-(--radius) border bg-card",
        isDragging ? "z-10 border-primary/60 opacity-85 shadow-lg" : "border-border"
      )}
    >
      <div className="relative aspect-video bg-raised">
        {item.kind === "IMAGE" ? (
          <button type="button" onClick={onPreview} className="block size-full cursor-zoom-in" aria-label={`预览第 ${index + 1} 项`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt || item.caption} className="size-full object-cover" />
          </button>
        ) : bilibili ? (
          <button type="button" onClick={onPreview} className="block size-full" aria-label={`预览第 ${index + 1} 项`}>
            {item.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.posterUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full flex-col items-center justify-center gap-1.5 px-4 text-center">
                <Tv className="size-5 text-faint" />
                <span className="text-xs text-destructive-soft">B站 视频需要上传封面</span>
              </span>
            )}
          </button>
        ) : (
          <video
            ref={videoRef}
            src={item.previewUrl ?? item.url}
            poster={item.posterUrl || undefined}
            controls
            preload="metadata"
            playsInline
            className="size-full bg-background object-contain"
          />
        )}

        <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={`拖动以调整第 ${index + 1} 项的顺序`}
              className="inline-flex size-8 cursor-grab touch-none items-center justify-center rounded-md border border-border bg-background/85 text-muted-foreground backdrop-blur-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>
            <span className="rounded-md bg-background/85 px-1.5 py-1 font-mono text-[0.625rem] text-foreground tabular-nums backdrop-blur-sm">
              {n} · {item.kind === "IMAGE" ? "图片" : bilibili ? "B站" : "视频"}
            </span>
          </div>
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPreview}
              aria-label={`放大预览第 ${index + 1} 项`}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/85 text-muted-foreground backdrop-blur-sm hover:text-primary"
            >
              <Maximize2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`移除第 ${index + 1} 项`}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/85 text-muted-foreground backdrop-blur-sm hover:border-destructive/40 hover:text-destructive-soft"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Input
          id={`${fieldId}-caption`}
          value={item.caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="说明（选填，显示在轮播下方）"
          aria-label={`第 ${index + 1} 项的说明`}
          maxLength={300}
          className="h-9 text-xs"
        />
        {item.kind === "IMAGE" ? (
          <Input
            id={`${fieldId}-alt`}
            value={item.alt}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="替代文本（选填，默认使用说明）"
            aria-label={`第 ${index + 1} 项的替代文本`}
            maxLength={300}
            className="h-9 text-xs"
          />
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            <Button type="button" variant="outline" size="sm" onClick={() => posterInput.current?.click()} disabled={posterBusy}>
              {posterBusy ? <Loader2 className="animate-spin" /> : <Upload />}
              {item.posterUrl ? "更换封面" : "上传封面"}
            </Button>
            {!bilibili ? (
              <Button type="button" variant="outline" size="sm" onClick={captureFrame} disabled={posterBusy}>
                <Camera />
                截取当前帧
              </Button>
            ) : null}
            {item.posterUrl ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ posterUrl: "" })} className="text-muted-foreground">
                清除封面
              </Button>
            ) : null}
            <input
              ref={posterInput}
              id={`${fieldId}-poster`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPoster(file);
                e.target.value = "";
              }}
            />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {bilibili ? (
            <a href={item.url} target="_blank" rel="noreferrer" className="truncate font-mono text-[0.625rem] text-faint hover:text-primary">
              {item.url.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          ) : (
            <span className="truncate font-mono text-[0.625rem] text-faint">{item.url.split("/").pop()}</span>
          )}
          {isCover ? (
            <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[0.625rem] text-primary">
              <Check className="size-3" />
              当前封面
            </span>
          ) : coverCandidate ? (
            <button
              type="button"
              onClick={() => onSetCover(coverCandidate)}
              className="inline-flex shrink-0 items-center gap-1 font-mono text-[0.625rem] text-muted-foreground hover:text-primary"
            >
              <Star className="size-3" />
              设为封面
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
