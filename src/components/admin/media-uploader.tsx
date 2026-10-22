"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload-client";
import { Dropzone } from "@/components/admin/dropzone";

type QueueItem = { name: string; progress: number; status: "uploading" | "done" | "error" };

export function MediaUploader({ folder = "general", maxMb }: { folder?: string; maxMb: number }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const router = useRouter();

  function patch(name: string, update: Partial<QueueItem>) {
    setQueue((prev) => prev.map((item) => (item.name === name ? { ...item, ...update } : item)));
  }

  async function uploadOne(file: File) {
    try {
      await uploadFile(file, folder, (progress) => patch(file.name, { progress }));
      patch(file.name, { status: "done", progress: 100 });
    } catch (error) {
      patch(file.name, { status: "error" });
      toast.error(`${file.name}: ${error instanceof Error ? error.message : "upload_failed"}`);
    }
  }

  async function handleFiles(list: File[]) {
    if (list.length === 0) return;
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
      <Dropzone
        multiple
        accept="image/*,video/*,.pdf,.zip,.docx,.xlsx,.pptx,.csv,.txt"
        onFiles={(files) => void handleFiles(files)}
        title="拖拽文件到此处，或点击选择"
        hint={`图片 / 视频 / PDF / Office · 单文件不超过 ${maxMb}MB`}
        className="py-12"
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
