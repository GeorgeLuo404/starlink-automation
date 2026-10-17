"use client";

import { useRef, useState } from "react";
import { Check, Copy, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FieldError, useFieldError } from "@/components/admin/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type UploadResult = { url: string; key: string; size: number; kind: string; name: string };

/**
 * Upload-or-paste field used by every admin form.
 *
 * Drop a file to upload it to the configured storage driver; the returned URL
 * is written into a normal text input so it can also be pasted or edited by
 * hand (e.g. pointing at an existing CDN asset).
 */
export function UploadField({
  name,
  label,
  defaultValue = "",
  folder = "general",
  accept = "image/*,video/*,.pdf,.zip,.docx,.xlsx,.pptx",
  showPreview = true,
  onUploaded,
  description,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  folder?: string;
  accept?: string;
  showPreview?: boolean;
  onUploaded?: (result: UploadResult) => void;
  description?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const error = useFieldError(name);

  async function upload(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);

      const response = await fetch("/api/upload", { method: "POST", body });
      const data = (await response.json()) as {
        ok: boolean;
        url?: string;
        key?: string;
        size?: number;
        kind?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.error ?? "upload_failed");
      }

      setUrl(data.url);
      onUploaded?.({
        url: data.url,
        key: data.key ?? "",
        size: data.size ?? file.size,
        kind: data.kind ?? "IMAGE",
        name: file.name,
      });
      toast.success(`上传成功 / Uploaded: ${file.name}`);
    } catch (error) {
      toast.error(`上传失败 / Upload failed: ${error instanceof Error ? error.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  }

  const isImage = /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(url);
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);

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
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
        className={cn(
          "mt-2 rounded-(--radius) border border-dashed px-4 py-3 text-center text-xs transition-colors",
          dragging ? "border-primary/60 bg-primary/6 text-primary" : "border-border text-faint"
        )}
      >
        {busy ? "上传中…" : "或将文件拖到此处上传"}
      </div>

      {description ? <p className="mt-2 text-xs text-faint">{description}</p> : null}

      {showPreview && url && isImage ? (
        <div className="mt-3 overflow-hidden rounded-(--radius) border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="max-h-44 w-full object-cover" />
        </div>
      ) : null}

      {showPreview && url && isVideo ? (
        <video src={url} controls className="mt-3 max-h-44 w-full rounded-(--radius) border border-border" />
      ) : null}
    </div>
  );
}
