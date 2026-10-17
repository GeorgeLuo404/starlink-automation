"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowRight, Play } from "lucide-react";
import { Magnetic } from "@/components/motion";
import copy from "@/content/copy.json";

export function HomeHero({
  videoUrl,
  posterUrl = "/media/hero-poster.png",
}: {
  videoUrl?: string | null;
  posterUrl?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const t = copy.home.hero;

  return (
    <section ref={ref} className="relative flex min-h-svh flex-col justify-end overflow-hidden pt-24 pb-8">
      {/* Background ---------------------------------------------------- */}
      <motion.div
        style={reduced ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0 -z-10"
        aria-hidden="true"
      >
        {videoUrl ? (
          <video
            className="size-full object-cover opacity-45"
            src={videoUrl}
            poster={posterUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img src={posterUrl} alt="" className="size-full object-cover opacity-90" />
        )}
      </motion.div>

      <div className="hero-scrim absolute inset-0 -z-10" aria-hidden="true" />
      <div className="grid-blueprint absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-px animate-scan bg-linear-to-r from-transparent via-primary/50 to-transparent"
        aria-hidden="true"
      />

      {/* Technical side annotations ------------------------------------ */}
      <div className="pointer-events-none absolute top-1/2 left-4 hidden -translate-y-1/2 xl:block" aria-hidden="true">
        <div className="flex flex-col items-center gap-3 font-mono text-[0.5625rem] tracking-[0.3em] text-ghost">
          <span className="h-16 w-px bg-raised" />
          <span style={{ writingMode: "vertical-rl" }}>SHENZHEN · CHINA</span>
          <span className="h-16 w-px bg-raised" />
        </div>
      </div>

      <motion.div style={reduced ? undefined : { y: contentY, opacity: contentOpacity }} className="container-x relative">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-primary" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-[0.625rem] tracking-[0.18em] text-primary uppercase">
                {t.badge}
              </span>
            </span>
            <span className="font-mono text-[0.625rem] tracking-[0.18em] text-faint uppercase">
              {t.eyebrow}
            </span>
          </motion.div>

          <h1 className="text-display mt-7 text-[2.6rem] leading-[0.95] text-white sm:text-6xl lg:text-[5.2rem]">
            <span className="block overflow-hidden pb-1">
              <motion.span
                className="block"
                initial={{ y: "108%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.95, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {t.titleTop}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1">
              <motion.span
                className="text-gradient-brand block"
                initial={{ y: "108%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.95, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {t.titleBottom}
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-2xl text-[0.9375rem] leading-relaxed text-subtle sm:text-base"
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.54, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <Link href="/contact" className="btn btn-primary group h-12 px-6">
                {t.ctaPrimary}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
            <Link href="/cases" className="btn btn-ghost h-12 px-6 backdrop-blur-sm">
              <Play className="size-3.5" />
              {t.ctaSecondary}
            </Link>
          </motion.div>
        </div>

        {/* Keyword ticker --------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-14 border-t border-border pt-6"
        >
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {t.ticker.map((item, i) => (
              <span key={item} className="flex items-center gap-3">
                <span className="font-mono text-[0.625rem] text-ghost">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs tracking-wide text-muted-foreground">{item}</span>
                {i < t.ticker.length - 1 ? <span className="h-3 w-px bg-raised" /> : null}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="pointer-events-none absolute right-5 bottom-8 hidden items-center gap-3 md:flex"
      >
        <span className="font-mono text-[0.5625rem] tracking-[0.28em] text-faint uppercase">{t.scroll}</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex size-7 items-center justify-center rounded-full border border-border"
        >
          <ArrowDown className="size-3 text-muted-foreground" />
        </motion.span>
      </motion.div>
    </section>
  );
}
