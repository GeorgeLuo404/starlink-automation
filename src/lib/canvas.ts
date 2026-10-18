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
 * requestAnimationFrame loop that only runs while `el` is on screen.
 * `frame` receives elapsed seconds (paused time excluded) and a clamped delta.
 */
export function startLoop(el: Element, frame: (t: number, dt: number) => void) {
  let raf = 0;
  let last = 0;
  let t = 0;

  const tick = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    t += dt;
    frame(t, dt);
    raf = requestAnimationFrame(tick);
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
