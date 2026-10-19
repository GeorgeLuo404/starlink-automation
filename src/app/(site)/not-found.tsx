import { ArrowLeft } from "lucide-react";
import { Eyebrow, PillLink } from "@/components/site/kit";
import copy from "@/content/copy.json";

export default function SiteNotFound() {
  return (
    <section className="theme-dark relative isolate flex min-h-[80svh] items-center overflow-hidden pt-32 pb-24">
      <div className="grid-lines grid-lines-lg mask-fade-b absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div className="container-x">
        <Eyebrow>Error 404</Eyebrow>
        <h1 className="display mt-8">
          404<span className="text-primary">.</span>
        </h1>
        <p className="title-3 mt-6">{copy.common.notFoundTitle}</p>
        <p className="lead mt-3 max-w-md">{copy.common.notFoundDesc}</p>
        <PillLink href="/" className="mt-10">
          <ArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
          {copy.common.backHome}
        </PillLink>
      </div>
    </section>
  );
}
