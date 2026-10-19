"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow, PillLink } from "@/components/site/kit";
import copy from "@/content/copy.json";

/** Error boundary for the public site — rendered inside the header/footer layout. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[site] page error:", error);
  }, [error]);

  return (
    <section className="theme-dark relative isolate flex min-h-[80svh] items-center overflow-hidden pt-32 pb-24">
      <div className="grid-lines grid-lines-lg mask-fade-b pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div className="container-x">
        <Eyebrow>Error</Eyebrow>
        <h1 className="title-1 mt-8">{copy.common.errorTitle}</h1>
        <p className="lead mt-6 max-w-md">{copy.common.errorDesc}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" shape="pill" onClick={reset}>
            <RotateCcw />
            {copy.common.retry}
          </Button>
          <PillLink href="/" variant="outline">
            {copy.common.backHome}
          </PillLink>
        </div>
      </div>
    </section>
  );
}
