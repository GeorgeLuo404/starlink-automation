"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import type { MediaContent } from "@/content/defaults";
import { bilibiliEmbedUrl, isBilibiliUrl } from "@/lib/bilibili";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/site/lightbox";
import { cn } from "@/lib/utils";
import copy from "@/content/copy.json";

const DELAY = 5000;
const pad = (n: number) => String(n).padStart(2, "0");

/** Let Embla drag the slides, but not while the pointer is on a playing video. */
const watchDrag = (_api: unknown, event: MouseEvent | TouchEvent) =>
  !(event.target instanceof Element && event.target.closest("video, iframe"));

/**
 * Detail-page carousel for a case or article: photos, uploaded videos and
 * B站 videos, in the order set in admin.
 *
 * Auto-advances every 5 s while it is on screen. It pauses while the mouse is
 * over the slides or keyboard focus is inside them, stops for good once the
 * visitor navigates (swipe, arrows, thumbnails) or plays a video, never runs
 * under prefers-reduced-motion, and has a visible pause button (WCAG 2.2.2).
 * The Embla autoplay plugin only runs the timer; this component decides when.
 *
 * Laid out by its own width (a container query), so it fits one screen: when
 * wide (cases, services) the thumbnails form a rail beside the slide, each with
 * its number, type and caption; when narrow (articles, phones) they run in a
 * strip under the slide, below the caption.
 */
export function MediaCarousel({ items, title, sizes }: { items: MediaContent[]; title: string; sizes: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const autoplay = useRef(
    Autoplay({ delay: DELAY, playOnInit: false, stopOnInteraction: true, stopOnFocusIn: false, stopOnMouseEnter: false })
  );
  const reducedMotion = useReducedMotion();

  const many = items.length > 1;
  const canAutoplay = many && !reducedMotion;
  const shouldPlay = canAutoplay && !userPaused && !hovered && !focused && inView && playing === null && lightbox === null;

  // Lightbox only steps through the photos; map slide index ↔ photo index.
  const photos = items.flatMap((item, slide) => (item.kind === "IMAGE" ? [{ item, slide }] : []));

  useEffect(() => {
    const plugin = api?.plugins().autoplay;
    if (!plugin) return;
    if (shouldPlay) plugin.play();
    else plugin.stop();
  }, [api, shouldPlay]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setSelected(api.selectedScrollSnap());
      setPlaying(null); // unmount the player so a video never keeps playing off-screen
    };
    const onPointerDown = () => setUserPaused(true);
    onSelect();
    api.on("select", onSelect).on("reInit", onSelect).on("pointerDown", onPointerDown);
    return () => {
      api.off("select", onSelect).off("reInit", onSelect).off("pointerDown", onPointerDown);
    };
  }, [api]);

  // Keep the selected thumbnail in view, scrolling only the list, never the page.
  useEffect(() => {
    const list = thumbsRef.current;
    const thumb = list?.children[selected];
    if (!list || !(thumb instanceof HTMLElement)) return;
    const into = (start: number, size: number, scroll: number, view: number) =>
      start < scroll ? start : start + size > scroll + view ? start + size - view : scroll;
    list.scrollTo({
      left: into(thumb.offsetLeft, thumb.offsetWidth, list.scrollLeft, list.clientWidth),
      top: into(thumb.offsetTop, thumb.offsetHeight, list.scrollTop, list.clientHeight),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [selected, reducedMotion]);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setUserPaused(true);
      api?.scrollTo(index);
    },
    [api]
  );

  const current = items[selected];

  return (
    <div className="@container">
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          many && "@4xl:grid-cols-[minmax(0,1fr)_19rem] @4xl:grid-rows-[auto_minmax(0,1fr)] @4xl:gap-x-6"
        )}
      >
        <div
          ref={frameRef}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          // Only keyboard focus pauses; a mouse click on a slide is handled by pointerDown.
          onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
          className={cn("overflow-hidden rounded-(--radius) bg-muted", many && "@4xl:row-span-2")}
        >
          <Carousel
            setApi={setApi}
            opts={{ loop: many, watchDrag: many ? watchDrag : false }}
            plugins={[autoplay.current]}
            aria-label={`${title} · ${copy.media.label}`}
          >
            <CarouselContent className="ml-0" aria-live={shouldPlay ? "off" : "polite"}>
              {items.map((item, i) => (
                <CarouselItem key={`${item.url}-${i}`} className="pl-0" aria-label={`${i + 1} / ${items.length}`}>
                  <div className="relative aspect-video">
                    {item.kind === "IMAGE" ? (
                      <button
                        type="button"
                        onClick={() => setLightbox(photos.findIndex((p) => p.slide === i))}
                        className="absolute inset-0 cursor-zoom-in"
                        aria-label={`${copy.media.zoom}：${item.alt || item.caption || title}`}
                      >
                        <Image
                          src={item.url}
                          alt={item.alt || item.caption || title}
                          fill
                          sizes={sizes}
                          priority={i === 0}
                          className="object-cover"
                        />
                      </button>
                    ) : playing === i ? (
                      <VideoPlayer item={item} title={item.caption || title} />
                    ) : (
                      <VideoPoster
                        item={item}
                        title={item.caption || title}
                        sizes={sizes}
                        priority={i === 0}
                        onPlay={() => {
                          setUserPaused(true);
                          setPlaying(i);
                        }}
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {many ? (
              <>
                <CarouselPrevious
                  onClick={() => {
                    setUserPaused(true);
                    api?.scrollPrev();
                  }}
                  className="left-3 size-10 border-foreground/15 bg-background/75 backdrop-blur-sm sm:left-4"
                />
                <CarouselNext
                  onClick={() => {
                    setUserPaused(true);
                    api?.scrollNext();
                  }}
                  className="right-3 size-10 border-foreground/15 bg-background/75 backdrop-blur-sm sm:right-4"
                />
              </>
            ) : null}
          </Carousel>
        </div>

        {many || current?.caption ? (
          <div
            className={cn(
              "flex items-center gap-4",
              many && "@4xl:justify-between @4xl:border-b @4xl:border-border @4xl:pb-4"
            )}
          >
            {/* In the rail the caption is already beside its thumbnail. */}
            <p className={cn("min-w-0 flex-1 truncate text-sm text-muted-foreground", many && "@4xl:hidden")}>
              {current?.caption}
            </p>
            {many ? (
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                <span className="text-foreground">{pad(selected + 1)}</span> / {pad(items.length)}
              </span>
            ) : null}
            {canAutoplay ? (
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                shape="pill"
                onClick={() => setUserPaused((paused) => !paused)}
                aria-label={userPaused ? copy.media.play : copy.media.pause}
              >
                {userPaused ? <Play /> : <Pause />}
              </Button>
            ) : null}
          </div>
        ) : null}

        {many ? (
          // -m-1 / p-1 leave room for the focus ring inside the scrolling list.
          <div className="relative -m-1 @4xl:min-h-0">
            <ul
              ref={thumbsRef}
              aria-label={copy.media.thumbnails}
              className="scrollbar-none relative flex gap-2 overflow-x-auto p-1 @4xl:absolute @4xl:inset-0 @4xl:flex-col @4xl:gap-1 @4xl:overflow-x-hidden @4xl:overflow-y-auto"
            >
              {items.map((item, i) => (
                <li key={`${item.url}-${i}`} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`${i + 1} / ${items.length}`}
                    aria-current={i === selected ? "true" : undefined}
                    className="group flex w-24 items-center gap-4 rounded-[calc(var(--radius)-0.25rem)] text-left transition-colors sm:w-28 @4xl:w-full @4xl:p-1.5 @4xl:hover:bg-foreground/5 @4xl:aria-current:bg-foreground/5"
                  >
                    <span
                      className={cn(
                        "relative block aspect-video w-full shrink-0 overflow-hidden rounded-[calc(var(--radius)-0.375rem)] border bg-muted transition-opacity @4xl:w-24",
                        i === selected
                          ? "border-primary opacity-100"
                          : "border-border opacity-55 group-hover:opacity-90"
                      )}
                    >
                      <Thumb item={item} />
                    </span>
                    <span className="hidden min-w-0 @4xl:block">
                      <span className="flex items-baseline gap-2 text-xs text-muted-foreground">
                        <span className={cn("font-mono tabular-nums", i === selected && "text-primary-text")}>
                          {pad(i + 1)}
                        </span>
                        {item.kind === "IMAGE"
                          ? copy.media.photo
                          : isBilibiliUrl(item.url)
                            ? copy.media.bilibiliVideo
                            : copy.media.video}
                      </span>
                      {item.caption ? (
                        <span
                          className={cn(
                            "mt-1 line-clamp-2 text-sm leading-5 transition-colors",
                            i === selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {item.caption}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <Lightbox
        items={photos.map(({ item }) => ({ src: item.url, title: item.caption || item.alt || title }))}
        index={lightbox}
        onIndexChange={(index) => {
          setLightbox(index);
          if (index !== null) api?.scrollTo(photos[index].slide, true);
        }}
      />
    </div>
  );
}

function VideoPoster({
  item,
  title,
  sizes,
  priority,
  onPlay,
}: {
  item: MediaContent;
  title: string;
  sizes: string;
  priority: boolean;
  onPlay: () => void;
}) {
  const bilibili = isBilibiliUrl(item.url);
  return (
    <button
      type="button"
      onClick={onPlay}
      className="group absolute inset-0"
      aria-label={`${copy.media.playVideo}：${title}`}
    >
      {item.posterUrl ? (
        <Image src={item.posterUrl} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      ) : !bilibili ? (
        // No poster: let the browser show the first frame.
        <video
          src={`${item.url}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      {bilibili ? (
        <span className="absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[0.625rem] text-foreground backdrop-blur-sm">
          {copy.media.bilibili}
        </span>
      ) : null}
      {/* Dark glass on any poster, light or dark; brightens on hover. */}
      <span className="theme-dark absolute top-1/2 left-1/2 inline-flex size-14 -translate-1/2 items-center justify-center rounded-full bg-background/55 ring-1 ring-foreground/25 backdrop-blur-md transition-[background-color,scale] duration-300 group-hover:scale-105 group-hover:bg-background/75 sm:size-16">
        <Play className="ml-0.5 size-5 fill-current sm:size-6" />
      </span>
    </button>
  );
}

function VideoPlayer({ item, title }: { item: MediaContent; title: string }) {
  const embed = bilibiliEmbedUrl(item.url);
  if (embed) {
    return (
      <iframe
        src={embed}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 size-full border-0 bg-background"
      />
    );
  }
  return (
    <video
      src={item.url}
      poster={item.posterUrl ?? undefined}
      controls
      autoPlay
      playsInline
      aria-label={title}
      className="absolute inset-0 size-full bg-background object-contain"
    />
  );
}

function Thumb({ item }: { item: MediaContent }) {
  const src = item.kind === "IMAGE" ? item.url : item.posterUrl;
  return (
    <>
      {src ? <Image src={src} alt="" fill sizes="112px" className="object-cover" /> : null}
      {item.kind === "VIDEO" ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-background/80">
            <Play className="ml-px size-3 fill-current" />
          </span>
        </span>
      ) : null}
    </>
  );
}
