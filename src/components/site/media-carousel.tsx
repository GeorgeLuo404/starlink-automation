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
 */
export function MediaCarousel({ items, title, sizes }: { items: MediaContent[]; title: string; sizes: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [thumbsApi, setThumbsApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    thumbsApi?.scrollTo(selected);
  }, [thumbsApi, selected]);

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
    <div>
      <div
        ref={frameRef}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        // Only keyboard focus pauses; a mouse click on a slide is handled by pointerDown.
        onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
        className="overflow-hidden rounded-(--radius) bg-muted"
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
        <div className="mt-4 flex items-center gap-4">
          <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{current?.caption}</p>
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
        <Carousel
          setApi={setThumbsApi}
          opts={{ dragFree: true, containScroll: "keepSnaps" }}
          aria-label={copy.media.thumbnails}
          className="mt-4"
        >
          <CarouselContent className="-ml-2">
            {items.map((item, i) => (
              <CarouselItem key={`${item.url}-${i}`} className="basis-24 pl-2 sm:basis-28">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${i + 1} / ${items.length}`}
                  aria-current={i === selected ? "true" : undefined}
                  className={cn(
                    "relative block aspect-video w-full overflow-hidden rounded-[calc(var(--radius)-0.375rem)] border bg-muted transition-opacity",
                    i === selected ? "border-primary opacity-100" : "border-border opacity-55 hover:opacity-90"
                  )}
                >
                  <Thumb item={item} />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : null}

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
    <button type="button" onClick={onPlay} className="group absolute inset-0" aria-label={`${copy.media.playVideo}：${title}`}>
      {item.posterUrl ? (
        <Image src={item.posterUrl} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      ) : !bilibili ? (
        // No poster: let the browser show the first frame.
        <video src={`${item.url}#t=0.1`} preload="metadata" muted playsInline className="absolute inset-0 size-full object-cover" />
      ) : null}
      {bilibili ? (
        <span className="absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[0.625rem] text-foreground backdrop-blur-sm">
          {copy.media.bilibili}
        </span>
      ) : null}
      <span className="absolute top-1/2 left-1/2 inline-flex size-16 -translate-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-105 sm:size-20">
        <Play className="ml-1 size-6 fill-current sm:size-7" />
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
