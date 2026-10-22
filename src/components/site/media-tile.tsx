import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Phones: a 4:3 / 16:10 image. From md the tiles sit in rows whose widths
// change, so they take a fixed height and the image re-crops instead.
const sizing = {
  md: { tile: "md:h-80 lg:h-96", pad: "p-6", title: "text-2xl" },
  lg: { tile: "md:h-96 lg:h-[28rem]", pad: "p-6 lg:p-8", title: "text-2xl lg:text-[2rem]" },
  xl: { tile: "md:h-[26rem] lg:h-[32rem]", pad: "p-6 lg:p-10", title: "text-2xl sm:text-[2rem] lg:text-[2.75rem]" },
} as const;

/**
 * An image you click into: the cover fills the tile and only the title sits on
 * it. Hovering (or keyboard focus) lifts the dimming and slides in the summary
 * and an accent pill, so the card stays quiet until someone looks at it. The
 * text is always on a dark scrim, so photos and placeholders read the same.
 */
export function MediaTile({
  href,
  src,
  alt,
  sizes,
  priority,
  eyebrow,
  title,
  summary,
  cta,
  size = "lg",
  className,
}: {
  href: string;
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Small line above the title: a number, an industry. */
  eyebrow?: React.ReactNode;
  title: string;
  summary?: string;
  cta: string;
  size?: keyof typeof sizing;
  className?: string;
}) {
  const s = sizing[size];
  return (
    <Link
      href={href}
      className={cn(
        "group/tile theme-dark reveal relative isolate block aspect-4/3 overflow-hidden rounded-(--radius) sm:aspect-16/10 md:aspect-auto",
        s.tile,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        // Crop a little above centre: keeps the drawing (or a photo's subject) in wide tiles.
        className="object-cover object-[50%_33%] transition-transform duration-700 ease-out group-hover/tile:scale-[1.04]"
      />
      <div
        className="absolute inset-0 bg-background/25 transition-opacity duration-500 group-hover/tile:opacity-0 group-focus-visible/tile:opacity-0"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-background/90 via-background/40 to-transparent"
        aria-hidden="true"
      />
      {/* Deepens behind the taller text block while it is open. */}
      <div
        className="absolute inset-0 bg-linear-to-t from-background/80 via-background/45 to-transparent opacity-0 transition-opacity duration-500 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100"
        aria-hidden="true"
      />

      <div className={cn("absolute inset-x-0 bottom-0", s.pad)}>
        {eyebrow ? <div className="mb-3 flex items-center gap-3 text-sm">{eyebrow}</div> : null}
        <h3 className={cn("max-w-2xl leading-tight font-medium text-balance", s.title)}>{title}</h3>
        {/* 0fr → 1fr animates the height of whatever the summary needs. */}
        <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:grid-rows-[1fr] group-hover/tile:opacity-100 group-focus-visible/tile:grid-rows-[1fr] group-focus-visible/tile:opacity-100">
          <div className="min-h-0">
            {summary ? <p className="mt-3 line-clamp-2 max-w-md text-sm leading-6 text-body">{summary}</p> : null}
            <span className="mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
              {cta}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Tiles in rows that share their width (from md; phones stack them). On wide
 * screens the tile under the pointer (or holding focus) widens and its
 * neighbours give way. `pattern` is the size of each row; its last entry
 * repeats, e.g. [2, 3] → 2, 3, 3 ….
 */
export function TileRows<T>({
  items,
  pattern,
  render,
  className,
}: {
  items: T[];
  pattern: number[];
  render: (item: T, index: number, row: number) => React.ReactNode;
  className?: string;
}) {
  const rows: { start: number; items: T[] }[] = [];
  for (let start = 0, r = 0; start < items.length; r++) {
    const n = pattern[Math.min(r, pattern.length - 1)];
    rows.push({ start, items: items.slice(start, start + n) });
    start += n;
  }
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {rows.map((row, r) => (
        <div key={row.start} className="flex flex-col gap-4 md:flex-row">
          {row.items.map((item, i) => (
            <div
              key={row.start + i}
              className="md:min-w-0 md:flex-1 lg:transition-[flex-grow] lg:duration-700 lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:hover:grow-[1.5] lg:has-focus-visible:grow-[1.5]"
            >
              {render(item, row.start + i, r)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
