"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

const t = {
  title: "页面暂时无法显示",
  body: "加载内容时出现了问题，请稍后重试。",
  retry: "重试",
  home: "返回首页",
};

/** Error boundary for the public site — rendered inside the header/footer layout. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[site] page error:", error);
  }, [error]);

  return (
    <section className="relative flex min-h-[70svh] items-center justify-center overflow-hidden pt-32 pb-24">
      <div className="grid-blueprint pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="container-x relative text-center">
        <p className="font-mono text-[0.6875rem] tracking-[0.3em] text-primary uppercase">Error</p>
        <h1 className="text-display mt-6 text-4xl text-white sm:text-5xl">{t.title}</h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">{t.body}</p>
        <div className="mt-10 flex justify-center gap-3">
          <Button onClick={reset}>
            <RotateCcw />
            {t.retry}
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            {t.home}
          </Link>
        </div>
      </div>
    </section>
  );
}
