/**
 * District Command portal fixtures — the `/department` segment.
 *
 * Mirrors the Stitch "CivicBridge Command Dashboard", "AI Problem Clusters",
 * "Problem Detail & Evidence", "Project Tracking" and "Analytics" screens,
 * one export group per screen. See ./data.ts for why these are fixtures.
 */

import type { IconName } from "@/components/icon";
import type { Severity } from "./data";

export const NAV = [
  { href: "/department", label: "Command Centre", icon: "dashboard" },
  { href: "/department/problems", label: "Problem Reports", icon: "warning" },
  { href: "/department/clusters", label: "AI Clusters", icon: "bot" },
  {
    href: "/department/projects",
    label: "Projects & Tracking",
    icon: "clipboard",
  },
  {
    href: "/department/analytics",
    label: "Analytics & Reports",
    icon: "bar-chart",
  },
] satisfies { href: string; label: string; icon: IconName }[];

/* ------------------------------------------------- screen 1: dashboard --- */

export const OFFICER = {
  name: "Jharkhand PHED",
  designation: "Executive Engineer · District Command",
  division: "Ranchi Administrative Division",
  jurisdiction: "Ranchi HQ (0651)",
} as const;

export interface Kpi {
  label: string;
  value: string;
  unit?: string;
  icon: IconName;
  tone: "navy" | "impact" | "community" | "danger";
  delta?: string;
  footLabel: string;
  footValue: string;
}

export const KPIS: Kpi[] = [
  {
    label: "Total Demands",
    value: "12,486",
    icon: "clipboard",
    tone: "navy",
    delta: "+12.4% this month",
    footLabel: "Last 24h intake",
    footValue: "412",
  },
  {
    label: "AI Validated",
    value: "8,942",
    icon: "check-circle",
    tone: "impact",
    delta: "71.5% validation score",
    footLabel: "Spam & duplicates filtered",
    footValue: "3,544",
  },
  {
    label: "Critical / High",
    value: "326",
    icon: "alert-circle",
    tone: "danger",
    delta: "Immediate action",
    footLabel: "SLA breaching (<4h)",
    footValue: "18",
  },
  {
    label: "Active AI Clusters",
    value: "184",
    icon: "bot",
    tone: "navy",
    delta: "28.4 avg reports/cluster",
    footLabel: "Merged incidents",
    footValue: "5,210",
  },
  {
    label: "University R&D Labs",
    value: "72",
    icon: "graduation",
    tone: "community",
    delta: "24 campuses deployed",
    footLabel: "Active student leads",
    footValue: "310",
  },
  {
    label: "Industry CSR",
    value: "38",
    unit: "partners",
    icon: "factory",
    tone: "impact",
    delta: "₹4.8 Cr mobilised",
    footLabel: "Telemetry hardware",
    footValue: "148 nodes",
  },
];

/* -------------------------------------- screens 1 & 2: problems, clusters -- */

export interface Problem {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  block: string;
  village: string;
  reports: number;
  confidence: number;
  cluster: string;
  status: string;
  raised: string;
}

export const PROBLEMS: Problem[] = [
  {
    id: "P-1024",
    title: "Sikidiri canal distributary breach flooding farmland",
    category: "Agriculture & Irrigation",
    severity: "critical",
    block: "Angara",
    village: "Getalsud",
    reports: 47,
    confidence: 94,
    cluster: "CL-204",
    status: "Under Review",
    raised: "12 Sep 2025",
  },
  {
    id: "P-1018",
    title: "Iron and fluoride contamination in ward borewells",
    category: "Water & Sanitation",
    severity: "high",
    block: "Namkum",
    village: "Hesalong",
    reports: 31,
    confidence: 91,
    cluster: "CL-198",
    status: "Awaiting sanction",
    raised: "12 Sep 2025",
  },
  {
    id: "P-1011",
    title: "Solar lift irrigation pumps dead across four tolas",
    category: "Power & Energy",
    severity: "high",
    block: "Ormanjhi",
    village: "Chutupalu",
    reports: 28,
    confidence: 89,
    cluster: "CL-187",
    status: "Cohort allotted",
    raised: "11 Sep 2025",
  },
  {
    id: "P-994",
    title: "Industrial effluent discharge into Subarnarekha feeder",
    category: "Public Health & Safety",
    severity: "medium",
    block: "Namkum",
    village: "Tupudana",
    reports: 19,
    confidence: 93,
    cluster: "CL-176",
    status: "Field testing",
    raised: "09 Sep 2025",
  },
  {
    id: "P-982",
    title: "Culvert subsidence threatening NH-33 approach road",
    category: "Roads & Infrastructure",
    severity: "critical",
    block: "Silli",
    village: "Muri",
    reports: 52,
    confidence: 98,
    cluster: "CL-162",
    status: "Sanctioned",
    raised: "08 Sep 2025",
  },
  {
    id: "P-970",
    title: "Anganwadi water tank overflow and standing water",
    category: "Water & Sanitation",
    severity: "routine",
    block: "Kanke",
    village: "Pithoria",
    reports: 12,
    confidence: 86,
    cluster: "CL-151",
    status: "Panchayat verified",
    raised: "07 Sep 2025",
  },
];

export interface Cluster {
  id: string;
  severity: Severity;
  title: string;
  body: string;
  block: string;
  match: number;
  reports: number;
  footprint: string;
  population: string;
  assetRisk: string;
  partner: string;
  sponsor: string;
}

export const CLUSTERS: Cluster[] = [
  {
    id: "CL-204",
    severity: "critical",
    title: "Canal embankment leakage & agrarian waterlogging",
    body: "Structural erosion along the Sikidiri left-bank distributary inundating paddy parcels across three adjoining hamlets (Getalsud, Chutupalu belt).",
    block: "Angara",
    match: 94,
    reports: 47,
    footprint: "3 villages / 850 ha",
    population: "~2,800 citizens",
    assetRisk: "₹2.4 Cr silt damage",
    partner: "BIT Mesra — Water Resources Engg",
    sponsor: "Tata Steel Foundation CSR",
  },
  {
    id: "CL-198",
    severity: "high",
    title: "Potable water contamination & sulphide odour",
    body: "Cross-leakage between the secondary sewage trunk line and the drinking water main. Elevated turbidity and pathogen risk logged across housing clusters.",
    block: "Namkum",
    match: 91,
    reports: 31,
    footprint: "6 tolas / ~4,200 pop",
    population: "BOD > 48 mg/L (alert)",
    assetRisk: "First detected yesterday",
    partner: "Ranchi University — Environmental Lab",
    sponsor: "Usha Martin Cleantech Grant",
  },
  {
    id: "CL-187",
    severity: "high",
    title: "Solar pump controller failure cascade",
    body: "Identical inverter fault signature across 28 lift irrigation installations commissioned in the same 2023 tender batch.",
    block: "Ormanjhi",
    match: 89,
    reports: 28,
    footprint: "4 tolas / 210 ha",
    population: "~1,100 citizens",
    assetRisk: "₹64 L asset idle",
    partner: "NIT Jamshedpur — Power Electronics",
    sponsor: "Jindal Renewables CSR",
  },
  {
    id: "CL-162",
    severity: "critical",
    title: "Culvert scour & road subsidence",
    body: "Freight-load-driven scour void under the NH-33 approach culvert, flagged by 52 citizen reports and one revenue circle inspection.",
    block: "Silli",
    match: 98,
    reports: 52,
    footprint: "1 corridor / 2.4 km",
    population: "~9,000 daily users",
    assetRisk: "₹1.8 Cr rebuild",
    partner: "BIT Mesra — Structural Engg",
    sponsor: "HEC Ranchi Heavy Equipment",
  },
];

/** Blocks ranked by cluster load, for the geo-intelligence side rail. */
export const HOTSPOT_BLOCKS = [
  { name: "Angara", clusters: 64, share: 100 },
  { name: "Namkum", clusters: 46, share: 72 },
  { name: "Ormanjhi", clusters: 38, share: 59 },
  { name: "Silli", clusters: 21, share: 33 },
  { name: "Kanke", clusters: 15, share: 23 },
];

/** Map pins for the hand-drawn geospatial panel. Percentages of the viewport. */
export const MAP_PINS: {
  id: string;
  kind: "problem" | "university" | "industry";
  label: string;
  sub: string;
  x: number;
  y: number;
}[] = [
  {
    id: "CL-204",
    kind: "problem",
    label: "CL-204 · Canal breach",
    sub: "47 reports merged · P0",
    x: 62,
    y: 68,
  },
  {
    id: "CL-198",
    kind: "problem",
    label: "CL-198 · Water contamination",
    sub: "31 reports · 6 tolas",
    x: 44,
    y: 52,
  },
  {
    id: "CL-162",
    kind: "problem",
    label: "CL-162 · Road subsidence",
    sub: "52 reports · NH-33",
    x: 30,
    y: 27,
  },
  {
    id: "u-bit",
    kind: "university",
    label: "BIT Mesra",
    sub: "Water & Structural labs",
    x: 22,
    y: 46,
  },
  {
    id: "u-ru",
    kind: "university",
    label: "Ranchi University",
    sub: "Environmental testing",
    x: 48,
    y: 33,
  },
  {
    id: "i-tata",
    kind: "industry",
    label: "Tata Steel Foundation",
    sub: "Watershed CSR",
    x: 72,
    y: 40,
  },
  {
    id: "i-usha",
    kind: "industry",
    label: "Usha Martin",
    sub: "Filtration hardware",
    x: 58,
    y: 82,
  },
];

/* --------------------------------------------- screen 3: problem detail --- */

export const PROBLEM_DETAIL = {
  id: "P-1024",
  title: "Sikidiri canal distributary breach flooding farmland",
  category: "Agriculture & Irrigation",
  severity: "critical" as Severity,
  score: 92,
  status: "Under Review",
  slaRemaining: "05h 22m",
  clustered: 47,
  confidence: 97.2,
  evidence: [
    {
      cam: "Field 01",
      caption: "Distributary wall fracture",
      coords: "23.4102° N, 85.6421° E",
      place: "Getalsud Sec 4 · Sat 08:42",
    },
    {
      cam: "Field 02",
      caption: "Inundated paddy basin",
      coords: "23.4098° N, 85.6440° E",
      place: "Plot #419/B · Sat 08:49",
    },
    {
      cam: "Field 03",
      caption: "Head regulator silt jam",
      coords: "23.4114° N, 85.6408° E",
      place: "Head regulator · Sat 09:05",
    },
  ],
  voice: {
    speaker: "Mukhiya Vitthal Oraon",
    duration: "01:24",
    urgency: 94,
    original:
      "वितरण नहर का गेट नंबर 4 गाद भर जाने से टूट गया है। पानी खेतों में घुस रहा है। अगर तुरंत गेट बंद करके पानी नहीं रोका गया तो पूरी रोपनी बह जाएगी।",
    translated:
      "Distributary canal gate #4 has fractured under heavy silt overload; the flood surge is invading the southern sowing fields. Immediate upstream gate shutoff and a siphon diversion pipeline are required.",
  },
  synthesis: {
    classification: "Major irrigation breach · critical infrastructure",
    loss: "₹14.8 L",
    lossNote: "Projected farmland loss within 72 hrs",
    aggregation: "47 clustered",
    aggregationNote: "12 spam reports auto-filtered",
    flow: "4.2 m³/s",
    flowNote: "+180% above design limit",
    directive:
      "Deploy drone-assisted LiDAR structural assessment and initiate a siphon bypass diverted into Getalsud Minor Canal 2 to de-pressurise breach gate #4 within 4 hours.",
  },
  academic: {
    name: "BIT Mesra",
    dept: "Dept. of Civil & Water Resources Engineering",
    distance: "38 km away",
    match: 96,
    teams: 8,
    team: "JalRakshak",
    lead: "Dr. S. Kulkarni (Head, Soil & Water Engg)",
    ready: "Ready to mobilise",
  },
  industry: {
    name: "Usha Martin Ltd.",
    location: "Tatisilwai Industrial Area",
    speciality: "Hydro-telemetry & fast gate automation",
    distance: "18 km (depot)",
    match: 92,
    grant: "₹2,50,000 hardware kit",
    grantStatus: "Approved",
    body: "Provides four solar-powered automated sluice actuators and an on-site field engineer with immediate hydraulic siphon tubes.",
  },
} as const;

/* ------------------------------------------- screen 4: project tracking --- */

export interface Project {
  id: string;
  title: string;
  body: string;
  stage: number;
  percent: number;
  cohort: string;
  sponsor: string;
  stageLabel: string;
}

export const PROJECT_SPOTLIGHT = {
  id: "PRJ-204",
  problemId: "P-1024",
  title: "Smart sluice sensor & concrete geopolymer lining",
  stageLabel: "Field testing & gate fabrication",
  department: "Water Resources Directorate · Angara Block",
  percent: 68,
  cohort: {
    name: "BIT Mesra",
    dept: "Dept. of Civil & Water Resources Engineering",
    team: "JalRakshak · 5 final-year engineers",
  },
  sponsor: {
    name: "Usha Martin Ltd.",
    dept: "Hydraulic Automation Division · Tatisilwai",
    grant: "₹2,50,000 grant",
    scope: "IoT telemetry hardware + lab",
  },
  sanction: {
    office: "Ranchi District Collectorate",
    cell: "District Innovation Cell (Civil & Water Supply)",
    by: "Sanctioned: Executive Engineer, PHED",
  },
  stages: [
    {
      n: "01",
      name: "Citizen demand",
      note: "47 reports clustered",
      date: "12 Sep 2025",
      state: "done",
    },
    {
      n: "02",
      name: "AI deduplication",
      note: "94% geo-cluster match",
      date: "14 Sep 2025",
      state: "done",
    },
    {
      n: "03",
      name: "Panchayat verification",
      note: "Mukhiya sign-off",
      date: "18 Sep 2025",
      state: "done",
    },
    {
      n: "04",
      name: "District sanction",
      note: "EE approved",
      date: "21 Sep 2025",
      state: "done",
    },
    {
      n: "05",
      name: "Cohort allotted",
      note: "BIT JalRakshak",
      date: "28 Sep 2025",
      state: "done",
    },
    {
      n: "06",
      name: "Prototype fabrication",
      note: "85% assembly complete",
      date: "Live telemetry",
      state: "active",
    },
    {
      n: "07",
      name: "Field sluice install",
      note: "Canal sluice #P-1024",
      date: "Est. 18 Nov 2025",
      state: "todo",
    },
    {
      n: "08",
      name: "Citizen sign-off",
      note: "Citizen audit + OTP",
      date: "Est. 28 Nov 2025",
      state: "todo",
    },
  ] as {
    n: string;
    name: string;
    note: string;
    date: string;
    state: "done" | "active" | "todo";
  }[],
  telemetry: {
    sensor: "Flow sensor #AQ-99",
    stabilised: "420 L/s",
    tolerance: "±3.5%",
    /** Twelve hourly flow-velocity samples, drawn as an area chart. */
    series: [38, 41, 45, 44, 40, 43, 52, 61, 58, 49, 46, 54],
    readouts: [
      { label: "Gate differential", value: "0.14 Bar" },
      { label: "Seepage loss avoided", value: "31,200 L/day" },
      { label: "Battery back-up (solar)", value: "98.4% (48V)" },
    ],
    node: "Telemetry pinging via LoRaWAN node #DN-42",
  },
  files: [
    { name: "Structural_Sluice_Assembly_v3.dwg", icon: "code" as IconName },
    {
      name: "Mid_Term_Field_Inspection_Report_EE_Sign.pdf",
      icon: "file-pen" as IconName,
    },
  ],
} as const;

export const PROJECT_KPIS: Kpi[] = [
  {
    label: "Triad implementations",
    value: "72",
    icon: "clipboard",
    tone: "navy",
    delta: "+8 this quarter",
    footLabel: "Across blocks",
    footValue: "18",
  },
  {
    label: "Field prototypes",
    value: "28",
    icon: "bulb",
    tone: "impact",
    delta: "Active telemetry stream",
    footLabel: "Stability",
    footValue: "94.2%",
  },
  {
    label: "Grievances cleared",
    value: "19",
    icon: "check-circle",
    tone: "impact",
    delta: "100% officer sign-off",
    footLabel: "Avg closure",
    footValue: "48 days",
  },
  {
    label: "Industry CSR mobilised",
    value: "₹1.84",
    unit: "Cr",
    icon: "banknote",
    tone: "community",
    delta: "38 corporate mentors",
    footLabel: "Public debt raised",
    footValue: "Zero",
  },
];

export const PROJECTS: Project[] = [
  {
    id: "PRJ-198",
    title: "AI-powered turbidity & chlorine dosing system",
    body: "Addressing contaminated drinking water in 12 rural settlements along the Subarnarekha river basin.",
    stage: 5,
    percent: 82,
    cohort: "Ranchi University · Environmental Engg",
    sponsor: "Usha Martin (₹3.8 L)",
    stageLabel: "Calibration & water sampling",
  },
  {
    id: "PRJ-176",
    title: "Cold-mix bituminous rapid pothole patching",
    body: "High-durability all-weather asphalt matrix deployed across the Muri–Silli industrial freight corridor.",
    stage: 4,
    percent: 45,
    cohort: "NIT Jamshedpur · Transportation",
    sponsor: "HEC Ranchi CSR",
    stageLabel: "Compressive stress testing",
  },
  {
    id: "PRJ-162",
    title: "Bio-enzymatic spray drone for landfill odour",
    body: "Automated bacterial digestant misting to control airborne odour and leachate at the Jhiri dump site.",
    stage: 7,
    percent: 90,
    cohort: "BIT Mesra · Biotechnology",
    sponsor: "Tata Steel Foundation",
    stageLabel: "Final resident feedback audit",
  },
];

/* ----------------------------------------------- screen 5: analytics ----- */

export const ANALYTICS = {
  headline: [
    {
      caption: "Cumulative impact",
      label: "Grievances resolved",
      value: "4,120",
      delta: "+34.2% MoM",
      deltaIcon: "trending-up",
      foot: "Progress against 5,188 total filings",
      progress: 79.4,
      progressLabel: "79.4% clearance",
    },
    {
      caption: "Fiscal efficiency",
      label: "Avg cost per solution",
      value: "₹18,400",
      // A *fall* in cost, so the arrow points down even though the news is
      // good — a green up-arrow on a shrinking number reads as a mistake.
      delta: "was ₹3,80,000",
      deltaIcon: "trending-down",
      foot: "95.1% treasury savings via university prototypes versus traditional public-works tenders.",
    },
    {
      caption: "Human capital",
      label: "Innovators mobilised",
      value: "480",
      delta: "Fellows & agronomists",
      deltaIcon: "users",
      foot: "Active in 62 ongoing rapid prototyping clusters across Jharkhand.",
    },
  ],
  /** Category share of the 8,942 validated filings. */
  categories: [
    { label: "Water & Sanitation", share: 32, tone: "impact" },
    { label: "Agriculture & Irrigation", share: 26, tone: "navy" },
    { label: "Roads & Infrastructure", share: 18, tone: "community" },
    { label: "Waste Management", share: 12, tone: "danger" },
    { label: "Public Safety & Health", share: 12, tone: "muted" },
  ],
  /** Ten reporting windows: raw intake, deduplicated, actionable. */
  funnel: [
    { label: "D1-3", raw: 96, dedup: 62, actionable: 34 },
    { label: "D4-6", raw: 88, dedup: 58, actionable: 31 },
    { label: "D7-9", raw: 104, dedup: 70, actionable: 39 },
    { label: "D10-12", raw: 82, dedup: 54, actionable: 29 },
    { label: "D13-15", raw: 92, dedup: 61, actionable: 35 },
    { label: "D16-18", raw: 71, dedup: 47, actionable: 25 },
    { label: "D19-21", raw: 99, dedup: 66, actionable: 37 },
    { label: "D22-24", raw: 112, dedup: 75, actionable: 43 },
    { label: "D25-27", raw: 105, dedup: 69, actionable: 40 },
    { label: "D28-30", raw: 118, dedup: 79, actionable: 46 },
  ],
  sla: [
    {
      severity: "critical" as Severity,
      count: "326",
      avg: "4.2 days",
      legacy: "38 days",
    },
    {
      severity: "high" as Severity,
      count: "1,420",
      avg: "6.8 days",
      legacy: "44 days",
    },
    {
      severity: "medium" as Severity,
      count: "3,840",
      avg: "11.4 days",
      legacy: "62 days",
    },
    {
      severity: "routine" as Severity,
      count: "3,356",
      avg: "14.1 days",
      legacy: "90 days",
    },
  ],
  blocks: [
    { name: "Ranchi Sadar", percent: 92, resolved: 1_240 },
    { name: "Angara", percent: 88, resolved: 860 },
    { name: "Namkum", percent: 81, resolved: 710 },
    { name: "Ormanjhi", percent: 76, resolved: 420 },
    { name: "Kanke", percent: 72, resolved: 380 },
    { name: "Silli", percent: 65, resolved: 290 },
    { name: "Bundu", percent: 59, resolved: 220 },
  ],
  institutions: [
    {
      short: "BM",
      name: "BIT Mesra",
      focus: "Water & structural telemetry",
      projects: 18,
      patents: 5,
      trl: 8,
    },
    {
      short: "RU",
      name: "Ranchi University",
      focus: "Environmental sensor networks",
      projects: 16,
      patents: 7,
      trl: 7,
    },
    {
      short: "NJ",
      name: "NIT Jamshedpur",
      focus: "Transport & power electronics",
      projects: 12,
      patents: 3,
      trl: 6,
    },
    {
      short: "VB",
      name: "Vinoba Bhave University",
      focus: "Smart waste weighbridge",
      projects: 9,
      patents: 2,
      trl: 5,
    },
    {
      short: "KU",
      name: "Kolhan University",
      focus: "Solar streetlight diagnostics",
      projects: 7,
      patents: 1,
      trl: 4,
    },
  ],
  csr: [
    {
      name: "Tata Steel Foundation",
      scope: "Watershed & RO units",
      amount: "₹3.8 Cr",
      share: 100,
    },
    {
      name: "Usha Martin Ltd.",
      scope: "Filtration & telemetry kits",
      amount: "₹3.2 Cr",
      share: 84,
    },
    {
      name: "HEC Ranchi",
      scope: "Rural bridge equipment",
      amount: "₹2.4 Cr",
      share: 63,
    },
    {
      name: "Jindal Renewables",
      scope: "Solar pump inverters",
      amount: "₹1.8 Cr",
      share: 47,
    },
    {
      name: "Hindustan Copper",
      scope: "Micro-grid inverters (Bundu)",
      amount: "₹1.2 Cr",
      share: 32,
    },
  ],
} as const;
