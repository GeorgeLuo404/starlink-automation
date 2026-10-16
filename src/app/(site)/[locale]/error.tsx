"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

const copy = {
  zh: {
    title: "页面暂时无法显示",
    body: "加载内容时出现了问题，请稍后重试。",
    retry: "重试",
    home: "返回首页",
  },
  en: {
    title: "Something went wrong",
    body: "We could not load this page. Please try again in a moment.",
    retry: "Try again",
    home: "Back home",
  },
};

/** Error boundary for the public site — rendered inside the header/footer layout. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale?: string }>();
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const t = copy[locale];

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
          <Link href={`/${locale}`} className={buttonVariants({ variant: "outline" })}>
            {t.home}
          </Link>
        </div>
      </div>
    </section>
  );
}
