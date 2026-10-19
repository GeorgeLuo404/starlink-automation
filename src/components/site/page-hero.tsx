import Link from "next/link";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./kit";

export type Crumb = { label: string; href?: string };

/**
 * The black opening of every inner page: breadcrumb, eyebrow, title and lead,
 * with an optional aside (a cover image) and children (actions, filters, facts).
 * The fixed header sits transparently over it.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs = [],
  aside,
  size = "lg",
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  aside?: React.ReactNode;
  /** md for long titles (articles). */
  size?: "lg" | "md";
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("theme-dark relative isolate overflow-hidden", className)}>
      <div className="grid-lines grid-lines-lg mask-fade-b absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div className="absolute top-0 right-[6%] -z-10 size-[40rem] -translate-y-1/2 rounded-full bg-primary/8 blur-[140px]" aria-hidden="true" />

      <div className="container-x pt-32 pb-16 md:pt-40 md:pb-20">
        <nav aria-label="Breadcrumb" className="intro flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            首页
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="line-clamp-1 text-foreground" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        <div className={cn(aside && "lg:grid lg:grid-cols-12 lg:items-end lg:gap-14")}>
          <div className={cn(aside && "lg:col-span-6")}>
            {eyebrow ? (
              <div className="intro mt-12" style={{ animationDelay: "60ms" }}>
                <Eyebrow>{eyebrow}</Eyebrow>
              </div>
            ) : null}
            <h1
              className={cn(size === "lg" ? "title-1" : "title-2", "intro max-w-4xl", eyebrow ? "mt-6" : "mt-12")}
              style={{ animationDelay: "120ms" }}
            >
              {title}
            </h1>
            {description ? (
              <p className="lead intro mt-6 max-w-2xl" style={{ animationDelay: "200ms" }}>
                {description}
              </p>
            ) : null}
            {children}
          </div>
          {aside ? (
            <div className="intro mt-12 lg:col-span-6 lg:mt-0" style={{ animationDelay: "260ms" }}>
              {aside}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
