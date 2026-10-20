"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { glowSprite, lerp, readCssColor, rgba, smooth, startLoop, trackPointer, type RGB } from "@/lib/canvas";

/* ==========================================================================
   首屏背景 · 星座立体 + 现场总线 / Hero background: 3D constellation
   --------------------------------------------------------------------------
   Drifting stars in a 3D volume link up — 星链 — into a wireframe robot cell
   seen through a slowly orbiting perspective camera: PLC cabinet, indexing
   conveyor, a robot that picks each part off the belt and stacks it on a
   pallet. The PLC talks to each device over labelled fieldbus arcs
   (PROFINET, EtherCAT, Modbus TCP, OPC UA → MES) that light up only while a
   telegram is in flight. Then the cell lets go, the stars drift, and the
   loop starts again seamlessly.

   Depth drives dot size and fog; the pointer steers the camera. Canvas 2D
   with a hand-rolled projection, no three.js. Colours come from the CSS
   palette; reduced motion gets a single still frame.
   ========================================================================== */

type V3 = { x: number; y: number; z: number };
type Poly = { pts: V3[]; closed?: boolean; density?: number; alpha?: number; shadow?: boolean };

const V = (x: number, y: number, z: number): V3 => ({ x, y, z });

// World space: y up, floor at y = 0, roughly centimetre-ish units.
const TARGET = V(-4, 22, -14); // camera orbits around this
const CYCLE = 21; // s — stars → assemble → run → release → stars
const ASSEMBLE_AT = 2.2;
const ASSEMBLE_FOR = 1.15; // s per particle flight
const ASSEMBLE_SPREAD = 0.9; // s of staggered start
const RELEASE_AT = 16.8;
const RELEASE_FOR = 1.4;
const RELEASE_SPREAD = 1.0; // all home by RELEASE_AT + 2.4 = 19.2, well before the wrap
const MACHINE = 6; // s — one pick-and-place
const PITCH = 20;
const STATION_X = 20;
const BASE = V(34, 0, -30);
const SHOULDER = V(34, 22, -30);
const L1 = 28;
const L2 = 26;
const SLOTS = [V(60, 14, -36), V(70, 14, -36), V(60, 14, -24), V(70, 14, -24)];

/* ------------------------------ fieldbus ------------------------------- */

// Bus ports on each device. Telegrams fly between them on arcs; nothing is drawn
// between them while the bus is idle.
const PORT = {
  plc: V(-62, 38, -4), // network port on the cabinet's line-side face
  robot: V(34, 10, -23),
  drive: V(-60, 21, 14.5),
  sensor: V(76, 25.5, -18),
  mes: V(-34, 80, -46),
};

type Telegram = { at: number; dur: number; reverse?: boolean; small?: boolean };
type Bus = {
  from: V3;
  to: V3;
  name: string;
  spec: string;
  lift: number;
  telegrams: Telegram[];
  /** where the protocol tag sits relative to the arc's apex, in css px */
  tag?: { dx: number; dy: number; align: CanvasTextAlign };
};

/** Every repeating `period` s through one machine cycle — the cyclic I/O. */
const cyclic = (period: number, dur: number, offset = 0): Telegram[] =>
  Array.from({ length: Math.floor(MACHINE / period) }, (_, i) => ({ at: offset + i * period, dur, small: true }));

const BUSES: Bus[] = [
  {
    // PLC ⇄ robot controller: start job, then "placed" handshake back
    from: PORT.plc,
    to: PORT.robot,
    name: "PROFINET",
    spec: "RT · 1 ms",
    lift: 0.3,
    telegrams: [{ at: 0, dur: 0.6 }, { at: 3.8, dur: 0.6, reverse: true }, ...cyclic(1.5, 0.45, 0.75)],
  },
  {
    // PLC → conveyor servo drive: index one pitch
    from: PORT.plc,
    to: PORT.drive,
    name: "EtherCAT",
    spec: "DC · 250 µs",
    lift: 0.55,
    telegrams: [{ at: 1.25, dur: 0.35 }, ...cyclic(1, 0.3, 0.4)],
    tag: { dx: 30, dy: -22, align: "left" }, // short arc right by the cabinet: tag beside it
  },
  {
    // pallet sensor → PLC: part present
    from: PORT.sensor,
    to: PORT.plc,
    name: "Modbus TCP",
    spec: "Port 502",
    lift: 0.42,
    telegrams: [{ at: 3.75, dur: 0.8 }],
  },
  {
    // PLC → MES: cycle report
    from: PORT.plc,
    to: PORT.mes,
    name: "OPC UA",
    spec: "→ MES",
    lift: 0.15,
    telegrams: [{ at: 4.7, dur: 0.8 }],
  },
];

const bezier = (a: V3, c: V3, b: V3, t: number) => {
  const u = 1 - t;
  return V(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y, u * u * a.z + 2 * u * t * c.z + t * t * b.z);
};
const busControl = (bus: Bus) => {
  const d = Math.hypot(bus.to.x - bus.from.x, bus.to.y - bus.from.y, bus.to.z - bus.from.z);
  return V((bus.from.x + bus.to.x) / 2, Math.max(bus.from.y, bus.to.y) + d * bus.lift, (bus.from.z + bus.to.z) / 2);
};

/* ------------------------------ geometry ------------------------------- */

const lerp3 = (a: V3, b: V3, t: number) => V(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
const add3 = (a: V3, b: V3, k = 1) => V(a.x + b.x * k, a.y + b.y * k, a.z + b.z * k);
const norm3 = (a: V3) => {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return V(a.x / l, a.y / l, a.z / l);
};
const cross3 = (a: V3, b: V3) => V(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);

type Style = { alpha?: number; shadow?: boolean; density?: number };

const seg = (a: V3, b: V3, s: Style = {}): Poly => ({ pts: [a, b], ...s });

/** Box standing on `c` (bottom-face centre), turned by `yaw` about y. 6 polys. */
function cuboid(c: V3, sx: number, sy: number, sz: number, yaw = 0, s: Style = {}): Poly[] {
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const at = (dx: number, dy: number, dz: number) => V(c.x + dx * cos - dz * sin, c.y + dy, c.z + dx * sin + dz * cos);
  const [hx, hz] = [sx / 2, sz / 2];
  const ring = (y: number) => [at(-hx, y, -hz), at(hx, y, -hz), at(hx, y, hz), at(-hx, y, hz)];
  const bottom = ring(0);
  const top = ring(sy);
  return [
    { pts: bottom, closed: true, ...s },
    { pts: top, closed: true, ...s },
    ...bottom.map((p, i) => seg(p, top[i], s)),
  ];
}

/** Circle of radius r around `c`, in the plane spanned by unit vectors u and w. */
function ring(c: V3, u: V3, w: V3, r: number, segs: number, s: Style = {}): Poly {
  const pts: V3[] = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    pts.push(V(c.x + (u.x * Math.cos(a) + w.x * Math.sin(a)) * r, c.y + (u.y * Math.cos(a) + w.y * Math.sin(a)) * r, c.z + (u.z * Math.cos(a) + w.z * Math.sin(a)) * r));
  }
  return { pts, closed: true, ...s };
}

const X = V(1, 0, 0);
const Y = V(0, 1, 0);
const Z = V(0, 0, 1);

/** Vertical cylinder standing on `c`. */
function cylinderY(c: V3, r: number, h: number, segs: number, s: Style = {}): Poly[] {
  const top = V(c.x, c.y + h, c.z);
  return [
    ring(c, X, Z, r, segs, s),
    ring(top, X, Z, r, segs, s),
    ...[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const o = V(Math.cos(a) * r, 0, Math.sin(a) * r);
      return seg(add3(c, o), add3(top, o), s);
    }),
  ];
}

/** Square-section beam from a to b. 6 polys. */
function beam(a: V3, b: V3, w: number, s: Style = {}): Poly[] {
  const d = norm3(V(b.x - a.x, b.y - a.y, b.z - a.z));
  const side = norm3(Math.abs(d.y) > 0.95 ? cross3(d, X) : cross3(d, Y));
  const up = cross3(side, d);
  const h = w / 2;
  const corners = (p: V3) => [
    add3(add3(p, side, h), up, h),
    add3(add3(p, side, -h), up, h),
    add3(add3(p, side, -h), up, -h),
    add3(add3(p, side, h), up, -h),
  ];
  const ca = corners(a);
  const cb = corners(b);
  return [
    { pts: ca, closed: true, ...s },
    { pts: cb, closed: true, ...s },
    ...ca.map((p, i) => seg(p, cb[i], s)),
  ];
}

/** Robot pose for a wrist target: base yaw + two-link IK in the arm plane, elbow up. */
function solveArm(target: V3) {
  const dx = target.x - SHOULDER.x;
  const dz = target.z - SHOULDER.z;
  const yaw = Math.atan2(dz, dx);
  const h = Math.hypot(dx, dz);
  const v = target.y - SHOULDER.y;
  const d = Math.min(Math.max(Math.hypot(h, v), Math.abs(L1 - L2) + 0.01), L1 + L2 - 0.01);
  const a0 = Math.atan2(v, h);
  const c = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const dir = V(Math.cos(yaw), 0, Math.sin(yaw));
  const at = (hh: number, vv: number) => V(SHOULDER.x + dir.x * hh, SHOULDER.y + vv, SHOULDER.z + dir.z * hh);
  const elbow = at(L1 * Math.cos(a0 + c), L1 * Math.sin(a0 + c));
  const fa = Math.atan2(v - L1 * Math.sin(a0 + c), h - L1 * Math.cos(a0 + c));
  const wrist = V(elbow.x + dir.x * L2 * Math.cos(fa), elbow.y + L2 * Math.sin(fa), elbow.z + dir.z * L2 * Math.cos(fa));
  const side = V(-Math.sin(yaw), 0, Math.cos(yaw));
  const deg = (r: number) => (r * 180) / Math.PI;
  return { yaw, dir, side, elbow, wrist, j1: deg(-yaw), j2: deg(a0 + c), j3: deg(fa - (a0 + c)) };
}

/** Machine state at time t: pick from the belt, stack on the pallet, belt indexes meanwhile. */
function machineAt(t: number) {
  const k = Math.floor(t / MACHINE);
  const m = t - k * MACHINE;
  const slot = SLOTS[k % SLOTS.length];
  const overStation = V(STATION_X, 50, 0);
  const atStation = V(STATION_X, 36, 0);
  const overSlot = V(slot.x, 46, slot.z);
  const atSlot = V(slot.x, 26, slot.z);

  const path: [number, V3][] = [
    [0, overStation],
    [0.6, atStation],
    [0.9, atStation],
    [1.5, overStation],
    [2.9, overSlot],
    [3.5, atSlot],
    [3.8, atSlot],
    [4.4, overSlot],
    [5.8, overStation],
    [MACHINE, overStation],
  ];
  let target = overStation;
  for (let i = 0; i < path.length - 1; i++) {
    const [t0, p0] = path[i];
    const [t1, p1] = path[i + 1];
    if (m >= t0 && m <= t1) {
      target = lerp3(p0, p1, smooth((m - t0) / (t1 - t0)));
      break;
    }
  }
  const arm = solveArm(target);
  const grip = smooth((m - 0.6) / 0.3) * (1 - smooth((m - 3.5) / 0.3));
  const carrying = m > 0.9 && m < 3.65;
  const belt = (k + smooth((m - 1.6) / 1.2)) * PITCH;
  return { k, m, arm, grip, carrying, belt, slotIndex: k % SLOTS.length };
}

/** Every outline at time t. The order, count and vertex counts never change. */
function buildScene(t: number) {
  const mc = machineAt(t);
  const { arm } = mc;
  const robot: Style = { shadow: true };
  const polys: Poly[] = [];
  const push = (...p: (Poly | Poly[])[]) => p.forEach((x) => (Array.isArray(x) ? polys.push(...x) : polys.push(x)));

  // floor grid — dotted, faint
  const floor: Style = { density: 0.13, alpha: 0.55 };
  for (let z = -75; z <= 50; z += 25) push(seg(V(-110, 0, z), V(110, 0, z), floor));
  for (let x = -100; x <= 100; x += 25) push(seg(V(x, 0, -75), V(x, 0, 50), floor));

  // PLC cabinet: body, HMI with live trend, buttons, vents, signal tower
  push(cuboid(V(-72, 0, -6), 16, 44, 14, 0, robot));
  push({ pts: [V(-78, 26, 1.1), V(-66, 26, 1.1), V(-66, 36, 1.1), V(-78, 36, 1.1)], closed: true });
  push({
    pts: Array.from({ length: 11 }, (_, i) => V(-77 + i, 31 + Math.sin(i * 0.9 + t * 2.4) * 2 * Math.sin(i * 0.4 + 1), 1.1)),
    density: 0.8,
  });
  for (const x of [-76, -72, -68]) push(ring(V(x, 21, 1.1), X, Y, 1, 6));
  for (const y of [6, 9, 12]) push(seg(V(-78, y, 1.1), V(-66, y, 1.1), { density: 0.6 }));
  push(seg(V(-72, 44, -6), V(-72, 48, -6)), cylinderY(V(-72, 48, -6), 1.6, 7, 6));
  // bus devices: PLC network port, conveyor servo drive, pallet sensor, MES node
  push(cuboid(V(-63, 36.5, PORT.plc.z), 2, 3, 3));
  push(cuboid(V(-60, 18, 12), 6, 6, 5));
  push(seg(V(76, 14, -18), V(76, 23, -18)), cuboid(V(76, 23, -18), 3, 2.5, 3));
  push(ring(PORT.mes, X, Z, 5, 6, { alpha: 0.9 }), ring(PORT.mes, X, Z, 2.4, 6, { alpha: 0.9 }));

  // indexing conveyor: body, legs, drums, moving slats, parts
  push(cuboid(V(-10, 18, 0), 100, 6, 18));
  for (const x of [-52, 32]) for (const z of [-8, 8]) push(seg(V(x, 0, z), V(x, 18, z)));
  for (const x of [-60, 40]) {
    push(ring(V(x, 21, -9), X, Y, 3, 8), ring(V(x, 21, 9), X, Y, 3, 8));
  }
  for (let j = 0; j < 10; j++) {
    const x = -60 + ((j * 10 + mc.belt) % 100);
    const fade = smooth((x + 60) / 6) * smooth((40 - x) / 6);
    push(seg(V(x, 24.1, -9), V(x, 24.1, 9), { density: 0.5, alpha: fade * 0.7 }));
  }
  const picked = (4 - (mc.k % 5) + 5) % 5;
  for (let i = 0; i < 5; i++) {
    const x = -60 + ((i * PITCH + mc.belt) % (5 * PITCH));
    const gone = x > STATION_X + 0.5 || (i === picked && mc.m > 0.9);
    push(cuboid(V(x, 24, 0), 8, 6, 8, 0, { shadow: true, alpha: gone ? 0 : smooth((x + 60) / 10) }));
  }

  // robot: turntable, rotating housing, arm, gripper
  push(cylinderY(BASE, 7, 10, 14, robot));
  push(cuboid(V(BASE.x, 10, BASE.z), 11, 9, 9, arm.yaw, robot));
  push(ring(SHOULDER, arm.dir, Y, 4, 12, robot));
  push(ring(add3(SHOULDER, arm.side, 3), arm.dir, Y, 4, 12, robot));
  push(beam(SHOULDER, arm.elbow, 5, robot));
  push(ring(arm.elbow, arm.dir, Y, 3.2, 10, robot));
  push(beam(arm.elbow, arm.wrist, 4, robot));
  push(ring(arm.wrist, arm.dir, Y, 2.4, 8, robot));
  const g = lerp(6.5, 4.4, mc.grip);
  const palm = V(arm.wrist.x, arm.wrist.y - 4, arm.wrist.z);
  push(seg(arm.wrist, palm, robot));
  for (const f of [-1.4, 1.4]) {
    const p = add3(palm, arm.dir, f);
    const left = add3(p, arm.side, -g);
    const right = add3(p, arm.side, g);
    push(
      seg(left, right, robot),
      seg(left, V(left.x, left.y - 6, left.z), robot),
      seg(right, V(right.x, right.y - 6, right.z), robot)
    );
  }
  // the part in the gripper
  push(cuboid(V(arm.wrist.x, arm.wrist.y - 12, arm.wrist.z), 8, 6, 8, arm.yaw, { shadow: true, alpha: mc.carrying ? 1 : 0 }));

  // pallet table and its slots — the full pallet is swapped out at the start of a round
  push(cuboid(V(65, 0, -30), 22, 14, 24));
  SLOTS.forEach((slot, i) => {
    const placed = i < mc.slotIndex || (i === mc.slotIndex && mc.m >= 3.65);
    const swapOut = mc.slotIndex === 0 ? 1 - smooth(mc.m / 0.6) : 0;
    push(cuboid(slot, 8, 6, 8, 0, { shadow: true, alpha: placed ? 1 : swapOut }));
  });

  return { polys, mc };
}

/* ------------------------------ particles ------------------------------ */

type Particle = {
  poly: number; // -1 = free star
  seg: number;
  f: number;
  hx: number; // drifting home, world space
  hy: number;
  hz: number;
  vx: number;
  vy: number;
  vz: number;
  delay: number;
  rdelay: number;
  tw: number;
  tws: number;
  bright: boolean;
  tx: number;
  ty: number;
  tz: number;
  a: number;
  p: number;
  // projected
  x: number;
  y: number;
  s: number;
  fog: number;
  mx: number;
  my: number;
};

const VOL = { x0: -320, x1: 320, y0: -140, y1: 230, z0: -320, z1: 200 };

export function HeroConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let wide = true;
    let focal = 1;
    let cx = 0;
    let cy = 0;
    let boxW = 0;
    let boxH = 0;
    let parts: Particle[] = [];
    let byPoly: number[][] = [];
    let linkMax: number[] = [];
    const font = getComputedStyle(canvas).fontFamily;

    // camera, eased toward the pointer
    let yawOffset = 0;
    let pitchOffset = 0;
    const cam = { cy: 1, sy: 0, cp: 1, sp: 0, dist: 260 };

    let colors: Record<"accent" | "ink" | "muted", RGB> | null = null;
    let accentGlow: HTMLCanvasElement | null = null;
    const pointer = trackPointer(canvas);

    const out = { x: 0, y: 0, s: 0, d: 0 };
    function project(px: number, py: number, pz: number) {
      const dx = px - TARGET.x;
      const dy = py - TARGET.y;
      const dz = pz - TARGET.z;
      const x1 = dx * cam.cy - dz * cam.sy;
      const z1 = dx * cam.sy + dz * cam.cy;
      const y2 = dy * cam.cp - z1 * cam.sp;
      const z2 = dy * cam.sp + z1 * cam.cp;
      const depth = Math.max(cam.dist - z2, 8);
      out.s = focal / depth;
      out.x = cx + x1 * out.s;
      out.y = cy - y2 * out.s;
      out.d = depth;
      return out;
    }
    const fogAt = (depth: number) => 0.22 + 0.78 * Math.min(1, Math.max(0, (cam.dist + 120 - depth) / 220));

    function makeParticle(poly: number, segIndex: number, f: number): Particle {
      const free = poly < 0;
      const speed = 3 + Math.random() * 7;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(Math.random() * 2 - 1);
      return {
        poly,
        seg: segIndex,
        f,
        hx: lerp(VOL.x0, VOL.x1, Math.random()),
        hy: lerp(VOL.y0, VOL.y1, Math.random()),
        hz: lerp(VOL.z0, VOL.z1, Math.random()),
        vx: Math.sin(b) * Math.cos(a) * speed,
        vy: Math.cos(b) * speed * 0.5,
        vz: Math.sin(b) * Math.sin(a) * speed,
        delay: Math.random() * ASSEMBLE_SPREAD,
        rdelay: Math.random() * RELEASE_SPREAD,
        tw: Math.random() * Math.PI * 2,
        tws: 0.6 + Math.random() * 1.8,
        bright: Math.random() < (free ? 0.38 : 0.12),
        tx: 0,
        ty: 0,
        tz: 0,
        a: 1,
        p: 0,
        x: 0,
        y: 0,
        s: 0,
        fog: 1,
        mx: 0,
        my: 0,
      };
    }

    function init() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(rect.width * dpr));
      H = Math.max(1, Math.round(rect.height * dpr));
      canvas!.width = W;
      canvas!.height = H;

      // Wide: the cell sits right of the headline. Narrow: a band above it.
      wide = rect.width >= 1024;
      const bw = wide ? Math.min(rect.width * 0.56, rect.height * 0.8 * 1.55) : Math.min(rect.width * 0.98, rect.height * 0.4 * 1.55);
      boxW = bw * dpr;
      boxH = (bw / 1.55) * dpr;
      cx = (wide ? rect.width - bw / 2 - rect.width * 0.03 : rect.width / 2) * dpr;
      cy = (wide ? rect.height * 0.5 : Math.max(rect.height * 0.1, 76) + bw / 1.55 / 2) * dpr;
      focal = (boxW * 260) / 158;

      // One particle per `spacing` units of outline, always including the vertices.
      const scene = buildScene(0).polys;
      const nTarget = wide ? 1450 : 700;
      const lengths = scene.map((poly) => {
        const n = poly.pts.length;
        const segs = poly.closed ? n : n - 1;
        return Array.from({ length: segs }, (_, i) => {
          const a = poly.pts[i];
          const b = poly.pts[(i + 1) % n];
          return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
        });
      });
      const weighted = scene.reduce(
        (sum, poly, pi) => sum + lengths[pi].reduce((a, b) => a + b, 0) * (poly.density ?? 1),
        0
      );
      const spacing = weighted / nTarget;

      parts = [];
      byPoly = [];
      linkMax = [];
      scene.forEach((poly, pi) => {
        const ids: number[] = [];
        let gap = 0;
        lengths[pi].forEach((len, si) => {
          const count = Math.max(1, Math.round((len * (poly.density ?? 1)) / spacing));
          gap = Math.max(gap, len / count);
          for (let j = 0; j < count; j++) {
            ids.push(parts.length);
            parts.push(makeParticle(pi, si, j / count));
          }
        });
        if (!poly.closed) {
          ids.push(parts.length);
          parts.push(makeParticle(pi, lengths[pi].length - 1, 1));
        }
        byPoly.push(ids);
        linkMax.push(gap * 1.6 + 0.5);
      });
      for (let j = 0, n = wide ? 560 : 240; j < n; j++) parts.push(makeParticle(-1, 0, 0));
    }

    function glow(sprite: HTMLCanvasElement | null, x: number, y: number, r: number, alpha: number) {
      if (!sprite || alpha <= 0.01) return;
      ctx!.globalAlpha = Math.min(1, alpha);
      ctx!.drawImage(sprite, x - r, y - r, r * 2, r * 2);
    }

    function render(t: number, dt: number) {
      if (!colors) return;
      const { accent, ink, muted } = colors;
      const c = reduced ? 9 : t % CYCLE;
      const intro = reduced ? 1 : Math.min(1, t / 1.5);
      const master = (wide ? 1 : 0.62) * intro;
      const hud = reduced
        ? 1
        : smooth((c - ASSEMBLE_AT - ASSEMBLE_SPREAD - ASSEMBLE_FOR + 0.3) / 0.7) * (1 - smooth((c - RELEASE_AT + 0.2) / 0.6));

      // Camera: slow orbit, dolly in while the cell assembles, pointer steers it.
      const ptr = reduced ? null : pointer.read(dpr);
      const ease = reduced ? 1 : Math.min(1, dt * 2.5);
      const px = ptr?.active ? ptr.x / W - 0.5 : 0;
      const py = ptr?.active ? ptr.y / H - 0.5 : 0;
      yawOffset += (px * 0.5 - yawOffset) * ease;
      pitchOffset += (py * 0.18 - pitchOffset) * ease;
      const yaw = (reduced ? 0.42 : 0.42 + 0.2 * Math.sin(t * 0.09)) + yawOffset;
      const pitch = (reduced ? 0.36 : 0.36 + 0.05 * Math.sin(t * 0.13)) + pitchOffset;
      cam.cy = Math.cos(yaw);
      cam.sy = Math.sin(yaw);
      cam.cp = Math.cos(pitch);
      cam.sp = Math.sin(pitch);
      cam.dist = reduced
        ? 260
        : // dolly in for the build, back out to the same distance before the loop wraps
          lerp(380, 260, smooth((c - ASSEMBLE_AT + 0.3) / 2.4)) + 120 * smooth((c - RELEASE_AT) / 3.2);

      const { polys, mc } = buildScene(reduced ? 8.2 : t);

      // targets
      byPoly.forEach((ids, pi) => {
        const poly = polys[pi];
        const n = poly.pts.length;
        for (const id of ids) {
          const part = parts[id];
          const a = poly.pts[part.seg];
          const b = poly.pts[(part.seg + 1) % n];
          part.tx = lerp(a.x, b.x, part.f);
          part.ty = lerp(a.y, b.y, part.f);
          part.tz = lerp(a.z, b.z, part.f);
          part.a = poly.alpha ?? 1;
        }
      });

      const R = 150 * dpr;
      const pushEase = reduced ? 1 : Math.min(1, dt * 8);
      for (const part of parts) {
        if (!reduced) {
          part.hx += part.vx * dt;
          part.hy += part.vy * dt;
          part.hz += part.vz * dt;
          if (part.hx < VOL.x0) part.hx += VOL.x1 - VOL.x0;
          else if (part.hx > VOL.x1) part.hx -= VOL.x1 - VOL.x0;
          if (part.hy < VOL.y0) part.hy += VOL.y1 - VOL.y0;
          else if (part.hy > VOL.y1) part.hy -= VOL.y1 - VOL.y0;
          if (part.hz < VOL.z0) part.hz += VOL.z1 - VOL.z0;
          else if (part.hz > VOL.z1) part.hz -= VOL.z1 - VOL.z0;
        }
        part.p =
          part.poly < 0
            ? 0
            : reduced
              ? 1
              : smooth((c - ASSEMBLE_AT - part.delay) / ASSEMBLE_FOR) *
                (1 - smooth((c - RELEASE_AT - part.rdelay) / RELEASE_FOR));

        const q = project(
          lerp(part.hx, part.tx, part.p),
          lerp(part.hy, part.ty, part.p),
          lerp(part.hz, part.tz, part.p)
        );
        part.s = q.s;
        part.fog = fogAt(q.d);

        let ox = 0;
        let oy = 0;
        if (ptr?.active) {
          const dx = q.x - ptr.x;
          const dy = q.y - ptr.y;
          const d = Math.hypot(dx, dy);
          if (d < R && d > 0.5) {
            const f = (1 - d / R) ** 2 * 26 * dpr;
            ox = (dx / d) * f;
            oy = (dy / d) * f;
          }
        }
        part.mx += (ox - part.mx) * pushEase;
        part.my += (oy - part.my) * pushEase;
        part.x = q.x + part.mx;
        part.y = q.y + part.my;
      }

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;
      ctx!.clearRect(0, 0, W, H);

      // 1 · constellation lines between bright stars (screen space) ---------
      const bright = parts.filter((part) => part.bright && part.p < 0.6 && part.s > 0);
      const starR = 150 * dpr;
      ctx!.lineWidth = 0.8 * dpr;
      for (let i = 0; i < bright.length; i++) {
        for (let j = i + 1; j < bright.length; j++) {
          const a = bright[i];
          const b = bright[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > starR) continue;
          const alpha = 0.2 * (1 - d / starR) * (1 - Math.max(a.p, b.p)) * Math.min(a.fog, b.fog) * master;
          ctx!.strokeStyle = rgba(ink, alpha);
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      // 2 · floor shadows: the robot and parts drop dots onto y = 0 ----------
      ctx!.fillStyle = rgba(accent, 1);
      byPoly.forEach((ids, pi) => {
        if (!polys[pi].shadow) return;
        for (const id of ids) {
          const part = parts[id];
          const alpha = part.p * part.a * 0.16;
          if (alpha < 0.02) continue;
          const q = project(part.tx, 0, part.tz);
          ctx!.globalAlpha = alpha * fogAt(q.d) * master;
          const s = Math.max(0.6, 0.55 * q.s * (260 / focal) * dpr * 1.2);
          ctx!.fillRect(q.x - s / 2, q.y - s / 2, s, s);
        }
      });
      ctx!.globalAlpha = 1;

      // 3 · outline links, batched by alpha (formation × depth fog) ---------
      const buckets: number[][] = [[], [], [], [], []];
      byPoly.forEach((ids, pi) => {
        const closed = polys[pi].closed;
        const count = closed ? ids.length : ids.length - 1;
        const max = linkMax[pi];
        for (let i = 0; i < count; i++) {
          const a = parts[ids[i]];
          const b = parts[ids[(i + 1) % ids.length]];
          // Links only zip together over the last stretch of each flight, and never
          // span more than a few rest-lengths on screen — no web of long lines.
          const p = Math.min(a.p, b.p);
          const alpha = smooth((p - 0.55) / 0.45) * Math.min(a.a, b.a) * Math.min(a.fog, b.fog);
          if (alpha < 0.04) continue;
          if (Math.hypot(a.tx - b.tx, a.ty - b.ty, a.tz - b.tz) > max) continue;
          if (Math.hypot(a.x - b.x, a.y - b.y) > max * Math.max(a.s, b.s) * 2.5 + 6 * dpr) continue;
          buckets[Math.min(4, Math.floor(alpha * 5))].push(a.x, a.y, b.x, b.y);
        }
      });
      ctx!.lineWidth = 1 * dpr;
      buckets.forEach((segs, level) => {
        if (!segs.length) return;
        ctx!.strokeStyle = rgba(accent, ((level + 1) / 5) * 0.6 * master);
        ctx!.beginPath();
        for (let i = 0; i < segs.length; i += 4) {
          ctx!.moveTo(segs[i], segs[i + 1]);
          ctx!.lineTo(segs[i + 2], segs[i + 3]);
        }
        ctx!.stroke();
      });

      // 4 · pointer links ----------------------------------------------------
      if (ptr?.active) {
        const reach = 170 * dpr;
        let drawn = 0;
        for (const part of parts) {
          if (drawn > 36) break;
          if (!part.bright && part.p < 0.5) continue;
          const d = Math.hypot(part.x - ptr.x, part.y - ptr.y);
          if (d > reach) continue;
          ctx!.strokeStyle = rgba(part.p > 0.5 ? accent : ink, 0.3 * (1 - d / reach) * part.fog * master);
          ctx!.beginPath();
          ctx!.moveTo(ptr.x, ptr.y);
          ctx!.lineTo(part.x, part.y);
          ctx!.stroke();
          drawn++;
        }
      }

      // 5 · particles: size and brightness follow depth ----------------------
      const unit = (260 / focal) * dpr; // so a dot at the orbit distance is ~1 css px
      for (const pass of [ink, accent]) {
        ctx!.fillStyle = rgba(pass, 1);
        const isAccent = pass === accent;
        for (const part of parts) {
          if (part.s <= 0) continue;
          const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * part.tws + part.tw));
          const star = (part.bright ? 0.95 : 0.55) * twinkle;
          const alpha = (isAccent ? part.p * lerp(1, part.a, part.p) : star * (1 - part.p)) * part.fog;
          if (alpha < 0.02) continue;
          ctx!.globalAlpha = Math.min(1, alpha * master);
          const base = isAccent ? 1.35 : part.bright ? 1.6 : 1;
          const s = Math.min(4 * dpr, Math.max(0.6 * dpr, base * part.s * unit));
          ctx!.fillRect(part.x - s / 2, part.y - s / 2, s, s);
        }
      }

      // 6 · glows: stars, joints, stack light, grasp / place flashes, pulses -
      ctx!.globalCompositeOperation = "lighter";
      for (const part of bright) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * part.tws + part.tw);
        glow(accentGlow, part.x, part.y, 7 * part.s * unit, 0.22 * twinkle * (1 - part.p) * part.fog * master);
      }
      const glowAt = (sprite: HTMLCanvasElement | null, p: V3, r: number, alpha: number) => {
        const q = project(p.x, p.y, p.z);
        glow(sprite, q.x, q.y, r * q.s * unit, alpha * fogAt(q.d) * master);
      };
      const { arm } = mc;
      glowAt(accentGlow, SHOULDER, 16, 0.5 * hud);
      glowAt(accentGlow, arm.elbow, 13, 0.45 * hud);
      glowAt(accentGlow, arm.wrist, 12, 0.5 * hud);
      // signal tower: steady theme-colour blink while running, brighter during a grip
      glowAt(accentGlow, V(-72, 51, -6), 20, (0.35 + 0.4 * (0.5 + 0.5 * Math.sin(t * 5)) + 0.25 * mc.grip) * hud);
      const grasp = Math.exp(-(((mc.m - 0.75) / 0.16) ** 2));
      const place = Math.exp(-(((mc.m - 3.6) / 0.16) ** 2));
      glowAt(accentGlow, V(STATION_X, 27, 0), 40, 0.9 * grasp * hud);
      glowAt(accentGlow, V(SLOTS[mc.slotIndex].x, 17, SLOTS[mc.slotIndex].z), 40, 0.9 * place * hud);

      const armPath = [arm.wrist, arm.elbow, SHOULDER];
      const pulses: [V3[], number, number][] = [
        [armPath, 0.55, 0.4], // gripper → base: part detected
        [[V(-60, 24.2, 0), V(40, 24.2, 0)], 1.6, 1.2], // belt index
      ];
      for (const [path, start, dur] of pulses) {
        const s = (mc.m - start) / dur;
        if (s < 0 || s > 1.15) continue;
        const lens = path.slice(1).map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y, p.z - path[i].z));
        const total = lens.reduce((a, b) => a + b, 0);
        for (let i = 0; i < 8; i++) {
          let d = (s - i * 0.018) * total;
          if (d < 0 || d > total) continue;
          let j = 0;
          while (j < lens.length - 1 && d > lens[j]) d -= lens[j++];
          glowAt(accentGlow, lerp3(path[j], path[j + 1], d / lens[j]), i ? 6 : 13, (i ? 0.5 - i * 0.05 : 1) * hud);
        }
      }

      // Fieldbus: an arc exists only while a telegram is in flight on it ------
      const busActivity = BUSES.map(() => 0);
      ctx!.fillStyle = rgba(accent, 1);
      ctx!.strokeStyle = rgba(accent, 1);
      ctx!.lineWidth = 1 * dpr;
      BUSES.forEach((bus, bi) => {
        const ctrl = busControl(bus);
        glowAt(accentGlow, bus.from, 7, 0.3 * hud);
        glowAt(accentGlow, bus.to, 7, 0.3 * hud);
        for (const tg of bus.telegrams) {
          // also look one machine cycle back, so a telegram at m = 0 can fade in
          for (const shift of [0, -MACHINE]) {
            const s = (mc.m + shift - tg.at) / tg.dur;
            if (s < -0.3 || s > 1.9) continue;
            const vis = smooth((s + 0.3) / 0.3) * (1 - smooth((s - 1.1) / 0.8)) * hud;
            busActivity[bi] = Math.max(busActivity[bi], tg.small ? vis * 0.55 : vis);
            const at = (q: number) => bezier(bus.from, ctrl, bus.to, tg.reverse ? 1 - q : q);

            // dotted arc
            for (let i = 0; i <= 36; i++) {
              const p = at(i / 36);
              const q = project(p.x, p.y, p.z);
              ctx!.globalAlpha = (tg.small ? 0.22 : 0.45) * vis * fogAt(q.d) * master;
              const size = Math.max(0.8 * dpr, 1.1 * q.s * unit);
              ctx!.fillRect(q.x - size / 2, q.y - size / 2, size, size);
            }
            // telegram head + trail
            if (s >= 0 && s <= 1.12) {
              for (let i = 0; i < 7; i++) {
                const q = s - i * 0.035;
                if (q < 0 || q > 1) continue;
                const r = tg.small ? (i ? 3 : 6) : i ? 5 : 12;
                glowAt(accentGlow, at(q), r, (i ? 0.55 - i * 0.07 : 1) * (tg.small ? 0.6 : 1) * hud);
              }
            }
            // arrival ripple on the receiving device
            if (!tg.small && s > 1 && s < 1.7) {
              const k = (s - 1) / 0.7;
              const end = at(1);
              ctx!.globalAlpha = 0.7 * (1 - k) * hud * master;
              ctx!.beginPath();
              for (let i = 0; i <= 20; i++) {
                const a = (i / 20) * Math.PI * 2;
                const r = lerp(1.5, 10, k);
                const q = project(end.x + Math.cos(a) * r, end.y, end.z + Math.sin(a) * r);
                if (i) ctx!.lineTo(q.x, q.y);
                else ctx!.moveTo(q.x, q.y);
              }
              ctx!.stroke();
            }
          }
        }
      });

      // 7 · HUD: anchored labels, axis triad, frame brackets ----------------
      ctx!.globalCompositeOperation = "source-over";
      if (hud > 0.01) {
        ctx!.globalAlpha = hud * master;
        ctx!.font = `${10 * dpr}px ${font}`;
        const label = (text: string, p: V3, color: RGB, dx = 0, dy = 0, align: CanvasTextAlign = "left") => {
          const q = project(p.x, p.y, p.z);
          ctx!.textAlign = align;
          ctx!.fillStyle = rgba(color, 1);
          ctx!.fillText(text, q.x + dx * dpr, q.y + dy * dpr);
          ctx!.textAlign = "left";
        };
        label("CELL-01 / 机器人上下料工站", V(-80, 66, -6), muted);
        label("PLC", V(-80, 0, 1), muted, 0, 16);
        label("RUN", V(-80, 0, 1), accent, 24, 16);
        if (wide) {
          label(`J1 ${arm.j1.toFixed(1)}°  J2 ${arm.j2.toFixed(1)}°  J3 ${arm.j3.toFixed(1)}°`, V(BASE.x, 0, BASE.z + 8), muted, -40, 18);
        }
        label(`良品 ${(1280 + mc.k).toLocaleString("en-US")}`, V(65, 0, -18), accent, 0, 18, "center");
        label(`节拍 ${MACHINE.toFixed(1)} s`, V(65, 0, -18), muted, 0, 32, "center");

        // protocol tags at each arc's apex — readable at rest, bright while talking
        // (narrow screens: only while talking, there is no room to keep them all up)
        BUSES.forEach((bus, bi) => {
          const apex = bezier(bus.from, busControl(bus), bus.to, 0.5);
          const lit = busActivity[bi];
          const { dx, dy, align } = bus.tag ?? { dx: 0, dy: -14, align: "center" as const };
          ctx!.globalAlpha = (wide ? 0.4 + 0.6 * lit : lit) * hud * master;
          label(bus.name, apex, accent, dx, dy, align);
          if (wide) {
            ctx!.globalAlpha = (0.3 + 0.5 * lit) * hud * master;
            label(bus.spec, apex, muted, dx, dy + 12, align);
          }
        });
        ctx!.globalAlpha = hud * master;

        // axis triad, top-right of the frame: rotates with the camera
        const ox = cx + boxW / 2 - 30 * dpr;
        const oy = cy - boxH / 2 + 34 * dpr;
        const L = 16 * dpr;
        const axes: [V3, string, RGB][] = [
          [X, "X", accent],
          [Y, "Y", ink],
          [Z, "Z", muted],
        ];
        ctx!.lineWidth = 1 * dpr;
        for (const [axis, name, color] of axes) {
          const x1 = axis.x * cam.cy - axis.z * cam.sy;
          const z1 = axis.x * cam.sy + axis.z * cam.cy;
          const y2 = axis.y * cam.cp - z1 * cam.sp;
          ctx!.strokeStyle = rgba(color, 0.8);
          ctx!.beginPath();
          ctx!.moveTo(ox, oy);
          ctx!.lineTo(ox + x1 * L, oy - y2 * L);
          ctx!.stroke();
          ctx!.fillStyle = rgba(color, 0.8);
          ctx!.fillText(name, ox + x1 * (L + 6 * dpr) - 3 * dpr, oy - y2 * (L + 6 * dpr) + 3 * dpr);
        }
        ctx!.fillStyle = rgba(muted, wide ? 1 : 0);
        ctx!.textAlign = "right";
        ctx!.fillText(`YAW ${((yaw * 180) / Math.PI).toFixed(0)}°  PITCH ${((pitch * 180) / Math.PI).toFixed(0)}°`, ox - 28 * dpr, oy + 4 * dpr);
        ctx!.textAlign = "left";

        const B = 14 * dpr;
        const [x0, y0, x1, y1] = [cx - boxW / 2, cy - boxH / 2, cx + boxW / 2, cy + boxH / 2];
        ctx!.strokeStyle = rgba(accent, 0.6);
        ctx!.beginPath();
        for (const [x, y, ddx, ddy] of [
          [x0, y0, 1, 1],
          [x1, y0, -1, 1],
          [x0, y1, 1, -1],
          [x1, y1, -1, -1],
        ]) {
          ctx!.moveTo(x + ddx * B, y);
          ctx!.lineTo(x, y);
          ctx!.lineTo(x, y + ddy * B);
        }
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;
    }

    colors = {
      accent: readCssColor(canvas, "--primary"),
      ink: readCssColor(canvas, "--foreground"),
      muted: readCssColor(canvas, "--muted-foreground"),
    };
    accentGlow = glowSprite(colors.accent);

    init();
    const resize = new ResizeObserver(() => {
      init();
      if (reduced) render(0, 0);
    });
    resize.observe(canvas);

    const stopLoop = reduced ? () => {} : startLoop(canvas, render);
    if (reduced) render(0, 0);

    return () => {
      stopLoop();
      resize.disconnect();
      pointer.dispose();
    };
  }, [reduced]);

  return (
    <div className="relative size-full overflow-hidden bg-background">
      <div
        className="absolute top-1/2 right-[10%] size-176 -translate-y-1/2 rounded-full bg-primary/6 blur-[140px]"
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="absolute inset-0 size-full font-mono" />
      {/* Legibility: darken behind the headline, fade into the next section. */}
      <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/25 via-45% to-transparent to-70%" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
      {/* Narrow screens: the copy spans the full width, so scrim from the bottom instead. */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-background via-background/70 to-transparent lg:hidden" />
    </div>
  );
}
