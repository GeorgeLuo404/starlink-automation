/**
 * Small client-side helpers for canvas animation (the home hero).
 *
 * Colours are never hard-coded here: they are read from the CSS custom
 * properties in globals.css at runtime, so a canvas follows the palette like
 * the rest of the site.
 */

export type RGB = [number, number, number];

/** Resolve a CSS custom property (e.g. "--primary") to an sRGB triple, 0–255. */
export function readCssColor(host: Element, cssVar: string): RGB {
  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style.color = `var(${cssVar})`;
  host.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();

  const nums = value.match(/-?[\d.]+/g)?.map(Number) ?? [255, 255, 255];
  // color(srgb r g b) reports 0–1 channels; rgb() reports 0–255.
  return value.startsWith("color(")
    ? [nums[0] * 255, nums[1] * 255, nums[2] * 255]
    : [nums[0], nums[1], nums[2]];
}

export const rgba = ([r, g, b]: RGB, a: number) => `rgb(${r} ${g} ${b} / ${a})`;

/** Pre-rendered soft glow, drawn with "lighter" compositing for cheap bloom. */
export function glowSprite(color: RGB, size = 64) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  const ctx = sprite.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, rgba(color, 1));
  g.addColorStop(0.18, rgba(color, 0.55));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

/**
 * Dots or lines grouped by opacity, each group drawn as a single path.
 * WebKit's canvas (Safari, and every browser on iOS) pays for each draw call
 * rather than each shape, so thousands of separate fillRect / stroke calls a
 * frame stall it — and the page with it. Opacity is rounded to `steps` levels
 * between 0 and `max`.
 */
export function alphaBatch(max: number, steps = 8) {
  const groups: number[][] = Array.from({ length: steps }, () => []);
  const scale = max > 0 ? steps / max : 0;
  const group = (alpha: number) => groups[Math.min(steps - 1, Math.floor(alpha * scale))];
  const level = (i: number) => (max * (i + 0.5)) / steps;
  return {
    /** Queue a line from (x1, y1) to (x2, y2). */
    line(alpha: number, x1: number, y1: number, x2: number, y2: number) {
      if (alpha > max * 0.02) group(alpha).push(x1, y1, x2, y2);
    },
    /** Queue a square dot of side `s` centred on (x, y). */
    dot(alpha: number, x: number, y: number, s: number) {
      if (alpha > max * 0.02) group(alpha).push(x - s / 2, y - s / 2, s);
    },
    stroke(ctx: CanvasRenderingContext2D, color: RGB) {
      groups.forEach((g, i) => {
        if (!g.length) return;
        ctx.strokeStyle = rgba(color, level(i));
        ctx.beginPath();
        for (let k = 0; k < g.length; k += 4) {
          ctx.moveTo(g[k], g[k + 1]);
          ctx.lineTo(g[k + 2], g[k + 3]);
        }
        ctx.stroke();
      });
    },
    fill(ctx: CanvasRenderingContext2D, color: RGB) {
      ctx.fillStyle = rgba(color, 1);
      groups.forEach((g, i) => {
        if (!g.length) return;
        ctx.globalAlpha = Math.min(1, level(i));
        ctx.beginPath();
        for (let k = 0; k < g.length; k += 3) ctx.rect(g[k], g[k + 1], g[k + 2], g[k + 2]);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    },
  };
}

/**
 * requestAnimationFrame loop that only runs while `el` is on screen, drawing
 * at most `maxFps` frames a second. `frame` receives elapsed seconds (paused
 * time excluded) and the time since the last drawn frame — at most 0.1 s, so a
 * slow device still keeps roughly real time and a resumed loop does not jump.
 */
export function startLoop(el: Element, frame: (t: number, dt: number) => void, { maxFps = 60 } = {}) {
  let raf = 0;
  let last = 0;
  let t = 0;
  let stopped = false;
  // 2 ms of slack, so a 60 Hz display still lands every other refresh at 30 fps.
  const gap = 1000 / maxFps - 2;

  const tick = (now: number) => {
    if (last && now - last < gap) {
      raf = requestAnimationFrame(tick);
      return;
    }
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    t += dt;
    frame(t, dt);
    // `frame` may have stopped the loop.
    if (!stopped) raf = requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !raf) {
      last = 0;
      raf = requestAnimationFrame(tick);
    } else if (!entry.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  observer.observe(el);

  return () => {
    stopped = true;
    observer.disconnect();
    cancelAnimationFrame(raf);
  };
}

/** Pointer position relative to `el`, in device pixels. */
export function trackPointer(el: HTMLElement) {
  const state = { x: 0, y: 0, active: false, clientX: 0, clientY: 0 };
  const move = (e: PointerEvent) => {
    state.clientX = e.clientX;
    state.clientY = e.clientY;
    state.active = true;
  };
  const leave = (e: PointerEvent) => {
    if (!e.relatedTarget) state.active = false;
  };
  window.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerout", leave);

  return {
    /** Call once per frame — resolves client coordinates against the element's current box. */
    read(dpr: number) {
      const rect = el.getBoundingClientRect();
      state.x = (state.clientX - rect.left) * dpr;
      state.y = (state.clientY - rect.top) * dpr;
      return state;
    },
    dispose() {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
    },
  };
}

export const smooth = (v: number) => {
  const x = v < 0 ? 0 : v > 1 ? 1 : v;
  return x * x * (3 - 2 * x);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
