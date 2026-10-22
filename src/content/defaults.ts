/**
 * 星链自动化 — 默认站点内容
 *
 * 这份文件有两个用途：
 *  1. 作为数据库不可用时的兜底内容，保证站点永远可以正常打开；
 *  2. 作为 `pnpm db:seed` 的数据源，让数据库与站点内容保持一致。
 *
 * 注意：不要在此文件中使用 "@/" 路径别名，prisma/seed.ts 需要以相对路径导入它。
 */

export type ServiceContent = {
  slug: string;
  /** Uploaded cover; when empty the bundled /media placeholder is used. */
  coverUrl?: string | null;
  title: string;
  summary: string;
  content: string;
  icon: string;
  features: string[];
  deliverables: string[];
  faq: { q: string; a: string }[];
  /** 详情页「现场影像」轮播；为空时不显示该区域。 */
  media?: MediaContent[];
};

/** 详情页轮播里的一项：图片、上传的视频或 B站 视频。 */
export type MediaContent = {
  kind: "IMAGE" | "VIDEO";
  /** 图片地址、视频文件地址或 B站 视频链接 */
  url: string;
  /** 视频封面 */
  posterUrl?: string | null;
  alt?: string | null;
  caption?: string | null;
};

export type CaseContent = {
  slug: string;
  /** Uploaded cover; when empty the bundled /media placeholder is used. */
  coverUrl?: string | null;
  title: string;
  client: string;
  industry: string;
  year: number;
  location: string;
  summary: string;
  content: string;
  scope: string[];
  metrics: { value: string; label: string }[];
  tags: string[];
  featured: boolean;
  /** 详情页轮播；为空时详情页显示封面图。 */
  media?: MediaContent[];
};

export type ArticleContent = {
  slug: string;
  /** Uploaded cover; when empty the bundled /media placeholder is used. */
  coverUrl?: string | null;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readMinutes: number;
  /** 详情页轮播；为空时详情页显示封面图。 */
  media?: MediaContent[];
};

export type DownloadContent = {
  slug: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: number;
  version: string;
  sortOrder: number;
};

export type GalleryContent = {
  title: string;
  caption: string;
  album: string;
  mediaKind: "IMAGE" | "VIDEO";
};

export type ProcessStep = {
  no: string;
  title: string;
  desc: string;
  /** 输出物 — what the client receives at the end of the step. */
  outputs: string[];
};

export type WhyItem = {
  no: string;
  title: string;
  desc: string;
};

export const company = {
  name: "深圳市星链自动化有限公司",
  shortName: "星链自动化",
  founded: 2024,
  address: "深圳市光明区凤凰街道甲子塘社区力缆科技大楼九层E区",
  phone: "138-0000-0000",
  email: "info@starlink-auto.com",
  emailAlt: "sales@starlink-auto.com",
  siteUrl: "https://www.starlink-auto.com",
};

/* ------------------------------------------------------------------ */
/* 业务能力 / Services                                                 */
/* ------------------------------------------------------------------ */

export const services: ServiceContent[] = [
  {
    slug: "plc",
    title: "PLC 程序调试",
    summary: "从控制方案、程序编写到现场联调，让设备按节拍稳定运行。",
    content: "我们以工艺节拍为出发点设计控制逻辑，而不是先写程序再谈产能。项目启动阶段即完成 I/O 清单、状态机设计与异常流程定义，程序结构分层清晰（设备层 / 单元层 / 产线层），便于后续扩线与维护。\n\n团队熟悉西门子 S7-1200/1500、三菱 FX/Q/iQ-R、欧姆龙 NJ/NX、汇川 AM/H5U、台达 AS、倍福 TwinCAT 等主流平台，可按照客户既有体系选型，不做品牌绑定。现场调试阶段我们提供完整的调试记录、参数备份与故障处理手册，确保产线在交付后仍可被快速定位与维护。",
    icon: "Cpu",
    features: [
      "控制方案与 I/O 清单编制",
      "PLC / HMI 程序开发与结构化编程",
      "伺服、步进与变频运动控制",
      "通信组网（Profinet / EtherCAT / Modbus / CC-Link）",
      "安全回路与急停逻辑设计",
      "现场联调、故障排查与陪产爬坡",
    ],
    deliverables: [
      "带注释的程序源码与版本备份",
      "I/O 清单与信号地址表",
      "设备参数备份与恢复说明",
      "操作与维护手册",
      "调试记录与问题闭环清单",
    ],
    faq: [
      {
        q: "可以在我们现有的程序上做二次开发吗？",
        a: "可以。我们会先做程序结构评审与备份，在保证原有功能不回退的前提下增量开发，并输出变更说明。",
      },
      {
        q: "支持哪些品牌的 PLC？",
        a: "西门子、三菱、欧姆龙、汇川、台达、倍福、松下、基恩士等主流品牌均有项目经验。",
      },
    ],
  },
  {
    slug: "robot",
    title: "机器人调试",
    summary: "从选型、仿真到现场标定，把机器人真正接入产线节拍。",
    content: "机器人不是买回来就能用的设备。我们会在选型阶段完成可达性分析、负载与惯量校核、节拍仿真，避免出现“够不着、跑不快、抓不稳”的典型问题。\n\n实施阶段涵盖末端执行器接口调试、轨迹示教与离线编程、视觉引导定位、与 PLC 的安全互锁与信号交互，以及碰撞检测、负载标定与精度验证。交付时提供机器人程序备份、示教点位表与安全配置说明，并对客户操作人员进行实操培训。",
    icon: "Bot",
    features: [
      "机器人选型、可达性与节拍仿真",
      "夹具与末端执行器接口调试",
      "轨迹示教与离线编程",
      "视觉引导定位（2D / 3D）",
      "与 PLC 的安全互锁与信号交互",
      "碰撞检测、负载与精度标定",
    ],
    deliverables: [
      "机器人程序与系统备份",
      "示教点位表与坐标系说明",
      "节拍仿真与可达性报告",
      "安全配置与风险评估记录",
      "操作人员实操培训",
    ],
    faq: [
      {
        q: "我们已经有机器人，只是节拍不达标，能帮忙优化吗？",
        a: "可以。我们通常会从轨迹路径、运动参数、等待逻辑与信号交互四个方向做节拍分解，找出真正的瓶颈点。",
      },
    ],
  },
  {
    slug: "electrical",
    title: "电气图纸设计",
    summary: "规范、可施工、可维护的电气设计文件。",
    content: "电气图纸是设备全生命周期中被翻阅次数最多的文件。我们按照统一的图框、编号与命名规则出图，保证施工方看得懂、维护人员查得到、后续改线接得上。\n\n设计内容覆盖电气原理图、系统框图、元器件选型与 BOM、控制柜布局与散热计算、端子接线表与线号定义、电缆清册等。图纸同步提供 EPLAN / CAD 源文件与 PDF 交付版，并进行内部评审与版本管理。",
    icon: "Ruler",
    features: [
      "电气原理图与系统框图",
      "元器件选型与 BOM 清单",
      "控制柜布局与散热计算",
      "端子接线表与线号定义",
      "电缆清册与现场布线指导",
      "图纸评审与版本管理",
    ],
    deliverables: [
      "EPLAN / CAD 图纸源文件",
      "元器件 BOM 与选型说明",
      "端子接线表与线号表",
      "电缆清册",
      "PDF 交付版图纸集",
    ],
    faq: [
      {
        q: "我们只有旧图纸的 PDF，能转成可编辑文件吗？",
        a: "可以。我们会按现行标准重新绘制并核对现场实际接线，输出可编辑源文件，同时修正原图中的隐患。",
      },
    ],
  },
  {
    slug: "battery",
    title: "锂电池检测",
    summary: "面向电芯与模组的绝缘、耐压、内阻与外观检测方案。",
    content: "锂电池检测的核心矛盾是“节拍”与“误判率”。检测做得越细，节拍越慢；判据放得越松，漏检越多。我们的做法是把检测项按风险分级，把必须全检的项目做进产线节拍，把抽检项目做成离线工位，并给出可量化的误判率指标。\n\n方案覆盖绝缘耐压（Hi-pot）测试、内阻与开路电压（OCV/IR）分选、气密性与泄漏检测、外观缺陷视觉检测，以及检测数据的采集、追溯与 MES 对接。",
    icon: "BatteryCharging",
    features: [
      "绝缘耐压（Hi-pot）测试系统集成",
      "内阻 / 开路电压（OCV / IR）分选",
      "气密性与泄漏检测",
      "外观缺陷视觉检测",
      "数据采集、追溯与 MES 对接",
      "检测节拍优化与误判率控制",
    ],
    deliverables: [
      "检测方案书与判据定义",
      "测试程序与参数配置",
      "数据追溯报表与接口文档",
      "误判率验证记录",
      "验收报告",
    ],
    faq: [
      {
        q: "检测数据可以接入我们现有的 MES 吗？",
        a: "可以。我们支持数据库直连、OPC UA、REST 接口与文件交换等方式，并提供字段映射与接口文档。",
      },
    ],
  },
  {
    slug: "hot-press",
    title: "热压机",
    summary: "温度、压力与时间的闭环控制，保证极片与电芯的一致性。",
    content: "热压工艺的难点在于一致性与稳定性：同一批次的温度曲线、压力曲线必须可复现，且能追溯到每一件产品。\n\n我们在温度多区闭环控制（PID 自整定）、压力伺服/液压闭环与保压控制、热压曲线配方管理、上下料自动化、安全门锁与光栅保护，以及 OEE 与工艺数据采集方面提供完整实现。所有工艺参数以配方形式管理，换型时一键调用，避免人工设定带来的偏差。",
    icon: "Flame",
    features: [
      "温度多区闭环控制（PID 自整定）",
      "压力伺服 / 液压闭环与保压控制",
      "热压曲线配方管理与追溯",
      "上下料自动化与机器人对接",
      "安全门锁与光栅保护",
      "设备 OEE 与工艺数据采集",
    ],
    deliverables: [
      "电气设计与控制程序",
      "配方管理系统",
      "工艺曲线报告与验证记录",
      "安全评估与整改记录",
      "维护手册与备件清单",
    ],
    faq: [
      {
        q: "温控精度可以做到多少？",
        a: "在合理的热设计与传感器布置前提下，稳态波动通常可控制在 ±1℃，热板面均匀性可达 ±2℃。具体以工艺验证结果为准。",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 服务流程 / Process                                                  */
/* ------------------------------------------------------------------ */

export const processSteps: ProcessStep[] = [
  {
    no: "01",
    title: "需求评估",
    desc: "现场勘察与工艺拆解，输出可行性评估、节拍测算与风险清单。",
    outputs: ["可行性评估报告", "节拍测算", "风险清单"],
  },
  {
    no: "02",
    title: "方案设计",
    desc: "确定控制架构、设备选型与接口定义，明确验收标准。",
    outputs: ["控制架构图", "设备选型清单", "接口定义", "验收标准"],
  },
  {
    no: "03",
    title: "电气设计",
    desc: "输出电气原理图、柜体布局、端子表与电缆清册全套文件。",
    outputs: ["电气原理图", "柜体布局", "端子表", "电缆清册"],
  },
  {
    no: "04",
    title: "程序开发",
    desc: "PLC、HMI 与机器人程序编写，离线仿真验证后进入现场。",
    outputs: ["PLC / HMI 程序", "机器人程序", "离线仿真记录"],
  },
  {
    no: "05",
    title: "现场调试",
    desc: "就位接线、单机调试到整线联调，陪产爬坡直至达到节拍。",
    outputs: ["单机调试记录", "联调报告", "节拍验证"],
  },
  {
    no: "06",
    title: "交付培训",
    desc: "操作与维护培训、备件清单交付与长期技术支持。",
    outputs: ["操作与维护手册", "培训记录", "备件清单"],
  },
];

/* ------------------------------------------------------------------ */
/* 为什么选择星链 / Why Starlink                                        */
/* ------------------------------------------------------------------ */

export const whyItems: WhyItem[] = [
  {
    no: "01",
    title: "标准化电气设计",
    desc: "统一的图框、编号与命名规则，图纸可直接交付施工与后续维护，不产生“只有原作者看得懂”的图纸。",
  },
  {
    no: "02",
    title: "多品牌控制平台",
    desc: "西门子、三菱、欧姆龙、汇川、台达、倍福均可实施，按客户既有体系选型，不做品牌绑定。",
  },
  {
    no: "03",
    title: "机器人集成能力",
    desc: "发那科、ABB、库卡、安川、爱普生、优傲等品牌，配合视觉与力控完成复杂工艺动作。",
  },
  {
    no: "04",
    title: "锂电专机经验",
    desc: "从电芯装配、热压到检测分选，理解锂电产线对节拍、洁净度与一致性的真实要求。",
  },
  {
    no: "05",
    title: "全过程可追溯",
    desc: "从 I/O 表到调试记录全部归档，问题可定位、改动可回溯、责任可界定。",
  },
  {
    no: "06",
    title: "快速响应机制",
    desc: "7×24 电话响应，珠三角 4 小时到场，异地 24 小时内到场支援。",
  },
];

/* ------------------------------------------------------------------ */
/* 支持的品牌与平台 / Supported brands (the Partner table)            */
/* ------------------------------------------------------------------ */

export type PartnerContent = { name: string; nameZh: string; logoUrl?: string };

/** Logos live in public/brands; where each came from is in docs/BRAND-LOGOS.md. */
export const partners: PartnerContent[] = [
  { name: "SIEMENS", nameZh: "西门子", logoUrl: "/brands/siemens.svg" },
  { name: "MITSUBISHI", nameZh: "三菱电机", logoUrl: "/brands/mitsubishi-electric.svg" },
  { name: "OMRON", nameZh: "欧姆龙", logoUrl: "/brands/omron.svg" },
  { name: "INOVANCE", nameZh: "汇川技术", logoUrl: "/brands/inovance.svg" },
  { name: "DELTA", nameZh: "台达电子", logoUrl: "/brands/delta.svg" },
  { name: "BECKHOFF", nameZh: "倍福自动化", logoUrl: "/brands/beckhoff.svg" },
  { name: "FANUC", nameZh: "发那科", logoUrl: "/brands/fanuc.svg" },
  { name: "ABB", nameZh: "ABB 机器人", logoUrl: "/brands/abb.svg" },
  { name: "KUKA", nameZh: "库卡", logoUrl: "/brands/kuka.svg" },
  { name: "YASKAWA", nameZh: "安川电机", logoUrl: "/brands/yaskawa.svg" },
  { name: "EPSON", nameZh: "爱普生", logoUrl: "/brands/epson.svg" },
  { name: "UNIVERSAL ROBOTS", nameZh: "优傲机器人", logoUrl: "/brands/universal-robots.svg" },
];

/* ------------------------------------------------------------------ */
/* 项目案例 / Case studies                                             */
/* ------------------------------------------------------------------ */

export const cases: CaseContent[] = [
  {
    slug: "cell-assembly-line-control",
    title: "方形铝壳电芯装配线控制系统",
    client: "国内头部动力电池企业",
    industry: "新能源锂电",
    year: 2025,
    location: "广东 · 惠州",
    summary: "为 12 工位电芯装配线提供整线控制与数据采集，节拍由 6.5s 优化至 5.2s。",
    content: "客户原有装配线为分段控制，工位之间依赖人工确认转序，导致节拍波动大、异常难以定位。我们重新梳理了整线状态机，将 12 个工位纳入统一的控制与调度逻辑，并引入基于条码的全流程追溯。\n\n项目采用西门子 S7-1500 作为主控，工位间通过 Profinet 通信；上位机负责配方下发、报警归档与 OEE 统计。交付后整线节拍稳定在 5.2s，异常平均定位时间从 25 分钟缩短到 4 分钟。",
    scope: [
      "整线控制方案与状态机设计",
      "PLC 程序开发与现场调试",
      "上位机配方与 OEE 系统",
      "条码追溯与 MES 数据对接",
    ],
    metrics: [
      { value: "-20%", label: "节拍时间" },
      { value: "99.6%", label: "设备综合效率" },
      { value: "4 min", label: "异常平均定位" },
    ],
    tags: ["S7-1500", "Profinet", "MES", "追溯"],
    featured: true,
  },
  {
    slug: "robot-tending-workstation",
    title: "六轴机器人上下料工作站",
    client: "精密结构件制造商",
    industry: "3C 电子",
    year: 2024,
    location: "广东 · 深圳",
    summary: "CNC 加工单元机器人上下料改造，实现 1 人看管 6 台机床。",
    content: "客户原有 6 台 CNC 由 3 名操作工轮班上下料，人员流动直接导致产能波动。我们以一台六轴机器人搭配双工位夹具与视觉定位，完成毛坯上料、成品下料与料框管理。\n\n难点在于毛坯来料位置存在 ±3mm 偏差。我们通过 2D 视觉定位补偿，将抓取成功率提升至 99.8%，并在机器人夹具上集成气密检测，避免空抓与掉件。改造后单班人员由 3 人降至 1 人。",
    scope: [
      "机器人选型与节拍仿真",
      "夹具与末端执行器设计对接",
      "2D 视觉定位与标定",
      "与 CNC、PLC 的安全互锁",
    ],
    metrics: [
      { value: "3 → 1", label: "单班操作人数" },
      { value: "99.8%", label: "抓取成功率" },
      { value: "18s", label: "单件节拍" },
    ],
    tags: ["FANUC", "视觉定位", "CNC", "安全互锁"],
    featured: true,
  },
  {
    slug: "hot-press-temperature-pressure-loop",
    title: "电芯热压机温压闭环控制",
    client: "动力电池设备集成商",
    industry: "新能源锂电",
    year: 2025,
    location: "江苏 · 常州",
    summary: "多区温控与压力闭环改造，热板均匀性 ±2℃，压力波动 ±1.5%。",
    content: "热压工艺的一致性直接影响电芯内阻与循环寿命。原设备采用单点测温控制整块热板，边缘与中心温差达到 8℃，导致批次一致性差。\n\n我们重新划分温区，采用多点测温 + 分区 PID 自整定，并对液压系统引入压力闭环与保压补偿算法。改造后热板面均匀性控制在 ±2℃ 以内，压力波动由 ±6% 收敛至 ±1.5%，工艺曲线可完整记录并追溯到单件产品。",
    scope: [
      "多区温控方案与 PID 自整定",
      "压力闭环与保压补偿算法",
      "配方管理与工艺曲线追溯",
      "安全门锁与光栅保护改造",
    ],
    metrics: [
      { value: "±2℃", label: "热板均匀性" },
      { value: "±1.5%", label: "压力波动" },
      { value: "100%", label: "工艺曲线可追溯" },
    ],
    tags: ["热压机", "温控", "PID", "配方管理"],
    featured: true,
  },
  {
    slug: "auto-parts-vision-inspection",
    title: "汽车零部件视觉检测线",
    client: "汽车零部件一级供应商",
    industry: "汽车零部件",
    year: 2024,
    location: "广东 · 广州",
    summary: "替代人工目检的自动化外观检测线，漏检率从 1.2% 降至 0.15%。",
    content: "客户产品表面缺陷种类多、批量大，人工目检不仅漏检率高，还难以形成可追溯的质量数据。\n\n我们设计了 4 工位视觉检测线，覆盖上下表面与两个侧面，采用多角度光源分离划痕、脏污与压伤三类缺陷，并结合 PLC 实现自动分选与数据回传。系统上线后漏检率由 1.2% 降至 0.15%，同时为客户积累了可用于工艺改进的缺陷分布数据。",
    scope: [
      "检测工位布局与光学方案",
      "视觉算法与缺陷分类",
      "PLC 分选控制与数据回传",
      "质量数据看板",
    ],
    metrics: [
      { value: "0.15%", label: "漏检率" },
      { value: "4", label: "检测工位" },
      { value: "3.5s", label: "单件节拍" },
    ],
    tags: ["机器视觉", "缺陷检测", "PLC", "质量管理"],
    featured: false,
  },
  {
    slug: "module-pack-mes-integration",
    title: "模组 PACK 线数据采集与 MES 对接",
    client: "储能电池制造商",
    industry: "新能源锂电",
    year: 2025,
    location: "安徽 · 合肥",
    summary: "为 8 个工位建立统一数据采集层，实现单件级全流程追溯。",
    content: "客户 PACK 线设备品牌混杂，数据分散在各设备本地，无法回答“这一件产品经过了哪些工位、参数是多少”。\n\n我们建立统一的数据采集层，通过 OPC UA、Modbus TCP 与数据库直连三种方式接入 8 个工位的异构设备，统一时间戳与数据模型后写入 MES。现在可以按产品序列号反查全部工艺参数与操作记录，质量异常的责任界定时间大幅缩短。",
    scope: [
      "异构设备数据采集层建设",
      "统一数据模型与时间戳对齐",
      "MES 接口开发与联调",
      "追溯查询与报表",
    ],
    metrics: [
      { value: "8", label: "接入工位" },
      { value: "3", label: "支持协议" },
      { value: "100%", label: "单件级追溯" },
    ],
    tags: ["OPC UA", "MES", "数据采集", "追溯"],
    featured: false,
  },
];

/* ------------------------------------------------------------------ */
/* 新闻 / News                                                         */
/* ------------------------------------------------------------------ */

export const articles: ArticleContent[] = [
  {
    slug: "hot-press-line-delivered",
    title: "公司完成某头部电池企业热压机产线交付",
    excerpt: "历经 14 周的设计、开发与现场调试，我司承接的热压机产线控制项目顺利通过客户验收，热板均匀性达到 ±2℃。",
    content: "## 项目概况\n\n本项目为客户新建产线的核心工艺设备，包含 6 台热压机、自动上下料机构与在线检测工位。星链自动化承担整线控制方案、电气图纸设计、PLC 程序开发与现场调试。\n\n## 技术要点\n\n- 热板多区温控，采用分区 PID 自整定，稳态均匀性 ±2℃\n- 液压压力闭环与保压补偿，压力波动控制在 ±1.5% 以内\n- 热压曲线以配方形式管理，换型时间从 40 分钟缩短至 5 分钟\n- 全部工艺数据按单件追溯，可导出用于工艺分析\n\n## 客户反馈\n\n客户工艺负责人表示，产线在连续 72 小时试运行中未出现因控制系统导致的停机，节拍稳定在合同要求的 8.5 秒以内。",
    category: "公司新闻",
    tags: ["热压机", "交付", "锂电"],
    publishedAt: "2026-01-18",
    readMinutes: 4,
  },
  {
    slug: "iso9001-certified",
    title: "星链自动化通过 ISO 9001 质量管理体系认证",
    excerpt: "公司质量管理体系通过第三方审核，覆盖自动化系统设计、程序开发与现场调试服务全过程。",
    content: "## 认证范围\n\n本次认证覆盖公司主营业务的完整交付链路：自动化系统方案设计、电气图纸设计、PLC 与机器人程序开发、现场调试与技术服务。\n\n## 为什么重要\n\n对客户而言，体系认证意味着交付过程是可预期、可追溯的。我们把方案评审、图纸校核、程序版本管理、调试记录归档等环节固化为流程文件，减少了对个人经验的依赖。\n\n## 后续计划\n\n公司将在 2026 年内推进 ISO 14001 环境管理体系与 ISO 45001 职业健康安全管理体系的建设。",
    category: "公司新闻",
    tags: ["质量体系", "认证"],
    publishedAt: "2026-01-06",
    readMinutes: 3,
  },
  {
    slug: "battery-inspection-methods",
    title: "锂电池检测的几种常见方法与选型建议",
    excerpt: "绝缘耐压、内阻分选、气密检测与视觉外观检测各解决什么问题？如何根据产线节拍与风险等级做取舍？",
    content: "## 一、绝缘耐压（Hi-pot）\n\n用于验证电芯或模组在高压下的绝缘性能，是安全相关的必检项。选型时重点关注测试电压、爬电时间与放电回路设计，测试工位必须与上下料机构做安全互锁。\n\n## 二、内阻与开路电压（OCV / IR）\n\n主要用于分选，衡量电芯一致性。核心指标是测量重复性而非绝对精度——分选档位边界附近的重复性直接决定误判率。\n\n## 三、气密性与泄漏检测\n\n适用于有密封要求的电芯与模组。需注意温度补偿，否则环境温度波动会被误判为泄漏。\n\n## 四、视觉外观检测\n\n覆盖划痕、脏污、变形、极柱缺陷等。难点不在算法，而在光源方案与缺陷样本的积累。建议在项目早期就建立缺陷样本库。\n\n## 选型建议\n\n把检测项按风险分为三级：安全相关必检且必须进产线节拍；影响性能的按批次抽检；仅影响外观的按客户标准取舍。宁可减少检测项，也不要让检测工位成为整线瓶颈。",
    category: "技术分享",
    tags: ["锂电池检测", "Hi-pot", "OCV", "机器视觉"],
    publishedAt: "2025-12-20",
    readMinutes: 7,
  },
  {
    slug: "plc-communication-troubleshooting",
    title: "PLC 程序调试中常见的十类通信故障与排查思路",
    excerpt: "从物理层到应用层，一份可直接用于现场排查的通信故障定位清单。",
    content: "## 排查顺序很重要\n\n现场排查最常见的错误是从程序改起。正确顺序是：物理层 → 链路层 → 网络层 → 应用层。\n\n## 物理层（占比约 40%）\n\n1. 网线水晶头压接不良或线序错误\n2. 屏蔽层单端接地未做，或两端都接地形成环流\n3. 通信线与动力线同槽敷设，变频器干扰\n4. 终端电阻未接或重复接入\n\n## 链路与网络层\n\n5. IP 地址冲突或子网掩码不一致\n6. 设备名（Profinet Device Name）未分配或与组态不符\n7. 交换机为非管理型且带宽被大流量占用\n\n## 应用层\n\n8. 数据长度与数据类型不匹配，出现字节错位\n9. 握手信号未做超时处理，单侧等待导致死锁\n10. 从站响应周期大于主站轮询周期，造成偶发丢包\n\n## 一条经验\n\n如果故障是“偶发”的，先怀疑干扰与接地；如果故障是“必现”的，先怀疑配置与地址。",
    category: "技术分享",
    tags: ["PLC", "通信", "故障排查", "Profinet"],
    publishedAt: "2025-12-02",
    readMinutes: 8,
  },
  {
    slug: "robot-team-expansion",
    title: "我司新增机器人调试工程师团队，服务能力再升级",
    excerpt: "新组建的机器人调试组由 6 名工程师组成，覆盖发那科、ABB、库卡与优傲平台。",
    content: "为进一步提升机器人集成项目的交付能力，公司于本月完成机器人调试组的组建，成员共 6 名，均具备 5 年以上现场经验。\n\n团队组建后，公司可同时并行开展 4 个机器人集成项目的现场调试，平均到场响应时间由 48 小时缩短至 24 小时以内。\n\n同时，公司已完成机器人离线编程与仿真工作站的搭建，可在项目进场前完成轨迹验证与节拍确认，减少现场占用时间。",
    category: "公司新闻",
    tags: ["团队", "机器人"],
    publishedAt: "2025-11-15",
    readMinutes: 2,
  },
  {
    slug: "electrical-drawing-standard-v2",
    title: "电气图纸设计规范 v2.0 正式发布",
    excerpt: "新规范统一了图框、编号规则与元件命名，并新增图纸评审检查表。",
    content: "公司于本月发布《电气图纸设计规范 v2.0》，在 v1.0 基础上做了三项调整：\n\n1. 统一图框与标题栏字段，明确必须填写的信息项\n2. 细化元件命名规则，要求位号与 BOM 一一对应\n3. 新增图纸评审检查表，共 28 项检查内容，出图前逐项确认\n\n规范同时适用于 EPLAN 与 CAD 两种出图方式，相关模板已同步至公司共享盘。",
    category: "公司新闻",
    tags: ["电气设计", "规范", "EPLAN"],
    publishedAt: "2025-10-28",
    readMinutes: 3,
  },
];

/* ------------------------------------------------------------------ */
/* 资料下载 / Downloads                                                */
/* ------------------------------------------------------------------ */

export const downloads: DownloadContent[] = [
  {
    slug: "company-brochure-2026",
    title: "星链自动化公司宣传册 2026",
    description: "公司简介、五项核心业务、典型项目案例与联系方式，适合首次了解我们的客户。",
    fileType: "PDF",
    fileSize: 8_400_000,
    version: "2026.1",
    sortOrder: 1,
  },
  {
    slug: "battery-inspection-whitepaper",
    title: "锂电池检测解决方案白皮书",
    description: "系统梳理绝缘耐压、内阻分选、气密检测与视觉检测的选型逻辑与节拍权衡方法。",
    fileType: "PDF",
    fileSize: 5_100_000,
    version: "v1.3",
    sortOrder: 2,
  },
  {
    slug: "hot-press-datasheet",
    title: "热压机技术参数表",
    description: "温区配置、压力范围、控制精度与可选配置清单，方便前期选型对比。",
    fileType: "PDF",
    fileSize: 2_300_000,
    version: "v2.0",
    sortOrder: 3,
  },
  {
    slug: "electrical-delivery-checklist",
    title: "电气图纸设计交付清单",
    description: "一套完整电气设计文件应包含的全部内容，可直接用作验收对照表。",
    fileType: "PDF",
    fileSize: 620_000,
    version: "v2.0",
    sortOrder: 4,
  },
  {
    slug: "plc-service-capability",
    title: "PLC 调试服务能力说明",
    description: "支持的控制平台、服务范围、交付物与响应时效说明。",
    fileType: "PDF",
    fileSize: 1_800_000,
    version: "v1.1",
    sortOrder: 5,
  },
];

/* ------------------------------------------------------------------ */
/* 图库 / Gallery                                                      */
/* ------------------------------------------------------------------ */

export const galleryItems: GalleryContent[] = [
  { title: "电芯装配线整线调试", caption: "12 工位整线联调现场", album: "产线现场", mediaKind: "IMAGE" },
  { title: "热压机温控柜", caption: "多区温控与压力闭环控制柜", album: "设备实拍", mediaKind: "IMAGE" },
  { title: "机器人上下料工作站", caption: "六轴机器人与双工位夹具", album: "产线现场", mediaKind: "IMAGE" },
  { title: "控制柜内部接线", caption: "按端子表施工的规范接线", album: "设备实拍", mediaKind: "IMAGE" },
  { title: "视觉检测工位", caption: "多角度光源与相机布局", album: "产线现场", mediaKind: "IMAGE" },
  { title: "现场调试作业", caption: "工程师进行单机调试", album: "团队风采", mediaKind: "IMAGE" },
  { title: "技术方案评审", caption: "项目启动阶段的方案评审会", album: "团队风采", mediaKind: "IMAGE" },
  { title: "电气图纸设计", caption: "EPLAN 出图与图纸校核", album: "设备实拍", mediaKind: "IMAGE" },
  { title: "产线节拍验证", caption: "连续运行测试与节拍记录", album: "产线现场", mediaKind: "IMAGE" },
];

/* ------------------------------------------------------------------ */
/* 集成能力环形图 / Integration diagram nodes                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* 关于我们 / About                                                    */
/* ------------------------------------------------------------------ */

export const aboutValues = [
  {
    title: "先想清楚，再动手",
    desc: "方案评审不过关就不进开发。我们宁愿在图纸阶段多花两天，也不愿在现场多停两天。",
  },
  {
    title: "交付可验证的结果",
    desc: "节拍、良率、精度都是可以测量的。我们按可量化的指标承诺，而不是按感觉交付。",
  },
  {
    title: "让客户能自己维护",
    desc: "程序带注释、图纸有编号、记录可追溯。我们的目标是让客户的工程师能接手，而不是离不开我们。",
  },
];

export const milestones = [
  { year: "2024", title: "公司成立", desc: "2024 年成立于深圳，以电气图纸设计与 PLC 程序调试服务起步。" },
  { year: "2024", title: "进入锂电行业", desc: "承接首个电芯装配线控制项目，切入新能源赛道。" },
  { year: "2025", title: "组建机器人团队", desc: "开始提供机器人集成、视觉引导与力控应用方案。" },
  { year: "2025", title: "热压机专机业务", desc: "完成温度—压力闭环控制方案的标准化。" },
  { year: "2026", title: "通过 ISO 9001 认证", desc: "交付流程实现体系化管理。" },
  { year: "2026", title: "累计交付 30+ 项目", desc: "服务行业覆盖锂电、3C 与汽车零部件。" },
];

export const certifications = [
  "ISO 9001 质量管理体系认证",
  "高新技术企业（申报中）",
  "多项自动化设备实用新型专利",
  "电气作业人员持证上岗",
];

// 团队规模控制在 20 人以内 / headcount stays under 20
export const teamComposition = [
  { value: 6, suffix: "", label: "电气设计工程师" },
  { value: 6, suffix: "", label: "PLC 调试工程师" },
  { value: 4, suffix: "", label: "机器人调试工程师" },
  { value: 2, suffix: "", label: "视觉与算法工程师" },
];
