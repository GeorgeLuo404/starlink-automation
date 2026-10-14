import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { defaultLocale } from "@/lib/i18n/config";

export default function LocaleNotFound() {
  return (
    <section className="relative flex min-h-[70svh] items-center justify-center overflow-hidden pt-32 pb-24">
      <div className="grid-blueprint absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="container-x relative text-center">
        <p className="font-mono text-[0.6875rem] tracking-[0.3em] text-primary uppercase">Error 404</p>
        <h1 className="text-display mt-6 text-[5rem] leading-none text-white sm:text-[8rem]">404</h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          您访问的页面可能已被移动或删除。
          <br />
          The page you requested may have been moved or removed.
        </p>
        <Link href={`/${defaultLocale}`} className="btn btn-primary mt-10 inline-flex">
          <ArrowLeft className="size-4" />
          返回首页 / Back home
        </Link>
      </div>
    </section>
  );
}
