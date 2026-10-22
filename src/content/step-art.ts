/*
 * 流程插图库 / Process step illustrations — the choices offered for each step
 * of 服务流程 in the admin (首页 → 服务流程 → 插图). The drawings themselves are
 * in src/components/site/home/step-art.tsx; adding one there and listing it
 * here makes it selectable for every step, no other code needed.
 *
 * Plain data, so admin client components and server validation can share it.
 */

export const STEP_ART_GROUPS = ["流程动画", "设备与场景"] as const;

export const STEP_ART_OPTIONS = [
  // Bespoke looping animations, one per original delivery step.
  { key: "survey", label: "现场勘察", group: "流程动画" },
  { key: "design", label: "方案设计", group: "流程动画" },
  { key: "circuit", label: "电气设计", group: "流程动画" },
  { key: "scan", label: "程序开发", group: "流程动画" },
  { key: "tuning", label: "现场调试", group: "流程动画" },
  { key: "handover", label: "交付培训", group: "流程动画" },
  // The cover line drawings (src/lib/line-art/drawings.ts), drawn in stroke by stroke.
  { key: "plcRack", label: "PLC 控制柜", group: "设备与场景" },
  { key: "cabinet", label: "电气柜", group: "设备与场景" },
  { key: "schematic", label: "电气原理图", group: "设备与场景" },
  { key: "schematicStack", label: "图纸文档", group: "设备与场景" },
  { key: "network", label: "工业网络", group: "设备与场景" },
  { key: "robotArm", label: "工业机器人", group: "设备与场景" },
  { key: "robotCell", label: "机器人工作站", group: "设备与场景" },
  { key: "visionLine", label: "视觉检测线", group: "设备与场景" },
  { key: "assemblyLine", label: "装配产线", group: "设备与场景" },
  { key: "hotPress", label: "热压机", group: "设备与场景" },
  { key: "batteryTray", label: "电池托盘", group: "设备与场景" },
  { key: "moduleMes", label: "MES 数据采集", group: "设备与场景" },
  { key: "floorPlan", label: "产线布局", group: "设备与场景" },
  { key: "taktChart", label: "节拍分析", group: "设备与场景" },
  { key: "commissioning", label: "调试现场", group: "设备与场景" },
  { key: "certificate", label: "验收证书", group: "设备与场景" },
] as const satisfies readonly { key: string; label: string; group: (typeof STEP_ART_GROUPS)[number] }[];

export type StepArtKey = (typeof STEP_ART_OPTIONS)[number]["key"];

export const STEP_ART_KEYS = STEP_ART_OPTIONS.map((o) => o.key) as StepArtKey[];

/** What the original six steps showed, in order — the defaults for 服务流程. */
export const DEFAULT_STEP_ART: StepArtKey[] = ["survey", "design", "circuit", "scan", "tuning", "handover"];
