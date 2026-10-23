"use client";

import { useId } from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/*
 * File drop target for the admin, on react-dropzone (drag, click, keyboard
 * and paste-to-upload).
 *
 * Two shapes:
 *   · no children — the empty-state box: icon, title, hint; click to pick.
 *   · with children — wraps existing content (a preview, a grid): dropping
 *     onto it uploads, an overlay shows while dragging, clicks pass through.
 */

const EXTENSION_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".csv": "text/csv",
  ".txt": "text/plain",
};

/** An <input accept> string ("image/*,.pdf") → react-dropzone's MIME → extensions map. */
function toAccept(accept: string): Accept {
  const map: Record<string, string[]> = {};
  for (const token of accept.split(",").map((t) => t.trim()).filter(Boolean)) {
    if (token.startsWith(".")) {
      const type = EXTENSION_TYPES[token] ?? "application/octet-stream";
      (map[type] ??= []).push(token);
    } else {
      map[token] ??= [];
    }
  }
  return map;
}

function rejectionMessage([first]: FileRejection[]) {
  const code = first?.errors[0]?.code;
  if (code === "too-many-files") return "一次只能上传一个文件";
  if (code === "file-invalid-type") return `${first.file.name}：不支持的文件类型`;
  return `${first?.file.name ?? "文件"}：${first?.errors[0]?.message ?? "无法上传"}`;
}

export function Dropzone({
  onFiles,
  accept,
  multiple = false,
  busy = false,
  title = "拖拽文件到此处，或点击上传",
  hint,
  overlay = "松开以上传",
  className,
  children,
}: {
  onFiles: (files: File[]) => void;
  /** Same format as <input accept>. */
  accept?: string;
  multiple?: boolean;
  busy?: boolean;
  title?: string;
  hint?: string;
  /** Text shown while files are dragged over. */
  overlay?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const wraps = children !== undefined;
  // An id rather than a name: a named file input inside a form would be
  // submitted along with it.
  const inputId = useId();
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: accept ? toAccept(accept) : undefined,
    multiple,
    disabled: busy,
    noClick: wraps,
    // Wrapped content has its own keyboard handling (e.g. dnd-kit sorting).
    noKeyboard: wraps,
    onDropAccepted: (files) => onFiles(files),
    onDropRejected: (rejections) => toast.error(rejectionMessage(rejections)),
  });

  if (wraps) {
    return (
      <div {...getRootProps({ className: cn("relative", className) })}>
        <input {...getInputProps({ id: inputId })} />
        {children}
        {isDragActive ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-(--radius) border-2 border-dashed text-sm font-medium backdrop-blur-[2px]",
              isDragReject ? "border-destructive/70 bg-destructive/10 text-destructive-soft" : "border-primary/70 bg-background/80 text-primary"
            )}
          >
            <UploadCloud className="size-6" />
            {isDragReject ? "不支持的文件类型" : overlay}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      {...getRootProps({
        className: cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-(--radius) border border-dashed px-6 py-9 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
          isDragReject
            ? "border-destructive/60 bg-destructive/6"
            : isDragActive
              ? "border-primary/60 bg-primary/6"
              : "border-border hover:border-primary/40 hover:bg-foreground/2",
          busy && "cursor-progress opacity-70",
          className
        ),
      })}
    >
      <input {...getInputProps({ id: inputId })} />
      <span
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-full border bg-raised transition-colors",
          isDragActive && !isDragReject ? "border-primary/50 text-primary" : "border-border text-muted-foreground"
        )}
      >
        {busy ? <Loader2 className="size-5 animate-spin text-primary" /> : <UploadCloud className="size-5" strokeWidth={1.6} />}
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">
          {busy ? "上传中…" : isDragReject ? "不支持的文件类型" : isDragActive ? overlay : title}
        </p>
        {hint ? <p className="mt-1.5 font-mono text-[0.6875rem] text-faint">{hint}</p> : null}
      </div>
    </div>
  );
}
