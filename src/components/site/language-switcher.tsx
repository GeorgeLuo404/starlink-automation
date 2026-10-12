"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

function LanguageSwitcherInner({ current, className }: { current: Locale; className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildHref = (target: Locale) => {
    const segments = (pathname || "/").split("/").filter(Boolean);
    if (segments.length > 0 && (locales as readonly string[]).includes(segments[0])) {
      segments[0] = target;
    } else {
      segments.unshift(target);
    }
    const query = searchParams?.toString();
    return `/${segments.join("/")}${query ? `?${query}` : ""}`;
  };

  return (
    <>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={buildHref(locale)}
          scroll={false}
          hrefLang={locale === "zh" ? "zh-CN" : "en"}
          className={cn(
            "rounded-full px-2 py-1 font-mono text-[0.625rem] tracking-wider transition-colors",
            locale === current
              ? "bg-[#22e0ff] font-semibold text-[#04141a]"
              : "text-[#8a929e] hover:text-white"
          )}
        >
          {localeLabels[locale]}
        </Link>
      ))}
    </>
  );
}

/**
 * Language switcher.
 *
 * `useSearchParams` forces a client-side bailout during prerendering, so the
 * inner component is wrapped in Suspense — the shell renders on the server and
 * the query-preserving links hydrate on the client.
 */
export function LanguageSwitcher({ current, className }: { current: Locale; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-[#1b1f27] bg-[#0d0f13]/60 p-0.5",
        className
      )}
    >
      <Globe className="mr-1 ml-1.5 size-3 text-[#8a929e]" aria-hidden="true" />
      <Suspense
        fallback={
          <span className="rounded-full bg-[#22e0ff] px-2 py-1 font-mono text-[0.625rem] font-semibold tracking-wider text-[#04141a]">
            {localeLabels[current]}
          </span>
        }
      >
        <LanguageSwitcherInner current={current} />
      </Suspense>
    </div>
  );
}
