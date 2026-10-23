"use client";

import { useRef, useState } from "react";
import { Check, Copy, FileText, Loader2, Maximize2, Play, Upload, X } from "lucide-react";
import { uploadFile, type UploadedFile } from "@/lib/upload-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FieldError, useFieldError } from "@/components/admin/action-form";
import { Dropzone } from "@/components/admin/dropzone";
import { fileName, MediaPreview } from "@/components/admin/media-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type UploadResult = UploadedFile;

/**
 * Upload-or-paste field used by every admin form.
 *
 * Drop, paste or pick a file to upload it to the configured storage driver;
 * the returned URL is written into a normal text input so it can also be
 * pasted or edited by hand (e.g. pointing at an existing CDN asset). Once set,
 * the file shows as a card — click the thumbnail to preview it full size,
 * drop another file on it to replace it. Pass `value` and
 * `onValueChange` to control it from a parent (the cover field in
 * <MediaFields> does, for 设为封面).
 */
export function UploadField({
  name,
  label,
  defaultValue = "",
  value,
  onValueChange,
  folder = "general",
  accept = "image/*,video/*,.pdf,.zip,.docx,.xlsx,.pptx",
  showPreview = true,
  onUploaded,
  description,
  logo = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (url: string) => void;
  folder?: string;
  accept?: string;
  showPreview?: boolean;
  onUploaded?: (result: UploadResult) => void;
  description?: string;
  /** Preview uncropped on a light backdrop (brand logos) instead of cropped to fill. */
  logo?: boolean;
}) {
  const [ownUrl, setOwnUrl] = useState(defaultValue);
  const url = value ?? ownUrl;
  const setUrl = (next: string) => {
    if (value === undefined) setOwnUrl(next);
    onValueChange?.(next);
  };
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  /** Pixel size / duration of the current file, read when its preview loads. */
  const [meta, setMeta] = useState<{ url: string; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const error = useFieldError(name);

  async function upload(file: File) {
    setBusy(true);
    try {
      const result = await uploadFile(file, folder);
      setUrl(result.url);
      onUploaded?.(result);
      toast.success(`上传成功 / Uploaded: ${file.name}`);
    } catch (error) {
      toast.error(`上传失败 / Upload failed: ${error instanceof Error ? error.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  }

  const isImage = /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(url);
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
  const previewable = showPreview && (isImage || isVideo);
  const details = meta?.url === url ? meta.text : null;

  // Read size/duration from the preview element. Also checked on mount: a cached
  // file can finish loading before React attaches onLoad.
  const readImage = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth && meta?.url !== url) {
      setMeta({ url, text: `${img.naturalWidth} × ${img.naturalHeight}` });
    }
  };
  const readVideo = (video: HTMLVideoElement | null) => {
    if (video && video.readyState >= 1 && meta?.url !== url) {
      setMeta({ url, text: `${video.videoWidth} × ${video.videoHeight} · ${duration(video.duration)}` });
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="mb-0" htmlFor={name}>
          {label}
        </Label>
        {url ? (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(url);
              setCopied(true);
              toast.success("已复制链接 / URL copied");
              setTimeout(() => setCopied(false), 1600);
            }}
            className="inline-flex items-center gap-1 font-mono text-[0.625rem] text-faint transition-colors hover:text-primary"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            复制链接
          </button>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Input
          id={name}
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/uploads/... 或 https://cdn..."
          className="flex-1 font-mono text-xs"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy} className="h-11 px-4">
          {busy ? <Loader2 className="animate-spin" /> : <Upload />}
          上传
        </Button>
        {url ? (
          <Button type="button" variant="outline" size="icon" onClick={() => setUrl("")} aria-label="清除" className="size-11">
            <X />
          </Button>
        ) : null}
      </div>

      <FieldError name={name} />

      <input
        ref={inputRef}
        id={`${name}-file`}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />

      {!url ? (
        <Dropzone onFiles={([file]) => upload(file)} accept={accept} busy={busy} hint={hintFor(accept)} className="mt-3" />
      ) : (
        <Dropzone onFiles={([file]) => upload(file)} accept={accept} busy={busy} overlay="松开以替换文件" className="mt-3">
          <div className="flex flex-col gap-4 rounded-(--radius) border border-border bg-raised/40 p-3 sm:flex-row sm:items-center">
            {previewable ? (
              <button
                type="button"
                onClick={() => setPreviewing(true)}
                className={cn(
                  "group relative aspect-video w-full shrink-0 overflow-hidden rounded-[calc(var(--radius)-0.25rem)] bg-muted sm:w-72",
                  logo && "theme-white"
                )}
                aria-label={`预览${label}`}
              >
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={readImage}
                    src={url}
                    alt=""
                    className={cn("size-full", logo ? "object-contain p-6" : "object-cover")}
                    onLoad={(e) => readImage(e.currentTarget)}
                  />
                ) : (
                  <video
                    ref={readVideo}
                    src={`${url}#t=0.1`}
                    preload="metadata"
                    muted
                    playsInline
                    className="size-full object-cover"
                    onLoadedMetadata={(e) => readVideo(e.currentTarget)}
                  />
                )}
                {isVideo ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                      <Play className="ml-0.5 size-4 fill-current" />
                    </span>
                  </span>
                ) : null}
                <span className="absolute inset-0 flex items-end justify-end p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[0.6875rem] text-foreground backdrop-blur-sm">
                    <Maximize2 className="size-3" />
                    预览
                  </span>
                </span>
              </button>
            ) : (
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-(--radius) border border-border bg-raised text-muted-foreground">
                <FileText className="size-5" strokeWidth={1.6} />
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="truncate font-mono text-xs text-foreground">{fileName(url)}</p>
              {details ? <p className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">{details}</p> : null}
              <p className="text-xs text-faint">
                {previewable ? "点击缩略图可放大预览；" : null}拖入新文件即可替换。
                {!previewable ? (
                  <a href={url} target="_blank" rel="noreferrer" className="ml-1 text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
                    打开文件
                  </a>
                ) : null}
              </p>
            </div>
          </div>
        </Dropzone>
      )}

      {description ? <p className="mt-2 text-xs text-faint">{description}</p> : null}

      {previewable ? (
        <MediaPreview
          items={[{ kind: isImage ? "IMAGE" : "VIDEO", url }]}
          index={previewing ? 0 : null}
          onIndexChange={(index) => setPreviewing(index !== null)}
        />
      ) : null}
    </div>
  );
}

const IMAGE_NAMES: Record<string, string> = { "image/svg+xml": "SVG", "image/webp": "WebP" };

/** What the empty drop area says it accepts, from the <input accept> string. */
function hintFor(accept: string) {
  if (accept === "image/*") return "JPG / PNG / WebP / GIF / SVG · 单个文件不超过 200MB";
  const types = accept.split(",").map((t) => t.trim());
  if (types.every((t) => t.startsWith("image/"))) {
    return `${types.map((t) => IMAGE_NAMES[t] ?? t.slice(6).toUpperCase()).join(" / ")} · 单个文件不超过 200MB`;
  }
  if (accept === "video/*") return "MP4 / WebM / MOV · 建议 1080p、50MB 以内";
  if (!accept.includes("image") && !accept.includes("video")) return "PDF / ZIP / Office 文档 · 单个文件不超过 200MB";
  return "图片 / 视频 / 文档 · 单个文件不超过 200MB";
}

function duration(seconds: number) {
  if (!Number.isFinite(seconds)) return "--:--";
  const s = Math.round(seconds);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
