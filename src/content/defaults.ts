/**
 * 星链自动化 — 默认站点内容 / Default site content
 *
 * 这份文件有两个用途 / This file serves two purposes:
 *  1. 作为数据库不可用时的兜底内容，保证站点永远可以正常打开；
 *     Fallback content so the public site always renders, even with no database.
 *  2. 作为 `pnpm db:seed` 的数据源，让数据库与站点内容保持一致。
 *     Seed source, so seeded databases match the site's default copy.
 *
 * 注意 / Note: 不要在此文件中使用 "@/" 路径别名，prisma/seed.ts 需要以相对路径导入它。
 */

export type Localized = { zh: string; en: string };

export type ServiceContent = {
  slug: string;
  title: Localized;
  summary: Localized;
  content: Localized;
  icon: string;
  features: Localized[];
  deliverables: Localized[];
  faq: { q: Localized; a: Localized }[];
};

export type CaseContent = {
  slug: string;
  title: Localized;
  client: Localized;
  industry: Localized;
  year: number;
  location: string;
  summary: Localized;
  content: Localized;
  scope: Localized[];
  metrics: { value: string; label: Localized }[];
  tags: string[];
  featured: boolean;
};

export type ArticleContent = {
  slug: string;
  title: Localized;
  excerpt: Localized;
  content: Localized;
  category: Localized;
  tags: string[];
  publishedAt: string;
  readMinutes: number;
  featured: boolean;
};

export type DownloadContent = {
  slug: string;
  title: Localized;
  description: Localized;
  fileType: string;
  fileSize: number;
  version: string;
  sortOrder: number;
};

export type GalleryContent = {
  title: Localized;
  caption: Localized;
  album: Localized;
  mediaKind: "IMAGE" | "VIDEO";
};

export type ProcessStep = {
  no: string;
  title: Localized;
  desc: Localized;
};

export type WhyItem = {
  no: string;
  title: Localized;
  desc: Localized;
};

export const company = {
  nameZh: "深圳市星链自动化有限公司",
  nameEn: "Shenzhen Starlink Automation Co., Ltd.",
  shortZh: "星链自动化",
  shortEn: "Starlink Automation",
  founded: 2024,
  addressZh: "深圳市光明区凤凰街道甲子塘社区力缆科技大楼九层E区",
  addressEn: "Zone E, 9th Floor, Lilan Technology Building, Jiazitang Community, Fenghuang Subdistrict, Guangming District, Shenzhen, Guangdong, China",
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
    title: { zh: "PLC 程序调试", en: "PLC Programming & Commissioning" },
    summary: {
      zh: "从控制方案、程序编写到现场联调，让设备按节拍稳定运行。",
      en: "From控制 concept and programming to on-site commissioning — machines that hold their cycle time.",
    },
    content: {
      zh: "我们以工艺节拍为出发点设计控制逻辑，而不是先写程序再谈产能。项目启动阶段即完成 I/O 清单、状态机设计与异常流程定义，程序结构分层清晰（设备层 / 单元层 / 产线层），便于后续扩线与维护。\n\n团队熟悉西门子 S7-1200/1500、三菱 FX/Q/iQ-R、欧姆龙 NJ/NX、汇川 AM/H5U、台达 AS、倍福 TwinCAT 等主流平台，可按照客户既有体系选型，不做品牌绑定。现场调试阶段我们提供完整的调试记录、参数备份与故障处理手册，确保产线在交付后仍可被快速定位与维护。",
      en: "We design control logic starting from the process cycle time, not from the program. I/O lists, state machines and exception flows are defined before a line of code is written, and programs are layered (device / cell / line) so they can be extended and maintained.\n\nThe team is fluent in Siemens S7-1200/1500, Mitsubishi FX/Q/iQ-R, Omron NJ/NX, Inovance AM/H5U, Delta AS and Beckhoff TwinCAT. We adapt to your existing platform instead of locking you in. Every commissioning job ships with debug records, parameter backups and a troubleshooting manual.",
    },
    icon: "Cpu",
    features: [
      { zh: "控制方案与 I/O 清单编制", en: "Control concept and I/O list" },
      { zh: "PLC / HMI 程序开发与结构化编程", en: "PLC & HMI development, structured code" },
      { zh: "伺服、步进与变频运动控制", en: "Servo, stepper and VFD motion control" },
      { zh: "通信组网（Profinet / EtherCAT / Modbus / CC-Link）", en: "Networking: Profinet / EtherCAT / Modbus / CC-Link" },
      { zh: "安全回路与急停逻辑设计", en: "Safety circuits and E-stop logic" },
      { zh: "现场联调、故障排查与陪产爬坡", en: "On-site commissioning, troubleshooting, ramp-up" },
    ],
    deliverables: [
      { zh: "带注释的程序源码与版本备份", en: "Commented source code with versioned backups" },
      { zh: "I/O 清单与信号地址表", en: "I/O list and signal address table" },
      { zh: "设备参数备份与恢复说明", en: "Parameter backup and restore guide" },
      { zh: "操作与维护手册", en: "Operation and maintenance manual" },
      { zh: "调试记录与问题闭环清单", en: "Commissioning log and issue closure list" },
    ],
    faq: [
      {
        q: { zh: "可以在我们现有的程序上做二次开发吗？", en: "Can you extend our existing program?" },
        a: {
          zh: "可以。我们会先做程序结构评审与备份，在保证原有功能不回退的前提下增量开发，并输出变更说明。",
          en: "Yes. We review and back up the existing structure first, then develop incrementally without regressing current behaviour, and document every change.",
        },
      },
      {
        q: { zh: "支持哪些品牌的 PLC？", en: "Which PLC brands do you support?" },
        a: {
          zh: "西门子、三菱、欧姆龙、汇川、台达、倍福、松下、基恩士等主流品牌均有项目经验。",
          en: "Siemens, Mitsubishi, Omron, Inovance, Delta, Beckhoff, Panasonic and Keyence are all covered by project experience.",
        },
      },
    ],
  },
  {
    slug: "robot",
    title: { zh: "机器人调试", en: "Robot Integration & Commissioning" },
    summary: {
      zh: "从选型、仿真到现场标定，把机器人真正接入产线节拍。",
      en: "From selection and simulation to on-site calibration — robots that truly meet the line's takt.",
    },
    content: {
      zh: "机器人不是买回来就能用的设备。我们会在选型阶段完成可达性分析、负载与惯量校核、节拍仿真，避免出现“够不着、跑不快、抓不稳”的典型问题。\n\n实施阶段涵盖末端执行器接口调试、轨迹示教与离线编程、视觉引导定位、与 PLC 的安全互锁与信号交互，以及碰撞检测、负载标定与精度验证。交付时提供机器人程序备份、示教点位表与安全配置说明，并对客户操作人员进行实操培训。",
      en: "A robot is not plug-and-play. We run reachability analysis, payload and inertia verification and cycle-time simulation up front — avoiding the classic \"can't reach, can't keep up, can't hold it\" failures.\n\nImplementation covers end-effector interfacing, path teaching and offline programming, vision-guided positioning, safety interlocks and signal handshakes with the PLC, plus collision detection, payload calibration and accuracy verification. Deliverables include program backups, taught point tables, safety configuration and hands-on operator training.",
    },
    icon: "Bot",
    features: [
      { zh: "机器人选型、可达性与节拍仿真", en: "Robot selection, reach and cycle-time simulation" },
      { zh: "夹具与末端执行器接口调试", en: "Gripper and end-effector interfacing" },
      { zh: "轨迹示教与离线编程", en: "Path teaching and offline programming" },
      { zh: "视觉引导定位（2D / 3D）", en: "Vision-guided positioning (2D / 3D)" },
      { zh: "与 PLC 的安全互锁与信号交互", en: "Safety interlocks and PLC handshakes" },
      { zh: "碰撞检测、负载与精度标定", en: "Collision detection, payload and accuracy calibration" },
    ],
    deliverables: [
      { zh: "机器人程序与系统备份", en: "Robot program and system backup" },
      { zh: "示教点位表与坐标系说明", en: "Taught point table and frame documentation" },
      { zh: "节拍仿真与可达性报告", en: "Cycle-time and reachability report" },
      { zh: "安全配置与风险评估记录", en: "Safety configuration and risk assessment" },
      { zh: "操作人员实操培训", en: "Hands-on operator training" },
    ],
    faq: [
      {
        q: { zh: "我们已经有机器人，只是节拍不达标，能帮忙优化吗？", en: "We already have a robot but the takt is too slow — can you help?" },
        a: {
          zh: "可以。我们通常会从轨迹路径、运动参数、等待逻辑与信号交互四个方向做节拍分解，找出真正的瓶颈点。",
          en: "Yes. We break the cycle down across path planning, motion parameters, wait logic and signal handshakes to find the real bottleneck.",
        },
      },
    ],
  },
  {
    slug: "electrical",
    title: { zh: "电气图纸设计", en: "Electrical Drawing Design" },
    summary: {
      zh: "规范、可施工、可维护的电气设计文件。",
      en: "Electrical documentation that is standardised, buildable and maintainable.",
    },
    content: {
      zh: "电气图纸是设备全生命周期中被翻阅次数最多的文件。我们按照统一的图框、编号与命名规则出图，保证施工方看得懂、维护人员查得到、后续改线接得上。\n\n设计内容覆盖电气原理图、系统框图、元器件选型与 BOM、控制柜布局与散热计算、端子接线表与线号定义、电缆清册等。图纸同步提供 EPLAN / CAD 源文件与 PDF 交付版，并进行内部评审与版本管理。",
      en: "Electrical drawings are the most-referenced documents in a machine's life. We follow unified title blocks, numbering and naming rules so that builders can read them, maintenance can trace them and future changes can be made on top of them.\n\nScope covers schematic diagrams, system block diagrams, component selection and BOM, cabinet layout and thermal calculation, terminal and wire-number tables, and cable schedules. You receive both EPLAN / CAD source files and PDF releases, with internal review and version control.",
    },
    icon: "Ruler",
    features: [
      { zh: "电气原理图与系统框图", en: "Schematics and system block diagrams" },
      { zh: "元器件选型与 BOM 清单", en: "Component selection and BOM" },
      { zh: "控制柜布局与散热计算", en: "Cabinet layout and thermal calculation" },
      { zh: "端子接线表与线号定义", en: "Terminal tables and wire numbering" },
      { zh: "电缆清册与现场布线指导", en: "Cable schedule and wiring guidance" },
      { zh: "图纸评审与版本管理", en: "Drawing review and version control" },
    ],
    deliverables: [
      { zh: "EPLAN / CAD 图纸源文件", en: "EPLAN / CAD source files" },
      { zh: "元器件 BOM 与选型说明", en: "BOM and selection rationale" },
      { zh: "端子接线表与线号表", en: "Terminal and wire-number tables" },
      { zh: "电缆清册", en: "Cable schedule" },
      { zh: "PDF 交付版图纸集", en: "PDF drawing set" },
    ],
    faq: [
      {
        q: { zh: "我们只有旧图纸的 PDF，能转成可编辑文件吗？", en: "We only have PDFs of old drawings — can they be converted?" },
        a: {
          zh: "可以。我们会按现行标准重新绘制并核对现场实际接线，输出可编辑源文件，同时修正原图中的隐患。",
          en: "Yes. We redraw to current standards, verify against the actual wiring on site and deliver editable sources — fixing latent issues along the way.",
        },
      },
    ],
  },
  {
    slug: "battery",
    title: { zh: "锂电池检测", en: "Lithium Battery Inspection" },
    summary: {
      zh: "面向电芯与模组的绝缘、耐压、内阻与外观检测方案。",
      en: "Insulation, hi-pot, internal resistance and appearance inspection for cells and modules.",
    },
    content: {
      zh: "锂电池检测的核心矛盾是“节拍”与“误判率”。检测做得越细，节拍越慢；判据放得越松，漏检越多。我们的做法是把检测项按风险分级，把必须全检的项目做进产线节拍，把抽检项目做成离线工位，并给出可量化的误判率指标。\n\n方案覆盖绝缘耐压（Hi-pot）测试、内阻与开路电压（OCV/IR）分选、气密性与泄漏检测、外观缺陷视觉检测，以及检测数据的采集、追溯与 MES 对接。",
      en: "The core tension in battery inspection is takt versus false-reject rate. Inspect more and the line slows down; loosen the criteria and defects escape. We grade inspection items by risk, build the must-check items into the line takt, move sampling items to offline stations, and commit to measurable false-reject targets.\n\nScope covers hi-pot and insulation testing, OCV/IR sorting, leak and airtightness testing, appearance defect vision inspection, and data acquisition, traceability and MES integration.",
    },
    icon: "BatteryCharging",
    features: [
      { zh: "绝缘耐压（Hi-pot）测试系统集成", en: "Hi-pot and insulation test integration" },
      { zh: "内阻 / 开路电压（OCV / IR）分选", en: "OCV / IR sorting" },
      { zh: "气密性与泄漏检测", en: "Airtightness and leak detection" },
      { zh: "外观缺陷视觉检测", en: "Appearance defect vision inspection" },
      { zh: "数据采集、追溯与 MES 对接", en: "Data acquisition, traceability, MES integration" },
      { zh: "检测节拍优化与误判率控制", en: "Takt optimisation and false-reject control" },
    ],
    deliverables: [
      { zh: "检测方案书与判据定义", en: "Inspection concept and criteria definition" },
      { zh: "测试程序与参数配置", en: "Test programs and parameter configuration" },
      { zh: "数据追溯报表与接口文档", en: "Traceability reports and interface documents" },
      { zh: "误判率验证记录", en: "False-reject validation records" },
      { zh: "验收报告", en: "Acceptance report" },
    ],
    faq: [
      {
        q: { zh: "检测数据可以接入我们现有的 MES 吗？", en: "Can inspection data feed our existing MES?" },
        a: {
          zh: "可以。我们支持数据库直连、OPC UA、REST 接口与文件交换等方式，并提供字段映射与接口文档。",
          en: "Yes — direct database, OPC UA, REST or file exchange, with field mapping and interface documentation.",
        },
      },
    ],
  },
  {
    slug: "hot-press",
    title: { zh: "热压机", en: "Hot Press Machine" },
    summary: {
      zh: "温度、压力与时间的闭环控制，保证极片与电芯的一致性。",
      en: "Closed-loop control of temperature, pressure and time for consistent electrodes and cells.",
    },
    content: {
      zh: "热压工艺的难点在于一致性与稳定性：同一批次的温度曲线、压力曲线必须可复现，且能追溯到每一件产品。\n\n我们在温度多区闭环控制（PID 自整定）、压力伺服/液压闭环与保压控制、热压曲线配方管理、上下料自动化、安全门锁与光栅保护，以及 OEE 与工艺数据采集方面提供完整实现。所有工艺参数以配方形式管理，换型时一键调用，避免人工设定带来的偏差。",
      en: "The hard part of hot pressing is consistency: temperature and pressure curves must be reproducible batch after batch and traceable to each part.\n\nWe deliver multi-zone closed-loop temperature control with PID auto-tuning, servo/hydraulic pressure closed loop and dwell control, recipe management for press curves, automated loading and unloading, safety door locks and light curtains, plus OEE and process data acquisition. All process parameters live in recipes, recalled with one action at changeover to remove manual setting drift.",
    },
    icon: "Flame",
    features: [
      { zh: "温度多区闭环控制（PID 自整定）", en: "Multi-zone temperature closed loop (PID auto-tune)" },
      { zh: "压力伺服 / 液压闭环与保压控制", en: "Servo / hydraulic pressure loop and dwell control" },
      { zh: "热压曲线配方管理与追溯", en: "Press curve recipes and traceability" },
      { zh: "上下料自动化与机器人对接", en: "Automated loading and robot interfacing" },
      { zh: "安全门锁与光栅保护", en: "Safety interlocks and light curtains" },
      { zh: "设备 OEE 与工艺数据采集", en: "OEE and process data acquisition" },
    ],
    deliverables: [
      { zh: "电气设计与控制程序", en: "Electrical design and control programs" },
      { zh: "配方管理系统", en: "Recipe management system" },
      { zh: "工艺曲线报告与验证记录", en: "Process curve reports and validation records" },
      { zh: "安全评估与整改记录", en: "Safety assessment and remediation records" },
      { zh: "维护手册与备件清单", en: "Maintenance manual and spare parts list" },
    ],
    faq: [
      {
        q: { zh: "温控精度可以做到多少？", en: "How tight can the temperature control be?" },
        a: {
          zh: "在合理的热设计与传感器布置前提下，稳态波动通常可控制在 ±1℃，热板面均匀性可达 ±2℃。具体以工艺验证结果为准。",
          en: "With sound thermal design and sensor placement, steady-state deviation is typically within ±1°C and platen uniformity within ±2°C — confirmed by process validation.",
        },
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
    title: { zh: "需求评估", en: "Assessment" },
    desc: { zh: "现场勘察与工艺拆解，输出可行性评估、节拍测算与风险清单。", en: "Site survey and process breakdown — feasibility, takt estimate and risk list." },
  },
  {
    no: "02",
    title: { zh: "方案设计", en: "Concept" },
    desc: { zh: "确定控制架构、设备选型与接口定义，明确验收标准。", en: "Control architecture, equipment selection, interfaces and acceptance criteria." },
  },
  {
    no: "03",
    title: { zh: "电气设计", en: "Electrical design" },
    desc: { zh: "输出电气原理图、柜体布局、端子表与电缆清册全套文件。", en: "Schematics, cabinet layout, terminal tables and cable schedules." },
  },
  {
    no: "04",
    title: { zh: "程序开发", en: "Development" },
    desc: { zh: "PLC、HMI 与机器人程序编写，离线仿真验证后进入现场。", en: "PLC, HMI and robot programming, verified by offline simulation before shipping." },
  },
  {
    no: "05",
    title: { zh: "现场调试", en: "Commissioning" },
    desc: { zh: "就位接线、单机调试到整线联调，陪产爬坡直至达到节拍。", en: "Installation wiring, single-machine to full-line commissioning, ramp-up to takt." },
  },
  {
    no: "06",
    title: { zh: "交付培训", en: "Handover" },
    desc: { zh: "操作与维护培训、备件清单交付与长期技术支持。", en: "Operator and maintenance training, spare parts list and long-term support." },
  },
];

/* ------------------------------------------------------------------ */
/* 为什么选择星链 / Why Starlink                                        */
/* ------------------------------------------------------------------ */

export const whyItems: WhyItem[] = [
  {
    no: "01",
    title: { zh: "标准化电气设计", en: "Standardised electrical design" },
    desc: {
      zh: "统一的图框、编号与命名规则，图纸可直接交付施工与后续维护，不产生“只有原作者看得懂”的图纸。",
      en: "Unified title blocks, numbering and naming — drawings handed over for construction and maintenance, not drawings only the author can read.",
    },
  },
  {
    no: "02",
    title: { zh: "多品牌控制平台", en: "Multi-brand control platforms" },
    desc: {
      zh: "西门子、三菱、欧姆龙、汇川、台达、倍福均可实施，按客户既有体系选型，不做品牌绑定。",
      en: "Siemens, Mitsubishi, Omron, Inovance, Delta and Beckhoff — selected to match your existing ecosystem, with no vendor lock-in.",
    },
  },
  {
    no: "03",
    title: { zh: "机器人集成能力", en: "Robot integration capability" },
    desc: {
      zh: "发那科、ABB、库卡、安川、爱普生、优傲等品牌，配合视觉与力控完成复杂工艺动作。",
      en: "FANUC, ABB, KUKA, Yaskawa, Epson and Universal Robots, combined with vision and force control for complex process motions.",
    },
  },
  {
    no: "04",
    title: { zh: "锂电专机经验", en: "Battery equipment experience" },
    desc: {
      zh: "从电芯装配、热压到检测分选，理解锂电产线对节拍、洁净度与一致性的真实要求。",
      en: "From cell assembly and hot pressing to inspection and sorting — we understand the real takt, cleanliness and consistency demands of battery lines.",
    },
  },
  {
    no: "05",
    title: { zh: "全过程可追溯", en: "Fully traceable process" },
    desc: {
      zh: "从 I/O 表到调试记录全部归档，问题可定位、改动可回溯、责任可界定。",
      en: "From I/O lists to commissioning logs, everything is archived — problems can be located, changes traced and responsibilities defined.",
    },
  },
  {
    no: "06",
    title: { zh: "快速响应机制", en: "Fast response" },
    desc: {
      zh: "7×24 电话响应，珠三角 4 小时到场，异地 24 小时内到场支援。",
      en: "7×24 phone response, 4-hour on-site arrival in the Pearl River Delta, 24 hours elsewhere in China.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* 合作伙伴 / Partners                                                 */
/* ------------------------------------------------------------------ */

export const partners: { name: string; sub: string }[] = [
  { name: "SIEMENS", sub: "西门子" },
  { name: "MITSUBISHI", sub: "三菱电机" },
  { name: "OMRON", sub: "欧姆龙" },
  { name: "INOVANCE", sub: "汇川技术" },
  { name: "DELTA", sub: "台达电子" },
  { name: "BECKHOFF", sub: "倍福自动化" },
  { name: "FANUC", sub: "发那科" },
  { name: "ABB", sub: "ABB 机器人" },
  { name: "KUKA", sub: "库卡" },
  { name: "YASKAWA", sub: "安川电机" },
  { name: "EPSON", sub: "爱普生" },
  { name: "UNIVERSAL ROBOTS", sub: "优傲机器人" },
];

/* ------------------------------------------------------------------ */
/* 项目案例 / Case studies                                             */
/* ------------------------------------------------------------------ */

export const cases: CaseContent[] = [
  {
    slug: "cell-assembly-line-control",
    title: { zh: "方形铝壳电芯装配线控制系统", en: "Prismatic cell assembly line control system" },
    client: { zh: "国内头部动力电池企业", en: "Leading domestic power battery maker" },
    industry: { zh: "新能源锂电", en: "New-energy battery" },
    year: 2025,
    location: "广东 · 惠州",
    summary: {
      zh: "为 12 工位电芯装配线提供整线控制与数据采集，节拍由 6.5s 优化至 5.2s。",
      en: "Full-line control and data acquisition for a 12-station cell assembly line; takt improved from 6.5s to 5.2s.",
    },
    content: {
      zh: "客户原有装配线为分段控制，工位之间依赖人工确认转序，导致节拍波动大、异常难以定位。我们重新梳理了整线状态机，将 12 个工位纳入统一的控制与调度逻辑，并引入基于条码的全流程追溯。\n\n项目采用西门子 S7-1500 作为主控，工位间通过 Profinet 通信；上位机负责配方下发、报警归档与 OEE 统计。交付后整线节拍稳定在 5.2s，异常平均定位时间从 25 分钟缩短到 4 分钟。",
      en: "The existing line used segmented control with manual transfer confirmation between stations, causing unstable takt and slow fault localisation. We rebuilt the line state machine, brought all 12 stations under one control and scheduling logic, and introduced barcode-based end-to-end traceability.\n\nA Siemens S7-1500 acts as the main controller with Profinet between stations; the SCADA layer handles recipe distribution, alarm archiving and OEE reporting. After handover the takt settled at 5.2s and mean fault localisation dropped from 25 minutes to 4.",
    },
    scope: [
      { zh: "整线控制方案与状态机设计", en: "Full-line control concept and state machine" },
      { zh: "PLC 程序开发与现场调试", en: "PLC development and on-site commissioning" },
      { zh: "上位机配方与 OEE 系统", en: "SCADA recipe and OEE system" },
      { zh: "条码追溯与 MES 数据对接", en: "Barcode traceability and MES integration" },
    ],
    metrics: [
      { value: "-20%", label: { zh: "节拍时间", en: "Cycle time" } },
      { value: "99.6%", label: { zh: "设备综合效率", en: "OEE" } },
      { value: "4 min", label: { zh: "异常平均定位", en: "Mean fault localisation" } },
    ],
    tags: ["S7-1500", "Profinet", "MES", "追溯"],
    featured: true,
  },
  {
    slug: "robot-tending-workstation",
    title: { zh: "六轴机器人上下料工作站", en: "Six-axis robot loading & unloading workstation" },
    client: { zh: "精密结构件制造商", en: "Precision structural parts manufacturer" },
    industry: { zh: "3C 电子", en: "3C electronics" },
    year: 2024,
    location: "广东 · 深圳",
    summary: {
      zh: "CNC 加工单元机器人上下料改造，实现 1 人看管 6 台机床。",
      en: "Robot tending retrofit for a CNC cell — one operator now covers six machines.",
    },
    content: {
      zh: "客户原有 6 台 CNC 由 3 名操作工轮班上下料，人员流动直接导致产能波动。我们以一台六轴机器人搭配双工位夹具与视觉定位，完成毛坯上料、成品下料与料框管理。\n\n难点在于毛坯来料位置存在 ±3mm 偏差。我们通过 2D 视觉定位补偿，将抓取成功率提升至 99.8%，并在机器人夹具上集成气密检测，避免空抓与掉件。改造后单班人员由 3 人降至 1 人。",
      en: "Six CNC machines were tended by three operators per shift, so turnover directly moved throughput. We used a six-axis robot with a dual-station gripper and vision positioning for blank loading, finished-part unloading and bin management.\n\nThe challenge was ±3mm positional variation in incoming blanks. 2D vision compensation lifted pick success to 99.8%, and an airtightness check in the gripper prevents empty picks and dropped parts. Headcount per shift fell from three to one.",
    },
    scope: [
      { zh: "机器人选型与节拍仿真", en: "Robot selection and cycle-time simulation" },
      { zh: "夹具与末端执行器设计对接", en: "Gripper and end-effector integration" },
      { zh: "2D 视觉定位与标定", en: "2D vision positioning and calibration" },
      { zh: "与 CNC、PLC 的安全互锁", en: "Safety interlocks with CNC and PLC" },
    ],
    metrics: [
      { value: "3 → 1", label: { zh: "单班操作人数", en: "Operators per shift" } },
      { value: "99.8%", label: { zh: "抓取成功率", en: "Pick success rate" } },
      { value: "18s", label: { zh: "单件节拍", en: "Cycle time per part" } },
    ],
    tags: ["FANUC", "视觉定位", "CNC", "安全互锁"],
    featured: true,
  },
  {
    slug: "hot-press-temperature-pressure-loop",
    title: { zh: "电芯热压机温压闭环控制", en: "Cell hot press temperature & pressure closed loop" },
    client: { zh: "动力电池设备集成商", en: "Power battery equipment integrator" },
    industry: { zh: "新能源锂电", en: "New-energy battery" },
    year: 2025,
    location: "江苏 · 常州",
    summary: {
      zh: "多区温控与压力闭环改造，热板均匀性 ±2℃，压力波动 ±1.5%。",
      en: "Multi-zone temperature and pressure retrofit: platen uniformity ±2°C, pressure deviation ±1.5%.",
    },
    content: {
      zh: "热压工艺的一致性直接影响电芯内阻与循环寿命。原设备采用单点测温控制整块热板，边缘与中心温差达到 8℃，导致批次一致性差。\n\n我们重新划分温区，采用多点测温 + 分区 PID 自整定，并对液压系统引入压力闭环与保压补偿算法。改造后热板面均匀性控制在 ±2℃ 以内，压力波动由 ±6% 收敛至 ±1.5%，工艺曲线可完整记录并追溯到单件产品。",
      en: "Hot press consistency drives cell internal resistance and cycle life. The original machine controlled an entire platen from a single temperature point, leaving an 8°C edge-to-centre spread and poor batch consistency.\n\nWe re-zoned the platens, applied multi-point sensing with per-zone PID auto-tuning, and added pressure closed loop plus dwell compensation to the hydraulic system. Platen uniformity is now within ±2°C, pressure deviation tightened from ±6% to ±1.5%, and process curves are recorded and traceable to individual parts.",
    },
    scope: [
      { zh: "多区温控方案与 PID 自整定", en: "Multi-zone temperature control and PID auto-tune" },
      { zh: "压力闭环与保压补偿算法", en: "Pressure closed loop and dwell compensation" },
      { zh: "配方管理与工艺曲线追溯", en: "Recipe management and curve traceability" },
      { zh: "安全门锁与光栅保护改造", en: "Safety interlocks and light curtain retrofit" },
    ],
    metrics: [
      { value: "±2℃", label: { zh: "热板均匀性", en: "Platen uniformity" } },
      { value: "±1.5%", label: { zh: "压力波动", en: "Pressure deviation" } },
      { value: "100%", label: { zh: "工艺曲线可追溯", en: "Curve traceability" } },
    ],
    tags: ["热压机", "温控", "PID", "配方管理"],
    featured: true,
  },
  {
    slug: "auto-parts-vision-inspection",
    title: { zh: "汽车零部件视觉检测线", en: "Automotive parts vision inspection line" },
    client: { zh: "汽车零部件一级供应商", en: "Tier-1 automotive supplier" },
    industry: { zh: "汽车零部件", en: "Automotive parts" },
    year: 2024,
    location: "广东 · 广州",
    summary: {
      zh: "替代人工目检的自动化外观检测线，漏检率从 1.2% 降至 0.15%。",
      en: "Automated appearance inspection replacing manual visual checks; escape rate down from 1.2% to 0.15%.",
    },
    content: {
      zh: "客户产品表面缺陷种类多、批量大，人工目检不仅漏检率高，还难以形成可追溯的质量数据。\n\n我们设计了 4 工位视觉检测线，覆盖上下表面与两个侧面，采用多角度光源分离划痕、脏污与压伤三类缺陷，并结合 PLC 实现自动分选与数据回传。系统上线后漏检率由 1.2% 降至 0.15%，同时为客户积累了可用于工艺改进的缺陷分布数据。",
      en: "The client's parts had many surface defect classes in high volume. Manual inspection had a high escape rate and produced no traceable quality data.\n\nWe built a four-station vision inspection line covering top, bottom and both sides, using multi-angle illumination to separate scratches, contamination and dents, with PLC-driven sorting and data feedback. Escape rate fell from 1.2% to 0.15% and the client gained defect-distribution data usable for process improvement.",
    },
    scope: [
      { zh: "检测工位布局与光学方案", en: "Station layout and optical design" },
      { zh: "视觉算法与缺陷分类", en: "Vision algorithms and defect classification" },
      { zh: "PLC 分选控制与数据回传", en: "PLC sorting control and data feedback" },
      { zh: "质量数据看板", en: "Quality data dashboard" },
    ],
    metrics: [
      { value: "0.15%", label: { zh: "漏检率", en: "Escape rate" } },
      { value: "4", label: { zh: "检测工位", en: "Inspection stations" } },
      { value: "3.5s", label: { zh: "单件节拍", en: "Cycle per part" } },
    ],
    tags: ["机器视觉", "缺陷检测", "PLC", "质量管理"],
    featured: false,
  },
  {
    slug: "module-pack-mes-integration",
    title: { zh: "模组 PACK 线数据采集与 MES 对接", en: "Module PACK line data acquisition and MES integration" },
    client: { zh: "储能电池制造商", en: "Energy storage battery manufacturer" },
    industry: { zh: "新能源锂电", en: "New-energy battery" },
    year: 2025,
    location: "安徽 · 合肥",
    summary: {
      zh: "为 8 个工位建立统一数据采集层，实现单件级全流程追溯。",
      en: "Unified data acquisition across 8 stations, delivering part-level end-to-end traceability.",
    },
    content: {
      zh: "客户 PACK 线设备品牌混杂，数据分散在各设备本地，无法回答“这一件产品经过了哪些工位、参数是多少”。\n\n我们建立统一的数据采集层，通过 OPC UA、Modbus TCP 与数据库直连三种方式接入 8 个工位的异构设备，统一时间戳与数据模型后写入 MES。现在可以按产品序列号反查全部工艺参数与操作记录，质量异常的责任界定时间大幅缩短。",
      en: "The PACK line mixed equipment brands with data stranded on each machine, so the question \"which stations did this part pass through, and with what parameters?\" had no answer.\n\nWe built a unified acquisition layer connecting eight heterogeneous stations via OPC UA, Modbus TCP and direct database access, normalising timestamps and data models before writing to MES. Any process parameter and operator record can now be traced from a serial number, sharply cutting the time needed to assign quality responsibility.",
    },
    scope: [
      { zh: "异构设备数据采集层建设", en: "Heterogeneous data acquisition layer" },
      { zh: "统一数据模型与时间戳对齐", en: "Unified data model and timestamp alignment" },
      { zh: "MES 接口开发与联调", en: "MES interface development and integration" },
      { zh: "追溯查询与报表", en: "Traceability query and reporting" },
    ],
    metrics: [
      { value: "8", label: { zh: "接入工位", en: "Connected stations" } },
      { value: "3", label: { zh: "支持协议", en: "Protocols supported" } },
      { value: "100%", label: { zh: "单件级追溯", en: "Part-level traceability" } },
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
    title: { zh: "公司完成某头部电池企业热压机产线交付", en: "Hot press line delivered to a leading battery manufacturer" },
    excerpt: {
      zh: "历经 14 周的设计、开发与现场调试，我司承接的热压机产线控制项目顺利通过客户验收，热板均匀性达到 ±2℃。",
      en: "After 14 weeks of design, development and commissioning, our hot press line control project passed customer acceptance with platen uniformity of ±2°C.",
    },
    content: {
      zh: "## 项目概况\n\n本项目为客户新建产线的核心工艺设备，包含 6 台热压机、自动上下料机构与在线检测工位。星链自动化承担整线控制方案、电气图纸设计、PLC 程序开发与现场调试。\n\n## 技术要点\n\n- 热板多区温控，采用分区 PID 自整定，稳态均匀性 ±2℃\n- 液压压力闭环与保压补偿，压力波动控制在 ±1.5% 以内\n- 热压曲线以配方形式管理，换型时间从 40 分钟缩短至 5 分钟\n- 全部工艺数据按单件追溯，可导出用于工艺分析\n\n## 客户反馈\n\n客户工艺负责人表示，产线在连续 72 小时试运行中未出现因控制系统导致的停机，节拍稳定在合同要求的 8.5 秒以内。",
      en: "## Overview\n\nThis project covers the core process equipment of a new line: six hot presses, automatic loading and unloading, and inline inspection stations. Starlink Automation delivered the line control concept, electrical drawings, PLC development and on-site commissioning.\n\n## Highlights\n\n- Multi-zone platen temperature control with per-zone PID auto-tuning, ±2°C steady-state uniformity\n- Hydraulic pressure closed loop with dwell compensation, deviation within ±1.5%\n- Press curves managed as recipes; changeover cut from 40 minutes to 5\n- All process data traceable per part and exportable for analysis\n\n## Customer feedback\n\nDuring a 72-hour trial run the line recorded no control-system downtime and held a stable 8.5-second takt, within the contractual requirement.",
    },
    category: { zh: "公司新闻", en: "Company news" },
    tags: ["热压机", "交付", "锂电"],
    publishedAt: "2026-01-18",
    readMinutes: 4,
    featured: true,
  },
  {
    slug: "iso9001-certified",
    title: { zh: "星链自动化通过 ISO 9001 质量管理体系认证", en: "Starlink Automation achieves ISO 9001 certification" },
    excerpt: {
      zh: "公司质量管理体系通过第三方审核，覆盖自动化系统设计、程序开发与现场调试服务全过程。",
      en: "Our quality management system passed third-party audit, covering automation design, programming and on-site commissioning services.",
    },
    content: {
      zh: "## 认证范围\n\n本次认证覆盖公司主营业务的完整交付链路：自动化系统方案设计、电气图纸设计、PLC 与机器人程序开发、现场调试与技术服务。\n\n## 为什么重要\n\n对客户而言，体系认证意味着交付过程是可预期、可追溯的。我们把方案评审、图纸校核、程序版本管理、调试记录归档等环节固化为流程文件，减少了对个人经验的依赖。\n\n## 后续计划\n\n公司将在 2026 年内推进 ISO 14001 环境管理体系与 ISO 45001 职业健康安全管理体系的建设。",
      en: "## Scope\n\nThe certification covers our full delivery chain: automation concept design, electrical drawing design, PLC and robot programming, on-site commissioning and technical service.\n\n## Why it matters\n\nFor customers, certification means a predictable, traceable delivery process. Concept reviews, drawing checks, program version control and commissioning log archiving are now documented processes rather than personal habits.\n\n## What's next\n\nDuring 2026 we will work towards ISO 14001 and ISO 45001 certification.",
    },
    category: { zh: "公司新闻", en: "Company news" },
    tags: ["质量体系", "认证"],
    publishedAt: "2026-01-06",
    readMinutes: 3,
    featured: false,
  },
  {
    slug: "battery-inspection-methods",
    title: { zh: "锂电池检测的几种常见方法与选型建议", en: "Common lithium battery inspection methods and how to choose" },
    excerpt: {
      zh: "绝缘耐压、内阻分选、气密检测与视觉外观检测各解决什么问题？如何根据产线节拍与风险等级做取舍？",
      en: "What do hi-pot, IR sorting, leak testing and vision inspection each solve — and how do you trade them off against takt and risk?",
    },
    content: {
      zh: "## 一、绝缘耐压（Hi-pot）\n\n用于验证电芯或模组在高压下的绝缘性能，是安全相关的必检项。选型时重点关注测试电压、爬电时间与放电回路设计，测试工位必须与上下料机构做安全互锁。\n\n## 二、内阻与开路电压（OCV / IR）\n\n主要用于分选，衡量电芯一致性。核心指标是测量重复性而非绝对精度——分选档位边界附近的重复性直接决定误判率。\n\n## 三、气密性与泄漏检测\n\n适用于有密封要求的电芯与模组。需注意温度补偿，否则环境温度波动会被误判为泄漏。\n\n## 四、视觉外观检测\n\n覆盖划痕、脏污、变形、极柱缺陷等。难点不在算法，而在光源方案与缺陷样本的积累。建议在项目早期就建立缺陷样本库。\n\n## 选型建议\n\n把检测项按风险分为三级：安全相关必检且必须进产线节拍；影响性能的按批次抽检；仅影响外观的按客户标准取舍。宁可减少检测项，也不要让检测工位成为整线瓶颈。",
      en: "## 1. Hi-pot / insulation\n\nVerifies insulation performance under high voltage and is a safety-critical must-check. Selection hinges on test voltage, ramp time and discharge circuit design; the station must be safely interlocked with loading equipment.\n\n## 2. Internal resistance and OCV / IR\n\nPrimarily used for sorting and consistency assessment. Repeatability matters more than absolute accuracy — repeatability near grade boundaries directly determines the false-reject rate.\n\n## 3. Leak and airtightness testing\n\nFor cells and modules with sealing requirements. Temperature compensation is essential, otherwise ambient swings read as leaks.\n\n## 4. Vision appearance inspection\n\nCovers scratches, contamination, deformation and terminal defects. The hard part is not the algorithm but the illumination design and the accumulation of defect samples. Build the sample library early.\n\n## How to choose\n\nGrade inspection items by risk: safety-critical items must be checked and must fit the takt; performance-affecting items can be batch-sampled; cosmetic items follow customer standards. It is better to drop an item than to let an inspection station become the line bottleneck.",
    },
    category: { zh: "技术分享", en: "Technical notes" },
    tags: ["锂电池检测", "Hi-pot", "OCV", "机器视觉"],
    publishedAt: "2025-12-20",
    readMinutes: 7,
    featured: true,
  },
  {
    slug: "plc-communication-troubleshooting",
    title: { zh: "PLC 程序调试中常见的十类通信故障与排查思路", en: "Ten common PLC communication faults and how to trace them" },
    excerpt: {
      zh: "从物理层到应用层，一份可直接用于现场排查的通信故障定位清单。",
      en: "A field-usable checklist for locating communication faults, from the physical layer up to the application layer.",
    },
    content: {
      zh: "## 排查顺序很重要\n\n现场排查最常见的错误是从程序改起。正确顺序是：物理层 → 链路层 → 网络层 → 应用层。\n\n## 物理层（占比约 40%）\n\n1. 网线水晶头压接不良或线序错误\n2. 屏蔽层单端接地未做，或两端都接地形成环流\n3. 通信线与动力线同槽敷设，变频器干扰\n4. 终端电阻未接或重复接入\n\n## 链路与网络层\n\n5. IP 地址冲突或子网掩码不一致\n6. 设备名（Profinet Device Name）未分配或与组态不符\n7. 交换机为非管理型且带宽被大流量占用\n\n## 应用层\n\n8. 数据长度与数据类型不匹配，出现字节错位\n9. 握手信号未做超时处理，单侧等待导致死锁\n10. 从站响应周期大于主站轮询周期，造成偶发丢包\n\n## 一条经验\n\n如果故障是“偶发”的，先怀疑干扰与接地；如果故障是“必现”的，先怀疑配置与地址。",
      en: "## Order matters\n\nThe most common field mistake is editing the program first. The correct order is physical → link → network → application.\n\n## Physical layer (~40% of cases)\n\n1. Poorly crimped RJ45 or wrong wire order\n2. Shield earthed at both ends, creating a ground loop — or not earthed at all\n3. Communication cable run in the same duct as power wiring, picking up VFD noise\n4. Missing or duplicated terminating resistors\n\n## Link and network layers\n\n5. IP conflict or mismatched subnet mask\n6. Profinet device name unassigned or different from configuration\n7. Unmanaged switch with bandwidth saturated by heavy traffic\n\n## Application layer\n\n8. Data length and type mismatch causing byte misalignment\n9. Handshake without timeout handling — one side waits forever and deadlocks\n10. Slave response period longer than the master's polling period, causing sporadic drops\n\n## One rule of thumb\n\nIf a fault is intermittent, suspect noise and grounding first. If it is reproducible, suspect configuration and addressing first.",
    },
    category: { zh: "技术分享", en: "Technical notes" },
    tags: ["PLC", "通信", "故障排查", "Profinet"],
    publishedAt: "2025-12-02",
    readMinutes: 8,
    featured: false,
  },
  {
    slug: "robot-team-expansion",
    title: { zh: "我司新增机器人调试工程师团队，服务能力再升级", en: "New robot commissioning team expands our capacity" },
    excerpt: {
      zh: "新组建的机器人调试组由 6 名工程师组成，覆盖发那科、ABB、库卡与优傲平台。",
      en: "A newly formed robot commissioning group of six engineers covers FANUC, ABB, KUKA and Universal Robots platforms.",
    },
    content: {
      zh: "为进一步提升机器人集成项目的交付能力，公司于本月完成机器人调试组的组建，成员共 6 名，均具备 5 年以上现场经验。\n\n团队组建后，公司可同时并行开展 4 个机器人集成项目的现场调试，平均到场响应时间由 48 小时缩短至 24 小时以内。\n\n同时，公司已完成机器人离线编程与仿真工作站的搭建，可在项目进场前完成轨迹验证与节拍确认，减少现场占用时间。",
      en: "To strengthen delivery capacity on robot integration projects, the company formed a dedicated robot commissioning group this month: six engineers, each with more than five years of field experience.\n\nWith the group in place we can run on-site commissioning on four robot projects in parallel, and average on-site response has fallen from 48 hours to under 24.\n\nWe have also completed an offline programming and simulation workstation, allowing path verification and cycle-time confirmation before mobilising to site — reducing on-site time.",
    },
    category: { zh: "公司新闻", en: "Company news" },
    tags: ["团队", "机器人"],
    publishedAt: "2025-11-15",
    readMinutes: 2,
    featured: false,
  },
  {
    slug: "electrical-drawing-standard-v2",
    title: { zh: "电气图纸设计规范 v2.0 正式发布", en: "Electrical drawing standard v2.0 released" },
    excerpt: {
      zh: "新规范统一了图框、编号规则与元件命名，并新增图纸评审检查表。",
      en: "The new standard unifies title blocks, numbering and component naming, and adds a drawing review checklist.",
    },
    content: {
      zh: "公司于本月发布《电气图纸设计规范 v2.0》，在 v1.0 基础上做了三项调整：\n\n1. 统一图框与标题栏字段，明确必须填写的信息项\n2. 细化元件命名规则，要求位号与 BOM 一一对应\n3. 新增图纸评审检查表，共 28 项检查内容，出图前逐项确认\n\n规范同时适用于 EPLAN 与 CAD 两种出图方式，相关模板已同步至公司共享盘。",
      en: "We released version 2.0 of our Electrical Drawing Design Standard this month, with three changes over v1.0:\n\n1. Unified title block and fields, with mandatory information specified\n2. Refined component naming rules requiring one-to-one mapping between tags and BOM\n3. Added a drawing review checklist of 28 items to be confirmed before release\n\nThe standard applies to both EPLAN and CAD workflows, and templates have been published to the company share.",
    },
    category: { zh: "公司新闻", en: "Company news" },
    tags: ["电气设计", "规范", "EPLAN"],
    publishedAt: "2025-10-28",
    readMinutes: 3,
    featured: false,
  },
];

/* ------------------------------------------------------------------ */
/* 资料下载 / Downloads                                                */
/* ------------------------------------------------------------------ */

export const downloads: DownloadContent[] = [
  {
    slug: "company-brochure-2026",
    title: { zh: "星链自动化公司宣传册 2026", en: "Starlink Automation brochure 2026" },
    description: {
      zh: "公司简介、五项核心业务、典型项目案例与联系方式，适合首次了解我们的客户。",
      en: "Company profile, five core capabilities, representative projects and contact details.",
    },
    fileType: "PDF",
    fileSize: 8_400_000,
    version: "2026.1",
    sortOrder: 1,
  },
  {
    slug: "battery-inspection-whitepaper",
    title: { zh: "锂电池检测解决方案白皮书", en: "Lithium battery inspection white paper" },
    description: {
      zh: "系统梳理绝缘耐压、内阻分选、气密检测与视觉检测的选型逻辑与节拍权衡方法。",
      en: "Selection logic and takt trade-offs across hi-pot, IR sorting, leak testing and vision inspection.",
    },
    fileType: "PDF",
    fileSize: 5_100_000,
    version: "v1.3",
    sortOrder: 2,
  },
  {
    slug: "hot-press-datasheet",
    title: { zh: "热压机技术参数表", en: "Hot press machine datasheet" },
    description: {
      zh: "温区配置、压力范围、控制精度与可选配置清单，方便前期选型对比。",
      en: "Temperature zones, pressure range, control accuracy and available options for early comparison.",
    },
    fileType: "PDF",
    fileSize: 2_300_000,
    version: "v2.0",
    sortOrder: 3,
  },
  {
    slug: "electrical-delivery-checklist",
    title: { zh: "电气图纸设计交付清单", en: "Electrical drawing delivery checklist" },
    description: {
      zh: "一套完整电气设计文件应包含的全部内容，可直接用作验收对照表。",
      en: "Everything a complete electrical design package should contain — usable directly as an acceptance checklist.",
    },
    fileType: "PDF",
    fileSize: 620_000,
    version: "v2.0",
    sortOrder: 4,
  },
  {
    slug: "plc-service-capability",
    title: { zh: "PLC 调试服务能力说明", en: "PLC commissioning capability statement" },
    description: {
      zh: "支持的控制平台、服务范围、交付物与响应时效说明。",
      en: "Supported platforms, service scope, deliverables and response times.",
    },
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
  { title: { zh: "电芯装配线整线调试", en: "Cell assembly line commissioning" }, caption: { zh: "12 工位整线联调现场", en: "12-station full-line commissioning" }, album: { zh: "产线现场", en: "Production lines" }, mediaKind: "IMAGE" },
  { title: { zh: "热压机温控柜", en: "Hot press temperature cabinet" }, caption: { zh: "多区温控与压力闭环控制柜", en: "Multi-zone temperature and pressure cabinet" }, album: { zh: "设备实拍", en: "Equipment" }, mediaKind: "IMAGE" },
  { title: { zh: "机器人上下料工作站", en: "Robot tending workstation" }, caption: { zh: "六轴机器人与双工位夹具", en: "Six-axis robot with dual-station gripper" }, album: { zh: "产线现场", en: "Production lines" }, mediaKind: "IMAGE" },
  { title: { zh: "控制柜内部接线", en: "Control cabinet wiring" }, caption: { zh: "按端子表施工的规范接线", en: "Wiring executed to the terminal schedule" }, album: { zh: "设备实拍", en: "Equipment" }, mediaKind: "IMAGE" },
  { title: { zh: "视觉检测工位", en: "Vision inspection station" }, caption: { zh: "多角度光源与相机布局", en: "Multi-angle illumination and camera layout" }, album: { zh: "产线现场", en: "Production lines" }, mediaKind: "IMAGE" },
  { title: { zh: "现场调试作业", en: "On-site commissioning" }, caption: { zh: "工程师进行单机调试", en: "Engineers performing single-machine debugging" }, album: { zh: "团队风采", en: "Our team" }, mediaKind: "IMAGE" },
  { title: { zh: "技术方案评审", en: "Technical concept review" }, caption: { zh: "项目启动阶段的方案评审会", en: "Concept review at project kick-off" }, album: { zh: "团队风采", en: "Our team" }, mediaKind: "IMAGE" },
  { title: { zh: "电气图纸设计", en: "Electrical drawing design" }, caption: { zh: "EPLAN 出图与图纸校核", en: "EPLAN drawing and cross-checking" }, album: { zh: "设备实拍", en: "Equipment" }, mediaKind: "IMAGE" },
  { title: { zh: "产线节拍验证", en: "Cycle-time validation" }, caption: { zh: "连续运行测试与节拍记录", en: "Continuous run test and takt logging" }, album: { zh: "产线现场", en: "Production lines" }, mediaKind: "IMAGE" },
];

/* ------------------------------------------------------------------ */
/* 集成能力环形图 / Integration diagram nodes                          */
/* ------------------------------------------------------------------ */

export const integrationNodes = [
  "PLC 控制",
  "工业机器人",
  "机器视觉",
  "伺服驱动",
  "传感检测",
  "安全系统",
  "上位机 / MES",
  "数据采集",
];

/* ------------------------------------------------------------------ */
/* 关于我们 / About                                                    */
/* ------------------------------------------------------------------ */

export const aboutValues = [
  {
    title: { zh: "先想清楚，再动手", en: "Think first, then build" },
    desc: {
      zh: "方案评审不过关就不进开发。我们宁愿在图纸阶段多花两天，也不愿在现场多停两天。",
      en: "No development until the concept passes review. We would rather spend two extra days on drawings than two extra days of downtime on site.",
    },
  },
  {
    title: { zh: "交付可验证的结果", en: "Deliver verifiable results" },
    desc: {
      zh: "节拍、良率、精度都是可以测量的。我们按可量化的指标承诺，而不是按感觉交付。",
      en: "Takt, yield and accuracy are measurable. We commit to numbers, not to impressions.",
    },
  },
  {
    title: { zh: "让客户能自己维护", en: "Leave you able to maintain it" },
    desc: {
      zh: "程序带注释、图纸有编号、记录可追溯。我们的目标是让客户的工程师能接手，而不是离不开我们。",
      en: "Commented code, numbered drawings, traceable records. Our goal is that your engineers can take over — not that you depend on us.",
    },
  },
];

export const milestones = [
  { year: "2024", title: { zh: "公司成立", en: "Founded" }, desc: { zh: "2024 年成立于深圳，以电气图纸设计与 PLC 程序调试服务起步。", en: "Founded in Shenzhen in 2024, starting with electrical drawing design and PLC commissioning." } },
  { year: "2024", title: { zh: "进入锂电行业", en: "Entered the battery industry" }, desc: { zh: "承接首个电芯装配线控制项目，切入新能源赛道。", en: "First cell assembly line control project — our entry into the new-energy sector." } },
  { year: "2025", title: { zh: "组建机器人团队", en: "Robot team formed" }, desc: { zh: "开始提供机器人集成、视觉引导与力控应用方案。", en: "Began offering robot integration, vision guidance and force control." } },
  { year: "2025", title: { zh: "热压机专机业务", en: "Hot press business" }, desc: { zh: "完成温度—压力闭环控制方案的标准化。", en: "Standardised the temperature and pressure closed-loop solution." } },
  { year: "2026", title: { zh: "通过 ISO 9001 认证", en: "ISO 9001 certified" }, desc: { zh: "交付流程实现体系化管理。", en: "Delivery processes brought under a formal QMS." } },
  { year: "2026", title: { zh: "累计交付 30+ 项目", en: "30+ projects delivered" }, desc: { zh: "服务行业覆盖锂电、3C 与汽车零部件。", en: "Serving the battery, 3C and automotive parts industries." } },
];

export const certifications = [
  { zh: "ISO 9001 质量管理体系认证", en: "ISO 9001 Quality Management System" },
  { zh: "高新技术企业（申报中）", en: "High-tech Enterprise (in application)" },
  { zh: "多项自动化设备实用新型专利", en: "Multiple utility model patents in automation equipment" },
  { zh: "电气作业人员持证上岗", en: "Certified electrical works personnel" },
];

// 团队规模控制在 20 人以内 / headcount stays under 20
export const teamComposition = [
  { value: 6, suffix: "", label: { zh: "电气设计工程师", en: "Electrical design engineers" } },
  { value: 6, suffix: "", label: { zh: "PLC 调试工程师", en: "PLC commissioning engineers" } },
  { value: 4, suffix: "", label: { zh: "机器人调试工程师", en: "Robot commissioning engineers" } },
  { value: 2, suffix: "", label: { zh: "视觉与算法工程师", en: "Vision and algorithm engineers" } },
];
