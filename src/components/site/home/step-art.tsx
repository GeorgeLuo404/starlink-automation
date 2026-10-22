import type { CSSProperties } from "react";
import type { StepArtKey } from "@/content/step-art";
import * as drawings from "@/lib/line-art/drawings";
import { box, type Drawing, type Stroke, type View } from "@/lib/line-art/geometry";
import { LineArt } from "../line-art";

/* ==========================================================================
   流程插图 / Process step illustrations
   --------------------------------------------------------------------------
   The library each 服务流程 step picks its illustration from (choices and
   labels: src/content/step-art.ts). Six bespoke looping CAD-style animations,
   plus the cover line drawings drawn in stroke by stroke. Pure SVG + CSS
   keyframes (globals.css: art-*), so they need no JavaScript and the global
   reduced-motion rule leaves each one in its finished, fully drawn state.
   ========================================================================== */

const vars = (v: Record<string, string>) => v as CSSProperties;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 360 240" fill="none" className="h-auto w-full" aria-hidden="true">
      {children}
    </svg>
  );
}

const faint = { stroke: "currentColor", strokeOpacity: 0.22, strokeWidth: 1 } as const;
const base = { stroke: "currentColor", strokeOpacity: 0.62, strokeWidth: 1 } as const;
const label = { fill: "currentColor", fillOpacity: 0.55, fontSize: 9 } as const;

/* 01 需求评估 — a survey scan sweeps the site; measurement points light up as it passes. */
export function SurveyArt() {
  const cols = 13;
  const rows = 6;
  const SWEEP = 4.2;
  const dots = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ x: 36 + c * 24, y: 46 + r * 26, c, r }))
  ).flat();
  return (
    <Frame>
      {dots.map((d) => (
        <circle key={`f${d.c}-${d.r}`} cx={d.x} cy={d.y} r={1.6} fill="currentColor" fillOpacity={0.28} />
      ))}
      <rect x={120} y={59} width={120} height={78} rx={2} className="stroke-primary" strokeDasharray="4 4" />
      {dots.map((d) => (
        <circle
          key={`a${d.c}-${d.r}`}
          cx={d.x}
          cy={d.y}
          r={2.6}
          className="art-ping fill-primary"
          style={vars({ "--d": `${SWEEP}s`, "--delay": `${((d.x - 24) / 312) * SWEEP}s` })}
        />
      ))}
      <g className="art-scan" style={vars({ "--d": `${SWEEP}s`, "--scan-to": "312px" })}>
        <line x1={24} y1={30} x2={24} y2={190} className="stroke-primary" strokeWidth={1.4} />
        <rect x={20} y={26} width={8} height={4} className="fill-primary" />
      </g>
      <path d="M36 214 H324 M36 208 V220 M324 208 V220" {...base} />
      <text x={180} y={206} textAnchor="middle" className="font-mono" {...label}>
        12.6 m
      </text>
      <text x={36} y={22} className="font-mono" {...label}>
        现场测点 78 · 工艺节拍 6.5 s
      </text>
    </Frame>
  );
}

/* 02 方案设计 — isometric modules draw themselves in; the chosen station is picked out. */
export function DesignArt() {
  const v: View = { x: 188, y: 176, s: 1 };
  const parts: { strokes: Stroke[]; delay: number; label: string; at: [number, number] }[] = [
    { strokes: box(v, [-128, 0, -14], [-100, 72, 14]), delay: 0, label: "控制柜", at: [52, 62] },
    { strokes: box(v, [-86, 0, -12], [38, 26, 12]), delay: 0.5, label: "输送线", at: [150, 104] },
    { strokes: box(v, [52, 0, -16], [84, 44, 16], "accent"), delay: 1, label: "机器人工作站", at: [250, 82] },
  ];
  return (
    <Frame>
      {parts.map((p) => (
        <g key={p.label}>
          {p.strokes.map((s, i) => (
            <path
              key={i}
              d={s.d}
              pathLength={1}
              className={`art-draw ${s.tone === "accent" ? "stroke-primary" : ""}`}
              style={vars({ "--d": "6s", "--delay": `${p.delay + i * 0.05}s` })}
              {...(s.tone === "accent" ? { strokeWidth: 1.4 } : s.tone === "faint" ? faint : base)}
            />
          ))}
          <text x={p.at[0]} y={p.at[1]} className="font-mono" {...label}>
            {p.label}
          </text>
        </g>
      ))}
      <path d="M40 214 H320" {...faint} strokeDasharray="2 4" />
      <text x={40} y={230} className="font-mono" {...label}>
        方案 V2 · 3 个模块 · 接口 14 项
      </text>
    </Frame>
  );
}

/* 03 电气设计 — a schematic with current running round the circuit. */
export function CircuitArt() {
  const loop = "M48 64 H312 V184 H48 Z";
  const rung = "M48 124 H312";
  return (
    <Frame>
      <path d={loop} {...base} />
      <path d={rung} {...faint} />
      {/* contact K1, resistor R1, coil Y1, lamp H1 */}
      <path d="M118 52 V76 M132 52 V76" {...base} />
      <path d="M196 64 l6 -8 l8 16 l8 -16 l8 16 l8 -16 l6 8" {...base} />
      <circle cx={312} cy={104} r={11} {...base} />
      <circle cx={180} cy={124} r={9} {...faint} />
      <path d="M174 118 l12 12 M186 118 l-12 12" {...faint} />
      <path d="M48 184 v10 M40 194 h16 M43 199 h10 M46 204 h4" {...base} />
      <path d={loop} pathLength={1} className="art-flow stroke-primary" strokeWidth={2} style={vars({ "--d": "3.2s" })} />
      <path d={rung} pathLength={1} className="art-flow stroke-primary" strokeWidth={1.4} style={vars({ "--d": "2.2s", "--delay": "0.8s" })} />
      {[
        [48, 64],
        [312, 64],
        [312, 184],
        [48, 124],
        [312, 124],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} className="fill-primary" />
      ))}
      <g className="font-mono" {...label}>
        <text x={48} y={50}>+24V</text>
        <text x={116} y={46}>K1</text>
        <text x={204} y={46}>R1 2.2kΩ</text>
        <text x={328} y={108}>Y1</text>
        <text x={172} y={146}>H1</text>
        <text x={62} y={214}>0V</text>
      </g>
    </Frame>
  );
}

/* 04 程序开发 — the PLC scan cycle: input → logic → output, round and round. */
export function ScanCycleArt() {
  const cx = 180;
  const cy = 118;
  const R = 76;
  const at = (deg: number, r = R) => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r];
  const nodes = [
    { deg: -90, text: "输入采样", dx: 0, dy: -14, anchor: "middle" as const },
    { deg: 30, text: "程序执行", dx: 14, dy: 12, anchor: "start" as const },
    { deg: 150, text: "输出刷新", dx: -14, dy: 12, anchor: "end" as const },
  ];
  const [ax, ay] = at(-90);
  const [bx, by] = at(-30);
  return (
    <Frame>
      <circle cx={cx} cy={cy} r={R} {...faint} />
      {Array.from({ length: 36 }, (_, i) => {
        const [x1, y1] = at(i * 10, R + 6);
        const [x2, y2] = at(i * 10, R + (i % 3 === 0 ? 12 : 9));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} {...faint} />;
      })}
      <g className="art-spin" style={vars({ "--d": "3s", "--origin": `${cx}px ${cy}px` })}>
        <path d={`M${ax} ${ay} A${R} ${R} 0 0 1 ${bx} ${by}`} className="stroke-primary" strokeWidth={2.4} strokeLinecap="round" />
      </g>
      {nodes.map((n, i) => {
        const [x, y] = at(n.deg);
        return (
          <g key={n.text}>
            <circle cx={x} cy={y} r={6} {...base} fill="none" />
            <circle cx={x} cy={y} r={6} className="art-ping fill-primary" style={vars({ "--d": "3s", "--delay": `${0.17 + i}s` })} />
            <text x={x + n.dx} y={y + n.dy} textAnchor={n.anchor} {...label} fontSize={10}>
              {n.text}
            </text>
          </g>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" {...label}>
        扫描周期
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="font-mono" fill="currentColor" fontSize={16}>
        10 ms
      </text>
    </Frame>
  );
}

/* 05 现场调试 — a step response overshoots, then settles inside the tolerance band. */
export function TuningArt() {
  return (
    <Frame>
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`v${i}`} x1={40 + i * 32} y1={36} x2={40 + i * 32} y2={196} {...faint} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`h${i}`} x1={40} y1={36 + i * 32} x2={328} y2={36 + i * 32} {...faint} />
      ))}
      <path d="M40 196 H328 M40 36 V196" {...base} />
      <path d="M200 74 H328 M200 86 H328" className="stroke-primary" strokeOpacity={0.35} />
      <path d="M40 80 H328" {...base} strokeDasharray="4 4" />
      <path
        d="M40 196 C 70 196, 78 60, 108 62 S 140 92, 160 86 S 188 78, 204 80 L 328 80"
        pathLength={1}
        className="art-draw stroke-primary"
        strokeWidth={1.8}
        style={vars({ "--d": "5s" })}
      />
      <g {...label}>
        <text x={332} y={70} textAnchor="end">设定值</text>
        <text x={110} y={52} className="font-mono">超调 1.6%</text>
        <text x={210} y={104} className="font-mono">稳定 3.2 s · ±2%</text>
        <text x={40} y={216} className="font-mono">t →</text>
      </g>
    </Frame>
  );
}

/* 06 交付培训 — the handover checklist ticks off, then the delivery stamp lands. */
export function HandoverArt() {
  const items = ["操作手册", "维护培训", "备件清单", "程序备份", "验收报告"];
  return (
    <Frame>
      <rect x={84} y={22} width={192} height={200} rx={6} {...base} />
      <rect x={150} y={14} width={60} height={16} rx={3} {...base} />
      {items.map((text, i) => {
        const y = 52 + i * 32;
        return (
          <g key={text}>
            <rect x={104} y={y} width={14} height={14} rx={2} {...base} />
            <path
              d={`M107 ${y + 7} l4 4 l7 -9`}
              pathLength={1}
              className="art-draw stroke-primary"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={vars({ "--d": "6s", "--delay": `${0.3 + i * 0.45}s` })}
            />
            <text x={128} y={y + 11} {...label} fontSize={11} fillOpacity={0.75}>
              {text}
            </text>
            <path d={`M196 ${y + 7} H256`} {...faint} />
          </g>
        );
      })}
      <g className="art-pop" style={vars({ "--d": "6s", "--delay": "2.8s" })}>
        <circle cx={268} cy={196} r={30} className="stroke-primary" strokeWidth={1.6} />
        <circle cx={268} cy={196} r={24} className="stroke-primary" strokeOpacity={0.5} />
        <text x={268} y={200} textAnchor="middle" className="fill-primary" fontSize={11}>
          已交付
        </text>
      </g>
    </Frame>
  );
}

/** A cover drawing as an illustration: built once, drawn in on a loop. */
function drawn(make: () => Drawing) {
  let drawing: Drawing | undefined;
  return function DrawnArt() {
    drawing ??= make();
    return <LineArt drawing={drawing} animated className="size-full" />;
  };
}

/** Every illustration a step can choose, by the key it is saved under. */
export const STEP_ART: Record<StepArtKey, () => React.JSX.Element> = {
  survey: SurveyArt,
  design: DesignArt,
  circuit: CircuitArt,
  scan: ScanCycleArt,
  tuning: TuningArt,
  handover: HandoverArt,
  plcRack: drawn(() => drawings.plcRack()),
  cabinet: drawn(drawings.cabinet),
  schematic: drawn(() => drawings.schematic()),
  schematicStack: drawn(drawings.schematicStack),
  network: drawn(drawings.network),
  robotArm: drawn(() => drawings.robotArm()),
  robotCell: drawn(drawings.robotCell),
  visionLine: drawn(drawings.visionLine),
  assemblyLine: drawn(() => drawings.assemblyLine()),
  hotPress: drawn(() => drawings.hotPress()),
  batteryTray: drawn(() => drawings.batteryTray()),
  moduleMes: drawn(drawings.moduleMes),
  floorPlan: drawn(drawings.floorPlan),
  taktChart: drawn(drawings.taktChart),
  commissioning: drawn(drawings.commissioning),
  certificate: drawn(drawings.certificate),
};

/** The illustration for a saved key; null for 无插图 or a key no longer in the library. */
export function stepArtFor(key: string | undefined) {
  return key && Object.hasOwn(STEP_ART, key) ? STEP_ART[key as StepArtKey] : null;
}
