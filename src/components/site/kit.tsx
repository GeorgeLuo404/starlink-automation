import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ==========================================================================
   站点基础件 / Site building blocks
   Small pieces every page shares, built on the shadcn primitives.
   ========================================================================== */

/**
 * 星链节点 / The link node — the hexagon-and-dot from the logo, used as the
 * site's small signature mark (eyebrows, list bullets, the end of a headline).
 */
export function LinkNode({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={cn("inline-block size-2.5 shrink-0 text-primary", className)} aria-hidden="true">
      <path d="M6 .9 10.4 3.45v5.1L6 11.1 1.6 8.55v-5.1Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="6" cy="6" r="1.45" fill="currentColor" />
    </svg>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("eyebrow", className)}>
      <LinkNode />
      <span>{children}</span>
      <Separator className="w-12! bg-border" />
    </div>
  );
}

/** Section heading block: eyebrow, title, optional lead and right-hand action. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  action,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-8 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="title-2 mt-6">{title}</h2>
        {lead ? <p className="lead mt-6 max-w-2xl">{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Wraps the first occurrence of `phrase` in the accent colour. */
export function highlight(text: string, phrase: string) {
  const at = text.indexOf(phrase);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="whitespace-nowrap text-primary-text">{phrase}</span>
      {text.slice(at + phrase.length)}
    </>
  );
}

/** Pill button that navigates — shadcn Button rendered as a Next.js Link. */
export function PillLink({
  href,
  variant = "default",
  size = "lg",
  className,
  children,
}: {
  href: string;
  variant?: "default" | "outline" | "inverse";
  size?: "default" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Button asChild variant={variant} size={size} shape="pill" className={cn("group", className)}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

/** Category / album filter: a small pill, solid when it is the current one. */
export function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Button asChild variant={active ? "inverse" : "outline"} size="sm" shape="pill" className="h-9 px-4">
      <Link href={href} aria-current={active ? "page" : undefined}>
        {children}
      </Link>
    </Button>
  );
}

/**
 * A cover image in a rounded frame. Uploaded photos and the line-art SVG
 * placeholders (coverSrc) go through the same frame, so swapping one for the
 * other never changes the layout.
 */
export function Cover({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Set the aspect ratio and radius here, e.g. "aspect-16/10 rounded-xl". */
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-16/10 overflow-hidden rounded-[calc(var(--radius)-0.375rem)] bg-muted", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}

/** "No content yet" panel for empty lists. */
export function EmptyState({ title, hint }: { title?: string; hint: string }) {
  return (
    <div className="rounded-(--radius) border border-dashed border-border px-6 py-24 text-center">
      {title ? <p className="text-base">{title}</p> : null}
      <p className={cn("text-sm text-muted-foreground", title && "mt-2")}>{hint}</p>
    </div>
  );
}
