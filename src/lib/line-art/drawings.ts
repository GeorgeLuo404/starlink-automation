import {
  add,
  beam,
  box,
  circle2,
  cross,
  cylinder,
  dotGrid,
  faceX,
  faceY,
  faceZ,
  line2,
  merge,
  norm,
  path,
  project,
  rect2,
  ring,
  X,
  Y,
  Z,
  type Drawing,
  type Label,
  type P3,
  type Stroke,
  type View,
} from "./geometry";

/* ==========================================================================
   线稿题材 / Line-art subjects
   --------------------------------------------------------------------------
   One function per subject, each drawn on the 400 × 280 art board. Orange
   (accent) marks only the part that is "live": the joint that moves, the
   energised rung, the cell under test.
   ========================================================================== */

const mono = (x: number, y: number, text: string, extra: Partial<Label> = {}): Label => ({ x, y, text, mono: true, ...extra });

/* ------------------------------ 业务能力 ---------------------------------- */

/** PLC 程序调试 — a PLC rack on a DIN rail, status LEDs, field wiring. */
export function plcRack(v: View = { x: 196, y: 196, s: 1.12 }): Drawing {
  const s: Stroke[] = [...box(v, [-112, 0, -10], [118, 7, 10])];
  const widths = [40, 22, 22, 22, 22, 22, 22];
  let x = -104;
  widths.forEach((w, i) => {
    const top = i === 0 ? 92 : 80;
    s.push(...box(v, [x, 7, -26], [x + w - 2, top, 26]));
    if (i === 0) s.push(faceZ(v, 26, [x + 6, 52], [x + 32, 74], "base"));
    for (let k = 0; k < 3; k++) {
      const live = (i + k) % 3 === 0;
      s.push(faceZ(v, 26, [x + 5, 18 + k * 9], [x + 9, 22 + k * 9], live ? "accent" : "faint"));
    }
    x += w;
  });
  for (const [x0, drop] of [[-78, 40], [-34, 52], [10, 46], [54, 58]] as const) {
    s.push(path([[x0, 7, 26], [x0, -6, 40], [x0 + 6, -10, 26 + drop]], v, "faint"));
  }
  s.push(path([[-82, 92, 0], [-82, 112, 0], [60, 112, 0]], v, "accent"));
  return { strokes: s, dots: dotGrid(300, 36, 6, 4) };
}

/** Six-axis arm reaching across the board, joints in the accent colour. */
function robotStrokes(v: View, grip = 7, part = true): Stroke[] {
  const S: P3 = [0, 54, 0];
  const dir = norm([1, 0, -0.9]); // reach across the screen, in profile
  const side = norm(cross(dir, Y));
  const E = add(add(S, dir, -28), Y, 98);
  const W = add(add(E, dir, 96), Y, -46);
  const T = add(W, Y, -24);
  const s: Stroke[] = [
    ...cylinder(v, [0, 0, 0], 34, 14),
    ...cylinder(v, [0, 14, 0], 22, 22),
    ...ring(v, S, dir, Y, 15, "accent"),
    ...ring(v, add(S, side, 10), dir, Y, 15, "base", "faint"),
    ...beam(v, S, E, 20),
    ...ring(v, E, dir, Y, 11, "accent"),
    ...beam(v, E, W, 15),
    ...ring(v, W, dir, Y, 8, "accent"),
    path([W, T], v),
  ];
  for (const f of [-1, 1]) {
    const p = add(T, side, f * grip);
    s.push(path([add(T, side, f * 0.5), p, add(p, Y, -18)], v));
  }
  if (part) s.push(...box(v, [T[0] - 9, 0, T[2] - 9], [T[0] + 9, 14, T[2] + 9], "faint"));
  return s;
}

/** 机器人调试 — a six-axis arm over a part. */
export function robotArm(v: View = { x: 170, y: 232, s: 1 }, dots = true): Drawing {
  return { strokes: robotStrokes(v), dots: dots ? dotGrid(300, 40, 6, 4) : [] };
}

/** The robot drawn larger, for the closing call to action. */
export function ctaRobot(): Drawing {
  return { strokes: robotStrokes({ x: 176, y: 236, s: 1.04 }, 6), dots: dotGrid(290, 30, 7, 5) };
}

/** 电气图纸设计 — a schematic sheet: ladder rungs, one energised, title block. */
export function schematic(rev = "REV B", sheet = "SHEET 03 / 12"): Drawing {
  const strokes: Stroke[] = [
    rect2(36, 30, 328, 240, "faint"),
    ...Array.from({ length: 7 }, (_, i): Stroke => line2([[36 + (i + 1) * 41, 30], [36 + (i + 1) * 41, 36]], "faint")),
    rect2(44, 42, 312, 220),
    line2([[76, 56], [76, 206]]),
    line2([[318, 56], [318, 206]]),
    rect2(252, 214, 104, 42),
    { d: "M96 74 V112 M96 150 V188", tone: "faint" },
  ];
  [74, 112, 150, 188].forEach((y, i) => {
    if (i === 1) return;
    strokes.push({ d: `M76 ${y} H120 M120 ${y - 8} V${y + 8} M130 ${y - 8} V${y + 8} M130 ${y} H${i === 2 ? 168 : 250}`, tone: "base" });
    if (i === 2) strokes.push({ d: `M168 ${y - 8} V${y + 8} M178 ${y - 8} V${y + 8} M178 ${y} H250`, tone: "base" });
    strokes.push({ d: `M256 ${y - 9} A10 10 0 0 0 256 ${y + 9} M272 ${y - 9} A10 10 0 0 1 272 ${y + 9} M278 ${y} H318`, tone: "base" });
    strokes.push({ d: `M250 ${y} H256 M272 ${y} H278`, tone: "base" });
  });
  strokes.push({ d: "M76 112 H120 M120 104 V120 M130 104 V120 M130 112 H250", tone: "accent" });
  strokes.push({ d: "M256 103 A10 10 0 0 0 256 121 M272 103 A10 10 0 0 1 272 121 M278 112 H318 M250 112 H256 M272 112 H278", tone: "accent" });
  return {
    strokes,
    dots: [
      ...dotGrid(312, 8, 6, 2),
      { x: 76, y: 112, r: 2.2, tone: "accent" },
      { x: 318, y: 112, r: 2.2, tone: "accent" },
    ],
    labels: [mono(258, 228, "STARLINK · E-01", { fixed: true }), mono(258, 240, sheet, { fixed: true }), mono(258, 252, rev, { fixed: true, tone: "accent" })],
  };
}

/** 锂电池检测 — a cell tray under a probe gantry; the cell being tested glows. */
export function batteryTray(v: View = { x: 200, y: 184, s: 0.98 }): Drawing {
  const s: Stroke[] = [...box(v, [-96, 0, -62], [96, 10, 62])];
  for (const x of [-63, -21, 21, 63]) {
    for (const z of [-38, 0, 38]) {
      s.push(...cylinder(v, [x, 10, z], 11, 44, x === 21 && z === 0 ? "accent" : "base"));
    }
  }
  s.push(...box(v, [-110, 122, -6], [110, 132, 6]));
  s.push(...box(v, [12, 100, -8], [30, 122, 8]));
  s.push(path([[21, 100, 0], [21, 60, 0]], v, "accent"));
  s.push(...box(v, [-118, 0, -6], [-104, 132, 6], "faint"));
  s.push(...box(v, [104, 0, -6], [118, 132, 6], "faint"));
  return { strokes: s, dots: dotGrid(26, 30, 6, 4) };
}

/** 热压机 — a four-column hot press; the heated platen and press stroke in the accent. */
export function hotPress(v: View = { x: 200, y: 246, s: 0.9 }, dots = true): Drawing {
  const s: Stroke[] = [...box(v, [-82, 0, -52], [82, 24, 52])];
  for (const x of [-64, 64]) for (const z of [-36, 36]) s.push(...cylinder(v, [x, 24, z], 5, 152));
  s.push(...box(v, [-80, 176, -50], [80, 200, 50]));
  s.push(...box(v, [-70, 112, -44], [70, 126, 44]));
  s.push(...box(v, [-70, 24, -44], [70, 36, 44], "accent"));
  s.push(...box(v, [-40, 36, -26], [40, 40, 26], "faint"));
  s.push(...cylinder(v, [0, 200, 0], 15, 26));
  s.push(path([[0, 126, 0], [0, 176, 0]], v, "faint"));
  for (const x of [-34, 0, 34]) {
    s.push(path([[x, 106, 0], [x, 52, 0]], v, "accent"));
    s.push(path([[x - 5, 58, 0], [x, 52, 0], [x + 5, 58, 0]], v, "accent"));
  }
  return { strokes: s, dots: dots ? dotGrid(300, 30, 6, 4) : [] };
}

/* ------------------------------ 项目案例 ---------------------------------- */

/** A belt conveyor along x with legs and rollers; returns its strokes. */
function conveyor(v: View, x0: number, x1: number, w: number, top: number): Stroke[] {
  const s: Stroke[] = [...box(v, [x0, top - 8, -w], [x1, top, w])];
  for (let x = x0 + 10; x < x1; x += 20) s.push(path([[x, top, -w], [x, top, w]], v, "faint"));
  for (let x = x0 + 10; x < x1; x += Math.max(60, (x1 - x0) / 4)) {
    s.push(path([[x, 0, w], [x, top - 8, w]], v));
    s.push(path([[x, 0, -w], [x, top - 8, -w]], v, "faint"));
  }
  return s;
}

/** 电芯装配线 — prismatic cells on a conveyor; the one under the press station is live. */
export function assemblyLine(v: View = { x: 206, y: 156, s: 0.8 }, labels = true): Drawing {
  const top = 34;
  const s: Stroke[] = conveyor(v, -170, 170, 20, top);
  for (const x of [-150, -122, -94, -66, 54, 82, 110, 138]) s.push(...box(v, [x - 8, top, -11], [x + 8, top + 30, 11]));
  s.push(...box(v, [-8, top, -11], [8, top + 30, 11], "accent"));
  // press station straddling the belt
  s.push(...box(v, [-6, 0, -42], [6, 124, -34]));
  s.push(...box(v, [-6, 0, 34], [6, 124, 42]));
  s.push(...box(v, [-8, 124, -42], [8, 134, 42]));
  s.push(...box(v, [-10, 90, -10], [10, 124, 10]));
  s.push(path([[0, 90, 0], [0, top + 32, 0]], v, "accent"));
  // HMI on a post
  s.push(path([[40, 0, -60], [40, 96, -60]], v, "faint"));
  s.push(...box(v, [32, 96, -66], [48, 120, -54]));
  const [lx, ly] = project([8, 134, -42], v);
  return {
    strokes: s,
    dots: dotGrid(30, 200, 6, 4),
    labels: labels ? [mono(lx + 22, ly - 2, "ST-03 · 压装"), mono(lx + 22, ly + 9, "节拍 6.5 s")] : [],
  };
}

/** 机器人上下料 — the arm between a machine tool and a parts pallet. */
export function robotCell(): Drawing {
  const v: View = { x: 236, y: 234, s: 0.9 };
  const s: Stroke[] = robotStrokes(v, 7, false);
  // machine tool on the left
  s.push(...box(v, [-176, 0, -4], [-92, 104, 66]));
  s.push(faceZ(v, 66, [-168, 40], [-122, 90], "base"));
  s.push(faceZ(v, 66, [-114, 40], [-100, 90], "faint"));
  s.push(faceX(v, -92, [8, 70], [30, 94], "base"));
  s.push(faceX(v, -92, [12, 78], [18, 84], "accent"));
  // pallet under the gripper (which hangs over x 50, z −46), the next part lit
  s.push(...box(v, [16, 0, -80], [84, 6, -12]));
  for (const x of [30, 50, 70]) for (const z of [-66, -46, -26]) s.push(...cylinder(v, [x, 6, z], 6, 10, x === 50 && z === -46 ? "accent" : "faint"));
  return { strokes: s, dots: dotGrid(26, 26, 6, 4), labels: [mono(318, 150, "R-01"), mono(318, 162, "上下料 12 s")] };
}

/** 2D axes with a faint grid, for the chart-style drawings. */
function chart(x0: number, y0: number, x1: number, y1: number, cols = 6, rows = 4): Stroke[] {
  const s: Stroke[] = [];
  for (let i = 1; i <= cols; i++) s.push(line2([[x0 + ((x1 - x0) * i) / cols, y0], [x0 + ((x1 - x0) * i) / cols, y1]], "faint"));
  for (let i = 0; i < rows; i++) s.push(line2([[x0, y0 + ((y1 - y0) * i) / rows], [x1, y0 + ((y1 - y0) * i) / rows]], "faint"));
  s.push(line2([[x0, y0], [x0, y1], [x1, y1]]));
  return s;
}

/** 热压机温压闭环 — the press beside its temperature / pressure trend. */
export function hotPressLoop(): Drawing {
  const press = hotPress({ x: 112, y: 248, s: 0.6 }, false);
  const s: Stroke[] = chart(214, 60, 376, 204);
  s.push({ d: "M214 196 C 244 196, 252 112, 282 104 S 330 98, 376 98", tone: "accent" });
  s.push({ d: "M214 200 H262 V148 H376", tone: "base", dash: "4 4" });
  s.push(line2([[214, 92], [376, 92]], "faint"), line2([[214, 104], [376, 104]], "faint"));
  return merge(press, {
    strokes: s,
    dots: dotGrid(300, 16, 6, 3),
    labels: [mono(222, 84, "T 85.0 °C ±0.5"), mono(268, 142, "P 0.60 MPa"), mono(370, 218, "t", { anchor: "end" }), mono(28, 30, "HP-02 · PID")],
  });
}

/** 视觉检测 — parts pass under a camera; the one being inspected is lit. */
export function visionLine(): Drawing {
  const v: View = { x: 206, y: 168, s: 0.84 };
  const top = 30;
  const s: Stroke[] = conveyor(v, -170, 170, 16, top);
  for (const x of [-140, -100, -60, 60, 100, 140]) s.push(...cylinder(v, [x, top, 0], 11, 7, "base"));
  s.push(...cylinder(v, [0, top, 0], 11, 7, "accent"));
  // camera on a bracket
  s.push(...box(v, [-4, 0, -52], [4, 156, -44]));
  s.push(...beam(v, [0, 152, -48], [0, 152, -6], 8));
  s.push(...box(v, [-8, 126, -8], [8, 150, 8]));
  s.push(...ring(v, [0, 126, 0], X, Z, 6, "accent"));
  s.push(...ring(v, [0, 106, 0], X, Z, 18, "faint"));
  for (const p of [[11, 0], [-11, 0], [0, 11], [0, -11]] as const) {
    s.push({ ...path([[0, 124, 0], [p[0], top + 8, p[1]]], v, "accent"), dash: "3 3" });
  }
  // reject bin at the end
  s.push(...box(v, [176, 0, -18], [206, 22, 18], "faint"));
  return { strokes: s, dots: dotGrid(26, 196, 6, 4), labels: [mono(268, 40, "CAM-01 · 12 MP"), mono(268, 52, "OK 0.02 mm")] };
}

/** 模组 PACK 数据采集 — a battery module wired to the MES rack. */
export function moduleMes(): Drawing {
  const v: View = { x: 150, y: 214, s: 0.86 };
  const s: Stroke[] = [];
  s.push(...box(v, [-92, 0, -32], [-84, 62, 32]));
  s.push(...box(v, [84, 0, -32], [92, 62, 32]));
  for (let x = -76; x <= 76; x += 16) s.push(...box(v, [x - 6, 4, -27], [x + 6, 58, 27], x === 20 ? "accent" : "base"));
  s.push(path([[-84, 62, 30], [84, 62, 30]], v, "faint"));
  // MES rack
  const r: View = { x: 330, y: 168, s: 0.86 };
  s.push(...box(r, [-20, 0, -20], [20, 120, 20]));
  for (let y = 16; y < 112; y += 12) s.push(faceZ(r, 20, [-16, y], [16, y + 8], y === 64 ? "accent" : "faint"));
  // data link: module → rack, routed on a right angle
  const [ax, ay] = project([20, 62, 0], v);
  const [bx, by] = project([-20, 92, 20], r);
  s.push(line2([[ax, ay], [ax, ay - 46], [bx - 26, ay - 46], [bx - 26, by], [bx, by]], "accent"));
  return {
    strokes: s,
    dots: [...dotGrid(26, 26, 6, 4), { x: ax, y: ay - 46, r: 2.2, tone: "accent" }, { x: bx - 26, y: by, r: 2.2, tone: "accent" }],
    labels: [mono(bx - 2, by - 70, "MES", { anchor: "middle", size: 9 }), mono(ax + 8, ay - 34, "采集 1 s · 2 000 点")],
  };
}

/* ------------------------------ 新闻动态 ---------------------------------- */

/** 热压机产线交付 — two presses on the line, delivered. */
export function hotPressLine(): Drawing {
  const back: View = { x: 268, y: 186, s: 0.52 };
  const front: View = { x: 136, y: 254, s: 0.52 };
  const [ax, ay] = project([82, 200, -50], back);
  const [bx, by] = project([-82, 200, 50], front);
  return merge(hotPress(back, false), hotPress(front, false), {
    strokes: [],
    dots: dotGrid(26, 26, 6, 4),
    labels: [mono(ax + 8, ay, "HP-01 · 已交付"), mono(bx - 8, by, "HP-02", { anchor: "end" })],
  });
}

/** 资质认证 — a certificate with its seal. */
export function certificate(): Drawing {
  const s: Stroke[] = [rect2(100, 22, 200, 236), rect2(110, 32, 180, 216, "faint")];
  [96, 110, 124, 138, 152, 166].forEach((y, i) => s.push(line2([[132, y], [i % 2 ? 252 : 268, y]], "faint")));
  s.push(line2([[140, 74], [260, 74]]));
  // seal: two rings around the link-node hexagon
  const cx = 248;
  const cy = 212;
  s.push(circle2(cx, cy, 24, "accent"), circle2(cx, cy, 19, "accent"));
  const hex = Array.from({ length: 6 }, (_, i): [number, number] => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [cx + Math.cos(a) * 9, cy + Math.sin(a) * 9];
  });
  s.push(line2(hex, "accent", true));
  s.push(line2([[cx - 14, cy + 20], [cx - 20, cy + 44], [cx - 10, cy + 38], [cx - 4, cy + 46], [cx, cy + 24]], "accent"));
  return {
    strokes: s,
    dots: [...dotGrid(26, 26, 6, 4), { x: cx, y: cy, r: 2.2, tone: "accent" }],
    labels: [
      mono(200, 58, "ISO 9001 : 2015", { anchor: "middle", size: 9 }),
      { x: 200, y: 90, text: "质量管理体系认证证书", anchor: "middle", size: 8 },
      mono(132, 200, "NO. 2026-QMS-0417"),
    ],
  };
}

/** 锂电池检测方法 — one cell under two probes beside its discharge curve. */
export function batteryTest(): Drawing {
  const v: View = { x: 112, y: 222, s: 1.05 };
  const s: Stroke[] = [...cylinder(v, [0, 0, 0], 32, 112), ...cylinder(v, [0, 112, 0], 10, 6, "accent")];
  s.push(...ring(v, [0, 96, 0], X, Z, 32, "faint"));
  s.push(path([[0, 164, 0], [0, 120, 0]], v, "accent"), path([[-4, 126, 0], [0, 120, 0], [4, 126, 0]], v, "accent"));
  s.push(path([[24, 150, -24], [24, 112, -24]], v), path([[20, 118, -24], [24, 112, -24], [28, 118, -24]], v));
  s.push(...chart(212, 56, 376, 204));
  s.push({ d: "M212 76 C 262 80, 304 88, 330 108 S 364 172, 376 200", tone: "accent" });
  s.push({ d: "M212 92 H376", tone: "faint", dash: "4 4" });
  return {
    strokes: s,
    dots: dotGrid(300, 16, 6, 3),
    labels: [mono(220, 70, "3.65 V"), mono(220, 104, "内阻 0.8 mΩ"), mono(370, 218, "t", { anchor: "end" })],
  };
}

/** PLC 通信排查 — a PROFINET star with one broken link. */
export function network(): Drawing {
  const v: View = { x: 214, y: 172, s: 0.9 };
  const s: Stroke[] = [];
  s.push(...box(v, [-150, 0, -22], [-104, 64, 22]));
  for (let k = 0; k < 3; k++) s.push(faceZ(v, 22, [-144, 14 + k * 10], [-138, 18 + k * 10], k === 1 ? "accent" : "faint"));
  s.push(...box(v, [-28, 0, -110], [6, 74, -78])); // drive
  s.push(...box(v, [52, 0, -10], [86, 42, 24])); // remote I/O
  s.push(...box(v, [-46, 0, 74], [-14, 54, 104])); // HMI
  s.push(faceZ(v, 104, [-42, 24], [-18, 48], "faint"));
  const hub: P3 = [-64, 0, 0];
  s.push(path([[-104, 8, 0], hub], v), path([hub, [-64, 0, -94], [-28, 0, -94]], v), path([hub, [-64, 0, 89], [-46, 0, 89]], v));
  // the broken link: two halves with a gap and a cross
  s.push(path([hub, [-6, 0, 7]], v, "accent"), path([[14, 0, 7], [52, 0, 7]], v, "accent"));
  const [mx, my] = project([4, 0, 7], v);
  s.push(line2([[mx - 5, my - 5], [mx + 5, my + 5]], "accent"), line2([[mx - 5, my + 5], [mx + 5, my - 5]], "accent"));
  const [hx, hy] = project(hub, v);
  return {
    strokes: s,
    dots: [...dotGrid(300, 30, 6, 4), { x: hx, y: hy, r: 2.4, tone: "base" }],
    labels: [mono(mx + 10, my + 18, "ERR 0x8022 · 链路中断"), mono(26, 34, "PROFINET · 6 站")],
  };
}

/** 机器人团队扩充 — two arms side by side. */
export function robotPair(): Drawing {
  return merge(robotArm({ x: 250, y: 196, s: 0.72 }, false), robotArm({ x: 120, y: 244, s: 0.72 }, false), {
    strokes: [],
    dots: dotGrid(300, 220, 6, 4),
    labels: [mono(286, 60, "R-07"), mono(156, 108, "R-08")],
  });
}

/** 图纸规范 v2.0 — the schematic on a stack of sheets. */
export function schematicStack(): Drawing {
  const sheet = schematic("REV 2.0", "SHEET 01 / 48");
  return { ...sheet, strokes: [rect2(52, 14, 328, 240, "faint"), rect2(44, 22, 328, 240, "faint"), ...sheet.strokes] };
}

/* ------------------------------ 现场图库 ---------------------------------- */

/** 控制柜 — an open cabinet: wire ducts, terminal rows, the PLC. */
export function cabinet(): Drawing {
  const v: View = { x: 212, y: 230, s: 0.78 };
  const s: Stroke[] = [...box(v, [-60, 0, -44], [60, 190, 0])];
  const back = -40;
  for (const [x0, x1] of [[-54, -46], [46, 54]] as const) s.push(faceZ(v, back, [x0, 8], [x1, 182], "faint"));
  for (const y of [62, 122]) s.push(faceZ(v, back, [-46, y], [46, y + 8], "faint"));
  for (let x = -42; x < 42; x += 7) s.push(faceZ(v, back, [x, 28], [x + 5, 52], "base"));
  for (let x = -42; x < 42; x += 14) s.push(faceZ(v, back, [x, 84], [x + 11, 112], x === -42 ? "accent" : "base"));
  s.push(faceZ(v, back, [-42, 140], [-8, 172], "accent"), faceZ(v, back, [0, 140], [40, 172], "base"));
  // the door, swung open about 70°
  const a = (70 * Math.PI) / 180;
  const ex = -60 + 120 * Math.cos(a);
  const ez = 120 * Math.sin(a);
  s.push(path([[-60, 0, 0], [ex, 0, ez], [ex, 190, ez], [-60, 190, 0]], v, "base", true));
  s.push(path([[-60 + 16 * Math.cos(a), 30, 16 * Math.sin(a)], [-60 + 90 * Math.cos(a), 30, 90 * Math.sin(a)], [-60 + 90 * Math.cos(a), 150, 90 * Math.sin(a)], [-60 + 16 * Math.cos(a), 150, 16 * Math.sin(a)]], v, "faint", true));
  const [lx, ly] = project([60, 96, -44], v);
  return { strokes: s, dots: dotGrid(300, 30, 6, 4), labels: [mono(lx + 14, ly, "+CC01 · X1–X4"), mono(lx + 14, ly + 11, "PLC · 24 VDC")] };
}

/** 现场调试 — a laptop online with the PLC, a step response on screen. */
export function commissioning(): Drawing {
  const v: View = { x: 170, y: 214, s: 1 };
  const s: Stroke[] = [...box(v, [-64, 0, -42], [64, 6, 42])];
  s.push(faceY(v, 6, [-54, -8], [54, 30], "faint"));
  const at = (u: number, w: number): P3 => [-64 + 128 * u, 6 + 84 * w, -42 - 14 * w];
  s.push(path([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], v, "base", true));
  s.push(path([at(0.06, 0.08), at(0.94, 0.08), at(0.94, 0.92), at(0.06, 0.92)], v, "faint", true));
  for (const w of [0.3, 0.55]) s.push(path([at(0.1, w), at(0.9, w)], v, "faint"));
  const curve = Array.from({ length: 33 }, (_, i) => {
    const u = i / 32;
    const t = u * 6;
    const y = 1 - Math.exp(-t) * (Math.cos(2.4 * t) + 0.4 * Math.sin(2.4 * t));
    return at(0.1 + 0.8 * u, 0.16 + 0.5 * y);
  });
  s.push(path(curve, v, "accent"));
  // patch cable to the PLC
  s.push(...box(v, [98, 0, -36], [128, 54, -4]));
  for (let k = 0; k < 3; k++) s.push(faceZ(v, -4, [104, 12 + k * 9], [108, 16 + k * 9], k === 0 ? "accent" : "faint"));
  s.push(path([[64, 3, 24], [88, 0, 24], [113, 0, 24], [113, 0, -4]], v));
  return { strokes: s, dots: dotGrid(300, 26, 6, 4), labels: [mono(26, 34, "ONLINE · S7-1500"), mono(26, 46, "超调 1.6%")] };
}

/** 方案评审 — the line layout in plan view, with dimensions. */
export function floorPlan(): Drawing {
  const s: Stroke[] = [rect2(36, 36, 328, 188, "faint")];
  // U-shaped line: two conveyors joined by a transfer
  for (const y of [70, 170]) {
    s.push(rect2(70, y, 230, 18));
    for (let x = 80; x < 300; x += 12) s.push(line2([[x, y + 2], [x, y + 16]], "faint"));
  }
  s.push(rect2(300, 70, 22, 118));
  const stations: [number, number, boolean][] = [[100, 98, false], [160, 98, true], [220, 98, false], [130, 140, false], [200, 140, false]];
  stations.forEach(([x, y, live]) => s.push(rect2(x, y, 34, 26, live ? "accent" : "base")));
  s.push({ ...circle2(262, 128, 26, "faint"), dash: "3 3" }, rect2(256, 122, 12, 12));
  s.push(line2([[36, 248], [364, 248]]), line2([[36, 242], [36, 254]]), line2([[364, 242], [364, 254]]));
  s.push(line2([[378, 36], [378, 224]]), line2([[372, 36], [384, 36]]), line2([[372, 224], [384, 224]]));
  return {
    strokes: s,
    dots: dotGrid(46, 8, 6, 2),
    labels: [
      mono(200, 262, "32.0 m", { anchor: "middle" }),
      mono(166, 114, "ST-02"),
      mono(74, 62, "上料"),
      mono(74, 206, "下料"),
      mono(250, 166, "R-01"),
    ],
  };
}

/** 节拍验证 — station cycle times against the takt line; the bottleneck in the accent. */
export function taktChart(): Drawing {
  const s: Stroke[] = [line2([[96, 40], [96, 222], [372, 222]])];
  const times = [5.1, 5.8, 6.2, 4.6, 6.4, 5.5];
  const labels: Label[] = [];
  times.forEach((t, i) => {
    const y = 52 + i * 28;
    s.push(rect2(96, y, t * 40, 14, i === 4 ? "accent" : "base"));
    labels.push(mono(40, y + 10, `ST-0${i + 1}`), mono(102 + t * 40, y + 10, `${t.toFixed(1)} s`));
  });
  for (let k = 1; k <= 6; k++) s.push(line2([[96 + k * 40, 222], [96 + k * 40, 228]]));
  s.push({ d: "M356 34 V222", tone: "accent", dash: "4 4" });
  labels.push(mono(356, 30, "节拍 6.5 s", { anchor: "middle" }), mono(372, 242, "s", { anchor: "end" }));
  return { strokes: s, dots: dotGrid(300, 246, 6, 2), labels };
}

/** 作业现场 — the line with a robot cell beside it. */
export function workshop(): Drawing {
  return merge(assemblyLine({ x: 176, y: 140, s: 0.62 }, false), robotArm({ x: 300, y: 252, s: 0.66 }, false), {
    strokes: [],
    dots: dotGrid(26, 214, 6, 4),
    labels: [mono(300, 40, "深圳 · 宝安"), mono(300, 52, "LINE-02")],
  });
}

/* ------------------------------- registry --------------------------------- */

export const drawings = {
  plcRack,
  robotArm,
  ctaRobot,
  schematic,
  batteryTray,
  hotPress,
  assemblyLine,
  robotCell,
  hotPressLoop,
  visionLine,
  moduleMes,
  hotPressLine,
  certificate,
  batteryTest,
  network,
  robotPair,
  schematicStack,
  cabinet,
  commissioning,
  floorPlan,
  taktChart,
  workshop,
} satisfies Record<string, (...args: never[]) => Drawing>;

export type DrawingName = keyof typeof drawings;

/** Drawing for each service slug (the service cover placeholders use the same). */
export const serviceDrawing: Record<string, DrawingName> = {
  plc: "plcRack",
  robot: "robotArm",
  electrical: "schematic",
  battery: "batteryTray",
  "hot-press": "hotPress",
};
