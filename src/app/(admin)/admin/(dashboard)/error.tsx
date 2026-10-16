"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

/** Error boundary for every admin page — keeps the sidebar and offers a retry. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin] page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </span>
      <h1 className="mt-6 text-xl font-semibold text-white">页面出错了</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        加载或保存数据时发生错误。可以重试一次；如果问题持续存在，请检查数据库是否已启动。
      </p>
      {error.digest ? <p className="mt-3 font-mono text-[0.625rem] text-faint">错误编号：{error.digest}</p> : null}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>
          <RotateCcw />
          重试
        </Button>
        <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
          返回仪表盘
        </Link>
      </div>
    </div>
  );
}
