import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { listGallery } from "@/lib/data";
import { localeHref } from "@/components/site/nav-items";
import { SectionHeading } from "@/components/site/section-heading";
import { Stagger, StaggerItem } from "@/components/motion";

export async function HomeGallery({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = (await listGallery()).slice(0, 6);
  const t = dict.home.gallery;
  if (!items.length) return null;

  return (
    <section className="section-y relative border-t border-border">
      <div className="container-x">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.desc}
          action={
            <Link href={localeHref(locale, "/gallery")} className="btn btn-ghost">
              {dict.common.viewAll}
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <Stagger className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6" gap={0.06}>
          {items.map((item, i) => (
            <StaggerItem key={`${item.title.zh}-${i}`} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <Link
                href={localeHref(locale, "/gallery")}
                className="group relative block size-full overflow-hidden rounded-(--radius) border border-border"
              >
                <div className={i === 0 ? "aspect-square" : "aspect-4/3"}>
                  <Image
                    src={item.url ?? `/media/gallery-${String(i + 1).padStart(2, "0")}.svg`}
                    alt={item.title[locale]}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-95" />
                {item.mediaKind === "VIDEO" ? (
                  <span className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
                    <Play className="size-3 text-white" />
                  </span>
                ) : null}
                <span className="absolute inset-x-3 bottom-3 line-clamp-2 text-xs font-medium text-white">
                  {item.title[locale]}
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
