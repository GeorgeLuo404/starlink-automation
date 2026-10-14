"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type QueueItem = { name: string; progress: number; status: "uploading" | "done" | "error" };

export function MediaUploader({ folder = "general" }: { folder?: string }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function patch(name: string, update: Partial<QueueItem>) {
    setQueue((prev) => prev.map((item) => (item.name === name ? { ...item, ...update } : item)));
  }

  function uploadOne(file: File) {
    return new Promise<void>((resolve) => {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          patch(file.name, { progress: Math.round((event.loaded / event.total) * 100) });
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          patch(file.name, { status: "done", progress: 100 });
        } else {
          let message = String(xhr.status);
          try {
            message = JSON.parse(xhr.responseText).error ?? message;
          } catch {
            /* keep the status code */
          }
          patch(file.name, { status: "error" });
          toast.error(`${file.name}: ${message}`);
        }
        resolve();
      };
      xhr.onerror = () => {
        patch(file.name, { status: "error" });
        toast.error(`${file.name}: 网络错误`);
        resolve();
      };
      xhr.send(body);
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setQueue((prev) => [
      ...prev,
      ...list.map((file) => ({ name: file.name, progress: 0, status: "uploading" as const })),
    ]);

    for (const file of list) {
      await uploadOne(file);
    }

    toast.success(`已上传 ${list.length} 个文件`);
    router.refresh();
    setTimeout(() => setQueue((prev) => prev.filter((item) => item.status === "error")), 2500);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-(--radius) border border-dashed px-6 py-12 text-center transition-colors",
          dragging ? "border-primary/60 bg-primary/6" : "border-border hover:border-primary/40"
        )}
      >
        <UploadCloud className={cn("size-7", dragging ? "text-primary" : "text-faint")} strokeWidth={1.4} />
        <p className="mt-4 text-sm font-medium text-foreground">拖拽文件到此处，或点击选择</p>
        <p className="mt-1.5 font-mono text-[0.6875rem] text-faint">
          图片 / 视频 / PDF / Office · 单文件不超过 200MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,video/*,.pdf,.zip,.docx,.xlsx,.pptx,.csv,.txt"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {queue.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {queue.map((item) => (
            <li
              key={item.name}
              className="flex items-center gap-3 rounded-(--radius) border border-border bg-card px-3 py-2.5"
            >
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-body">{item.name}</span>
              {item.status === "uploading" ? (
                <>
                  <span className="h-1 w-24 overflow-hidden rounded-full bg-raised">
                    <span
                      className="block h-full rounded-full bg-primary transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </span>
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                </>
              ) : item.status === "done" ? (
                <span className="font-mono text-[0.625rem] text-success">完成</span>
              ) : (
                <span className="font-mono text-[0.625rem] text-destructive">失败</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
