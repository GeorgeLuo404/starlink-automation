"use client";

import { useRef, useState } from "react";
import { Check, Copy, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
        <label className="field-label mb-0" htmlFor={name}>
          {label}
        </label>
        {url ? (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(url);
              setCopied(true);
              toast.success("已复制链接 / URL copied");
              setTimeout(() => setCopied(false), 1600);
            }}
            className="inline-flex items-center gap-1 font-mono text-[0.625rem] text-[#5c6472] transition-colors hover:text-[#22e0ff]"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            复制链接
          </button>
        ) : null}
      </div>

      <div className="flex gap-2">
        <input
          id={name}
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/uploads/... 或 https://cdn..."
          className="field flex-1 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn btn-ghost h-10 shrink-0 px-4"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          上传
        </button>
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="btn btn-ghost h-10 shrink-0 px-3"
            aria-label="清除"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

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
          "mt-2 rounded-[var(--radius)] border border-dashed px-4 py-3 text-center text-xs transition-colors",
          dragging ? "border-[#22e0ff]/60 bg-[#22e0ff]/6 text-[#22e0ff]" : "border-[#1b1f27] text-[#5c6472]"
        )}
      >
        {busy ? "上传中…" : "或将文件拖到此处上传"}
      </div>

      {description ? <p className="mt-2 text-xs text-[#5c6472]">{description}</p> : null}

      {showPreview && url && isImage ? (
        <div className="mt-3 overflow-hidden rounded-[var(--radius)] border border-[#1b1f27]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="max-h-44 w-full object-cover" />
        </div>
      ) : null}

      {showPreview && url && isVideo ? (
        <video src={url} controls className="mt-3 max-h-44 w-full rounded-[var(--radius)] border border-[#1b1f27]" />
      ) : null}
    </div>
  );
}
