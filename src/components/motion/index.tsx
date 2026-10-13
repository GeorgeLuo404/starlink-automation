"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/* ======================================================================
   Reveal — fade + rise as the element enters the viewport.
   The backbone of the whole site's motion language.
   ====================================================================== */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.75,
  once = true,
  amount = 0.25,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  as?: ElementType;
}) {
  const reduced = useReducedMotion();
  const MotionTag = useMemo(() => motion.create(Tag as ElementType), [Tag]);
  return (
    <MotionTag
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/* ======================================================================
   Stagger — parent/child orchestration for grids and lists.
   ====================================================================== */

export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.08,
  once = true,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
  once?: boolean;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduced ? { opacity: 0 } : { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ======================================================================
   ScrollHighlightText — the giant statement that "lights up" word by word
   as you scroll (the signature RiACT move).
   ====================================================================== */

const TOKEN_RE = /[A-Za-z0-9][A-Za-z0-9'’\-.]*|\s+|./gu;

/** CJK ideographs, kana and full-width punctuation. */
const CJK_RE = /[\u2e80-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;

type TextToken = { value: string; isSpace: boolean; index: number; prev: string };

/**
 * Split text into words, whitespace runs and individual characters.
 *
 * Whitespace is kept as a distinct token so the renderer can emit it as a real
 * text node rather than an animated box — see ScrollHighlightText below.
 */
function tokenize(text: string): { tokens: TextToken[]; wordCount: number } {
  const raw = text.match(TOKEN_RE) ?? [];
  const isWord = (value: string) => !/^\s+$/.test(value);
  const wordCount = raw.filter(isWord).length;
  let wordIndex = 0;

  const tokens = raw.map((value, i) => {
    const isSpace = !isWord(value);
    return {
      value,
      isSpace,
      index: isSpace ? -1 : wordIndex++,
      prev: raw[i - 1] ?? "",
    };
  });

  return { tokens, wordCount };
}

function HighlightToken({
  progress,
  range,
  children,
  className,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: ReactNode;
  className?: string;
}) {
  const opacity = useTransform(progress, range, [0.13, 1]);
  const y = useTransform(progress, range, [4, 0]);
  const blur = useTransform(progress, range, ["blur(3px)", "blur(0px)"]);
  return (
    <motion.span style={{ opacity, y, filter: blur }} className={cn("inline-block", className)}>
      {children}
    </motion.span>
  );
}

export function ScrollHighlightText({
  text,
  className,
  wordClassName,
  offset = ["start 0.85", "end 0.5"],
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  offset?: [string, string];
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as unknown as ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.001 });
  const { tokens, wordCount } = useMemo(() => tokenize(text), [text]);

  if (reduced) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={className}>
      {tokens.map((token, i) => {
        // Whitespace MUST be a real text node. An animated box is
        // `display: inline-block`; a box whose entire content is collapsible
        // whitespace collapses to zero width, which silently glued every
        // English word together. A real space also gives the browser its
        // normal soft-wrap opportunity.
        if (token.isSpace) return token.value;

        const total = Math.max(wordCount, 1);
        const start = (token.index / total) * 0.92;
        const end = Math.min(start + 0.22, 1);

        // Chinese has no spaces, so adjacent ideographs would form one
        // unbreakable run of inline-block boxes. <wbr> restores the break
        // opportunity without adding any visible width.
        const prevIsSpace = token.prev === "" || /^\s+$/.test(token.prev);
        const needsBreak =
          !prevIsSpace && (CJK_RE.test(token.value) || CJK_RE.test(token.prev));

        return (
          <Fragment key={i}>
            {needsBreak ? <wbr /> : null}
            <HighlightToken progress={smooth} range={[start, end]} className={wordClassName}>
              {token.value}
            </HighlightToken>
          </Fragment>
        );
      })}
    </p>
  );
}

/* ======================================================================
   Counter — animated number that counts up once it is visible.
   ====================================================================== */

export function Counter({
  value,
  duration = 1.8,
  decimals = 0,
  className,
  suffix,
  prefix,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ======================================================================
   Marquee — seamless infinite logo / keyword scroller.
   ====================================================================== */

export function Marquee({
  children,
  className,
  itemClassName,
  duration = 45,
  reverse = false,
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        <div className={cn("flex shrink-0 items-center", itemClassName)}>{children}</div>
        <div className={cn("flex shrink-0 items-center", itemClassName)} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ======================================================================
   Magnetic — button that leans toward the cursor.
   ====================================================================== */

export function Magnetic({
  children,
  className,
  strength = 0.28,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.5 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.5 });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el || event.pointerType === "touch") return;
        const rect = el.getBoundingClientRect();
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ======================================================================
   Parallax — subtle depth on scroll.
   ====================================================================== */

export function Parallax({
  children,
  className,
  distance = 60,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/* ======================================================================
   ScrollProgress — thin reading-progress bar pinned to the top.
   ====================================================================== */

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className={cn("fixed inset-x-0 top-0 z-60 h-px origin-left bg-[#22e0ff]", className)}
    />
  );
}

/* ======================================================================
   TiltCard — pointer-reactive 3D tilt for cards.
   ====================================================================== */

export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el || event.pointerType === "touch") return;
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ======================================================================
   useMounted — avoids hydration mismatches for client-only chrome.
   ====================================================================== */

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export { motion, useInView, useScroll, useTransform, useSpring, useMotionValue };

export type { CSSProperties };
