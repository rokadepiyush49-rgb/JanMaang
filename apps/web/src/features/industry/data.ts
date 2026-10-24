/**
 * Industry / CSR partner portal fixtures — the `/industry` segment.
 *
 * Transcribed from the Stitch "JanMaang Industry Collaboration Portal" remix
 * (see docs/STITCH_INVENTORY.md), one export group per screen: dashboard,
 * discover, project dossier, workspace, university labs, monitoring and the
 * CSR ledger.
 *
 * Two rules govern this file.
 *
 * 1. The Stitch reference is a Maharashtra portal — Pune, MPKV, "AquaTech
 *    Solutions". The structure carries over verbatim, the place names do not,
 *    so everything here is Jharkhand and the partner is Usha Martin, which is
 *    already the sponsor `/department` names against P-1024.
 * 2. Where a record is *the same record* the government portals show, it is
 *    imported from @/features/gov rather than retyped. `/department` sanctions
 *    P-1024 and `/industry` sponsors it; if the two drift, one of the screens
 *    is lying about a real docket.
 *
 * Everything else is a presentation fixture in the shape the API will return,
 * to be re-pointed at services/api/app/modules/{projects,funding,analytics}.
 */

import type { IconName } from "@/components/icon";
import type { Severity } from "@/features/gov/data";
import type { Kpi } from "@/features/gov/department";

export const NAV = [
  { href: "/industry", label: "Collaboration Hub", icon: "dashboard" },
  { href: "/industry/discover", label: "Discover Projects", icon: "search" },
  { href: "/industry/workspace", label: "Active Workspace", icon: "briefcase" },
  { href: "/industry/labs", label: "University Labs", icon: "graduation" },
  {
    href: "/industry/monitoring",
    label: "Monitoring & Tracking",
    icon: "gauge",
  },
  { href: "/industry/impact", label: "CSR & Impact Ledger", icon: "banknote" },
] satisfies { href: string; label: string; icon: IconName }[];

/* ------------------------------------------------------------- partner --- */

/** Who the portal thinks it is serving. Read from the partner's onboarding
 *  record in a real deployment, not a constant. */
export const PARTNER = {
  name: "Usha Martin Ltd.",
  division: "R&D and CSR Division",
  hq: "Tatisilwai Industrial Area, Ranchi",
  sector: "Hydro-telemetry and gate automation",
  rep: {
    name: "Rajesh Varma",
    title: "VP Engineering · Partner representative",
  },
  node: "Ranchi Command",
  /** Domain affinity the matcher scores this partner at, across the district. */
  fit: 96,
} as const;

/**
 * The FY26 civic-innovation window.
 *
 * `groupOutlay` is the same ₹3.2 Cr `/department` analytics attributes to Usha
 * Martin. `committed` is the slice of it routed through JanMaang this year —
 * the two are not the same number and the screens must not imply they are.
 */
export const CSR_POOL = {
  committed: "₹20.0 L",
  utilised: "₹18.6 L",
  utilisedPercent: 93,
  initiatives: 12,
  groupOutlay: "₹3.2 Cr",
  schedule:
    "Schedule VII, Companies Act 2013 (item iv — environmental sustainability)",
} as const;

/* ------------------------------------------------- screen 1: dashboard --- */

/**
 * The five-link chain the dashboard opens with.
 *
 * This is the quad-helix seen from the sponsor's chair: `gov/data` PIPELINE
 * renders the same pipeline from the officer's. Both mark where the reader
 * sits, which is why neither can be swapped for the other.
 */
export const PARTNER_CHAIN: {
  n: string;
  title: string;
  body: string;
  statLabel: string;
  statValue: string;
  icon: IconName;
  you?: boolean;
}[] = [
  {
    n: "01",
    title: "Citizen need",
    body: "47 grievance reports from the Getalsud belt, geo-clustered by the platform into CL-204.",
    statLabel: "AI clustering",
    statValue: "94% match",
    icon: "message",
  },
  {
    n: "02",
    title: "District sanction",
    body: "Ranchi Collectorate validated the breach and released it for institutional intervention.",
    statLabel: "Sanction order",
    statValue: "JH-RAN-IRR-2025-09",
    icon: "shield",
  },
  {
    n: "03",
    title: "University lab",
    body: "BIT Mesra JalRakshak cohort holds a working solar pressure-differential prototype.",
    statLabel: "Engineers ready",
    statValue: "5 final-year",
    icon: "graduation",
  },
  {
    n: "04",
    title: "Your role",
    body: "LoRaWAN gateways, ultrasonic clamp-on meters and the ₹2.5 L hardware grant.",
    statLabel: "Mentorship + deployment",
    statValue: "₹2.5 L kit",
    icon: "factory",
    you: true,
  },
  {
    n: "05",
    title: "Citizen impact",
    body: "850 hectares of paddy protected across three hamlets in the Angara block.",
    statLabel: "Citizens protected",
    statValue: "~2,800",
    icon: "heart",
  },
];

export const KPIS: Kpi[] = [
  {
    label: "Relevant problems",
    value: "28",
    icon: "warning",
    tone: "navy",
    delta: "4 in critical triage",
    footLabel: "Matched to your domain",
    footValue: "11 water",
  },
  {
    label: "Active collaborations",
    value: "6",
    icon: "briefcase",
    tone: "impact",
    delta: "2 in field testing",
    footLabel: "Contracts live",
    footValue: "JM-2025-UM88",
  },
  {
    label: "CSR deployed",
    value: "₹18.6",
    unit: "L",
    icon: "banknote",
    tone: "community",
    delta: "93% of FY26 commitment",
    footLabel: "Sponsored initiatives",
    footValue: "12",
  },
  {
    label: "Students engaged",
    value: "84",
    icon: "graduation",
    tone: "navy",
    delta: "Across 14 institutions",
    footLabel: "Internship offers made",
    footValue: "4",
  },
  {
    label: "Citizens impacted",
    value: "18.4",
    unit: "K",
    icon: "users",
    tone: "impact",
    delta: "Across 32 villages",
    footLabel: "Blocks covered",
    footValue: "9",
  },
  {
    label: "AI match quality",
    value: "96%",
    icon: "sparkles",
    tone: "community",
    delta: "Highest domain affinity",
    footLabel: "Proposals accepted",
    footValue: "11 of 12",
  },
];

/** The single highest-scoring open match, rendered as the dashboard hero. */
export const TOP_MATCH = {
  problemId: "P-1024",
  projectId: "PRJ-204",
  clusterId: "CL-204",
  severity: "critical" as Severity,
  match: 96,
  confidence: 94,
  queue: "District Collector triage queue",
  title: "Canal water leakage flooding 850 hectares of paddy",
  place: "Angara block · Getalsud, Sikidiri distributary",
  body: "District triage needs Usha Martin industrial flow sensors and LoRaWAN telemetry to carry the BIT Mesra student prototype from the bench onto the canal bank.",
  facts: [
    {
      label: "Academic partner",
      value: "BIT Mesra",
      note: "5 engineers · Water Resources lab",
      icon: "graduation" as IconName,
    },
    {
      label: "Citizen impact scale",
      value: "850 ha · ~2,800 citizens",
      note: "₹2.4 Cr silt damage at risk",
      icon: "users" as IconName,
    },
    {
      label: "Industry support sought",
      value: "IoT sensors + ₹2.5 L",
      note: "Hardware kit and field engineer",
      icon: "factory" as IconName,
    },
  ],
  breakdown: [
    { label: "Domain affinity (hydraulics)", percent: 98 },
    { label: "Geographic proximity (18 km)", percent: 94 },
    { label: "Hardware catalogue overlap", percent: 96 },
  ],
} as const;

/** The AI-ranked opportunity queue under the hero. */
export interface Opportunity {
  problemId: string;
  severity: Severity;
  title: string;
  category: string;
  block: string;
  place: string;
  reports: number;
  match: number;
  confidence: number;
  lab: string;
  cta: string;
  projectId?: string;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    problemId: "P-1024",
    severity: "critical",
    title: "Canal water leakage flooding 850 hectares",
    category: "Agriculture & Irrigation",
    block: "Angara",
    place: "Getalsud · Sikidiri basin",
    reports: 47,
    match: 96,
    confidence: 94,
    lab: "BIT Mesra — Water Resources",
    cta: "Review match",
    projectId: "PRJ-204",
  },
  {
    problemId: "P-1018",
    severity: "high",
    title: "Iron and fluoride contamination in ward borewells",
    category: "Water & Sanitation",
    block: "Namkum",
    place: "Hesalong · 6 tolas",
    reports: 31,
    match: 88,
    confidence: 91,
    lab: "Ranchi University — Environmental Lab",
    cta: "Collaborate",
    projectId: "PRJ-198",
  },
  {
    problemId: "P-1011",
    severity: "high",
    title: "Solar lift irrigation pumps dead across four tolas",
    category: "Power & Energy",
    block: "Ormanjhi",
    place: "Chutupalu",
    reports: 28,
    match: 85,
    confidence: 89,
    lab: "NIT Jamshedpur — Power Electronics",
    cta: "Collaborate",
  },
  {
    problemId: "P-994",
    severity: "medium",
    title: "Industrial effluent discharge into Subarnarekha feeder",
    category: "Public Health & Safety",
    block: "Namkum",
    place: "Tupudana MIDC belt",
    reports: 19,
    match: 79,
    confidence: 93,
    lab: "Vinoba Bhave University — Chemistry",
    cta: "Collaborate",
  },
  {
    problemId: "P-982",
    severity: "critical",
    title: "Culvert subsidence threatening NH-33 approach road",
    category: "Roads & Infrastructure",
    block: "Silli",
    place: "Muri · freight corridor",
    reports: 52,
    match: 74,
    confidence: 98,
    lab: "BIT Mesra — Structural Engg",
    cta: "Collaborate",
  },
];

export const OPPORTUNITY_FILTERS = [
  "All (28)",
  "Action required (4)",
  "Under review (3)",
  "Monitoring (3)",
];

/* --------------------------------------------------- screen 2: discover -- */

export interface DiscoverProject {
  id: string;
  problemId: string;
  severity: Severity;
  match: number;
  verified: boolean;
  title: string;
  body: string;
  university: string;
  citizens: string;
  /** Rupees the cohort still needs. Formatted at the point of render so the
   *  proposal builder can compare a sponsor's offer against it. */
  gapAmount: number;
  discipline: string;
}

export const DISCOVER_DISCIPLINES = [
  "All disciplines (28)",
  "Water management (11)",
  "Smart irrigation (7)",
  "IoT infrastructure (5)",
  "Rural drinking quality (3)",
  "Soil & watershed (2)",
];

export const DISCOVER_SORTS = [
  "Highest AI match",
  "Citizens affected",
  "Smallest funding gap",
];

export const DISCOVER: DiscoverProject[] = [
  {
    id: "PRJ-204",
    problemId: "P-1024",
    severity: "critical",
    match: 96,
    verified: true,
    title: "Smart sluice sensing & canal leakage prevention",
    body: "Autonomous acoustic and pressure IoT nodes along the Sikidiri distributary to stop 4.2 m³/s of anomalous discharge.",
    university: "BIT Mesra",
    citizens: "2,800 farmers",
    gapAmount: 250_000,
    discipline: "Smart irrigation",
  },
  {
    id: "PRJ-198",
    problemId: "P-1018",
    severity: "high",
    match: 88,
    verified: true,
    title: "Fluoride & heavy-metal telemetry for borewells",
    body: "Solar spectrophotometry pods pushing citizen water-quality alerts over SMS across the Namkum rural belt.",
    university: "Ranchi University",
    citizens: "6,100 villagers",
    gapAmount: 280_000,
    discipline: "Rural drinking quality",
  },
  {
    id: "PRJ-176",
    problemId: "P-970",
    severity: "medium",
    match: 94,
    verified: true,
    title: "Greywater phytoremediation for panchayat schools",
    body: "Low-cost bio-filtration beds recycling flush and garden water for anganwadis and schools in the Kanke block.",
    university: "Vinoba Bhave University",
    citizens: "1,400 students",
    gapAmount: 190_000,
    discipline: "Water management",
  },
  {
    id: "PRJ-162",
    problemId: "P-994",
    severity: "medium",
    match: 81,
    verified: true,
    title: "Effluent-outfall continuous monitoring buoys",
    body: "Anchored conductivity and pH buoys on the Subarnarekha feeder, streaming CPCB-format readings to the pollution board.",
    university: "Ranchi University",
    citizens: "9,200 residents",
    gapAmount: 340_000,
    discipline: "IoT infrastructure",
  },
  {
    id: "PRJ-151",
    problemId: "P-1011",
    severity: "high",
    match: 77,
    verified: false,
    title: "Solar pump controller fault-signature diagnostics",
    body: "Edge classifier reading inverter telemetry to predict the 2023-batch controller failure before the pump stops.",
    university: "NIT Jamshedpur",
    citizens: "1,100 farmers",
    gapAmount: 410_000,
    discipline: "IoT infrastructure",
  },
  {
    id: "PRJ-144",
    problemId: "P-1002",
    severity: "routine",
    match: 72,
    verified: true,
    title: "Watershed recharge-pit siting from LiDAR",
    body: "Drone LiDAR and soil-infiltration modelling to place recharge pits across the Ormanjhi micro-watershed.",
    university: "BIT Mesra",
    citizens: "3,600 villagers",
    gapAmount: 120_000,
    discipline: "Soil & watershed",
  },
];

/* -------------------------------------------- screen 3: project dossier -- */

/**
 * The contributions a sponsor can put in a proposal.
 *
 * `amount` is what each line adds to the funding total in the proposal
 * builder; a nil-cost commitment carries 0 and still appears on the docket.
 */
export const SUPPORT_OPTIONS: {
  id: string;
  label: string;
  body: string;
  icon: IconName;
  amount: number;
  /** Priced from the project's own funding gap rather than this table, so one
   *  option list serves every docket in the marketplace. */
  fillsGap?: boolean;
  preset?: boolean;
}[] = [
  {
    id: "grant",
    label: "CSR sponsorship — full funding gap",
    body: "Funds student hardware, PCB fabrication and on-site commissioning gear.",
    icon: "banknote",
    amount: 0,
    fillsGap: true,
    preset: true,
  },
  {
    id: "cloud",
    label: "Technology & cloud credits",
    body: "Telemetry server API access and two dedicated LoRaWAN gateways.",
    icon: "globe",
    amount: 60_000,
    preset: true,
  },
  {
    id: "mentorship",
    label: "Weekly engineering mentorship",
    body: "Senior embedded engineers review schematics every Friday for the sprint.",
    icon: "users",
    amount: 0,
  },
  {
    id: "sensors",
    label: "Industrial flow sensors",
    body: "Six ultrasonic clamp-on meters donated for baseline validation.",
    icon: "gauge",
    amount: 90_000,
  },
  {
    id: "vehicle",
    label: "Field deployment vehicle",
    body: "Technician vehicle and crew for five days of on-site commissioning.",
    icon: "map",
    amount: 40_000,
  },
  {
    id: "internships",
    label: "Pre-placement offers & internships",
    body: "Four summer internships for the top-performing students on the cohort.",
    icon: "award",
    amount: 0,
  },
];

/** The audit trail the district exposes to a prospective sponsor. */
export const AUDIT_TRAIL = [
  {
    title: "47 citizen reports validated",
    body: "Geotagged citizen photographs verified across three villages in the Getalsud belt.",
    icon: "check-circle" as IconName,
  },
  {
    title: "AI deduplication complete",
    body: "Semantic clustering unified the separate filings into cluster CL-204.",
    icon: "bot" as IconName,
  },
  {
    title: "District sanction order active",
    body: "Collectorate sanction order JH-RAN-IRR-2025-09, signed by the Executive Engineer, PHED.",
    icon: "shield" as IconName,
  },
];

/* ------------------------------------------------- screen 4: workspace --- */

export const WORKSPACE = {
  contract: "JM-2025-UM88",
  projectId: "PRJ-204",
  title: "Usha Martin × BIT Mesra working group",
  body: "Live co-development sprint for the Sikidiri canal sluice deployment in the Angara block.",
  milestones: [
    {
      n: "1",
      name: "District sanction",
      state: "done" as const,
      note: "Complete",
    },
    { n: "2", name: "Team formed", state: "done" as const, note: "Complete" },
    {
      n: "3",
      name: "CSR allocated",
      state: "done" as const,
      note: "₹2.5 L funded",
    },
    { n: "4", name: "Lab prototype", state: "done" as const, note: "Verified" },
    {
      n: "5",
      name: "Field testing",
      state: "active" as const,
      note: "Active (68%)",
    },
    {
      n: "6",
      name: "Collector handover",
      state: "todo" as const,
      note: "Pending test",
    },
  ],
  stream: {
    node: "Getalsud basin node #DN-42",
    signal: "98% (LoRaWAN)",
    sink: "Piped to the Ranchi Irrigation Authority dashboard.",
    rows: [
      {
        time: "14:32:05 IST",
        flow: "4.21 m³/s",
        pressure: "188 kPa",
        spike: true,
        status: "Breach warning",
        tone: "danger" as const,
      },
      {
        time: "14:31:05 IST",
        flow: "4.18 m³/s",
        pressure: "172 kPa",
        spike: false,
        status: "Elevated",
        tone: "community" as const,
      },
      {
        time: "14:30:05 IST",
        flow: "4.15 m³/s",
        pressure: "170 kPa",
        spike: false,
        status: "Elevated",
        tone: "community" as const,
      },
      {
        time: "14:29:05 IST",
        flow: "3.98 m³/s",
        pressure: "164 kPa",
        spike: false,
        status: "Nominal",
        tone: "impact" as const,
      },
    ],
  },
  updates: [
    {
      author: "Dr. S. Kulkarni",
      role: "Faculty lead · BIT Mesra",
      when: "Today at 11:20 AM",
      body: "The Usha Martin LoRaWAN gateway reached Mesra campus. The team has flashed the firmware and calibrated the pressure threshold alerts.",
    },
    {
      author: "Rohan Mahto",
      role: "Student lead · JalRakshak",
      when: "Yesterday at 4:15 PM",
      body: "Tested the waterproof enclosures in the simulation canal. The six donated sensors held ±0.5% variance against the manual gauges.",
    },
    {
      author: "Rajesh Varma",
      role: "VP Engineering · Usha Martin",
      when: "Mon at 6:02 PM",
      body: "Second gateway ships Thursday. Keep the spare actuator sealed until the collector's field pass clears.",
    },
  ],
  documents: [
    { name: "Sensor_Calibration_v2.c", icon: "code" as IconName },
    { name: "Collector_Permission_Slip.pdf", icon: "file-pen" as IconName },
    { name: "CSR_Tranche_1_Receipt.pdf", icon: "banknote" as IconName },
  ],
} as const;

/* ------------------------------------------- screen 5: university labs --- */

export const LABS: {
  short: string;
  name: string;
  place: string;
  focus: string;
  cohort: string;
  rating: string;
  projects: number;
  sponsored: boolean;
}[] = [
  {
    short: "BM",
    name: "BIT Mesra",
    place: "Mesra, Ranchi",
    focus: "Agri-hydraulics & IoT telemetry",
    cohort: "28 researchers",
    rating: "4.9 / 5.0",
    projects: 2,
    sponsored: true,
  },
  {
    short: "RU",
    name: "Ranchi University",
    place: "Morabadi, Ranchi",
    focus: "Environmental sensor networks",
    cohort: "42 researchers",
    rating: "5.0 / 5.0",
    projects: 3,
    sponsored: true,
  },
  {
    short: "NJ",
    name: "NIT Jamshedpur",
    place: "Adityapur, Jamshedpur",
    focus: "Power electronics & drives",
    cohort: "19 researchers",
    rating: "4.8 / 5.0",
    projects: 1,
    sponsored: false,
  },
  {
    short: "VB",
    name: "Vinoba Bhave University",
    place: "Hazaribagh",
    focus: "Environmental biotechnology",
    cohort: "22 researchers",
    rating: "4.7 / 5.0",
    projects: 2,
    sponsored: true,
  },
  {
    short: "KU",
    name: "Kolhan University",
    place: "Chaibasa, West Singhbhum",
    focus: "Solar diagnostics & rural power",
    cohort: "14 researchers",
    rating: "4.6 / 5.0",
    projects: 1,
    sponsored: false,
  },
  {
    short: "CU",
    name: "Central University of Jharkhand",
    place: "Cheri-Manatu, Ranchi",
    focus: "Water chemistry & remote sensing",
    cohort: "17 researchers",
    rating: "4.5 / 5.0",
    projects: 1,
    sponsored: false,
  },
];

/* ------------------------------------------------ screen 6: monitoring --- */

export const MONITORING_KPIS: Kpi[] = [
  {
    label: "Total active projects",
    value: "14",
    icon: "clipboard",
    tone: "navy",
    delta: "Across 4 engineering departments",
    footLabel: "Institutions",
    footValue: "6",
  },
  {
    label: "Projects on track",
    value: "11",
    icon: "check-circle",
    tone: "impact",
    delta: "78.6% nominal flow",
    footLabel: "Ahead of milestone",
    footValue: "3",
  },
  {
    label: "Projects at risk",
    value: "2",
    icon: "alert-circle",
    tone: "danger",
    delta: "Hardware & gateway delays",
    footLabel: "Escalated to sponsor",
    footValue: "1",
  },
  {
    label: "Average completion",
    value: "68.4%",
    icon: "gauge",
    tone: "community",
    delta: "+6.2 pts this month",
    footLabel: "Median sprint age",
    footValue: "94 days",
  },
];

/**
 * The three filter axes above the tracker.
 *
 * `active` is the option the screen renders as selected. Carried in the
 * fixture rather than assumed to be the first entry, so the day these become
 * query parameters the shape already holds the answer.
 */
export const MONITORING_FILTERS: {
  label: string;
  active: string;
  options: string[];
}[] = [
  {
    label: "Status",
    active: "All statuses",
    options: ["All statuses", "On track", "At risk", "Delayed"],
  },
  {
    label: "Domain",
    active: "All domains",
    options: [
      "All domains",
      "Agriculture & Irrigation",
      "Water & Sanitation",
      "Renewable Energy",
    ],
  },
  {
    label: "Milestone",
    active: "All stages",
    options: [
      "All stages",
      "Stage 3: Telemetry",
      "Stage 4: Field testing",
      "Stage 5: Handover",
    ],
  },
];

export interface TrackedProject {
  id: string;
  health: "On track" | "At risk" | "Delayed";
  domain: string;
  authority: string;
  title: string;
  problem: string;
  percent: number;
  team: {
    name: string;
    dept: string;
    lead: string;
    contact: string;
    members: string;
    mentor: string;
  };
  sponsor: { name: string; role: string; note: string; ours: boolean };
  timeline: { started: string; expected: string; stage: string };
  dispatch: string;
  updated: string;
}

/**
 * The project the deep dossier at the foot of the tracker expands.
 *
 * Named rather than indexed out of TRACKED so the page can reference it
 * without a non-null assertion, and so reordering the list cannot silently
 * change which project the dossier is about.
 */
export const SPOTLIGHT: TrackedProject = {
  id: "PRJ-204",
  health: "On track",
  domain: "Agriculture & Irrigation",
  authority: "Angara block, Ranchi district",
  title: "Canal leakage detection & automated sluice gate control",
  problem:
    "The Sikidiri distributary breached at Ch. 42.4 km, discharging 4.2 m³/s unmetered and inundating 850 hectares across three villages — 47 citizen reports verified by the Ranchi Collectorate.",
  percent: 68,
  team: {
    name: "JalRakshak",
    dept: "Dept. of Civil & Water Resources Engineering, BIT Mesra",
    lead: "Rohan Mahto (B.Tech Civil, 8th sem)",
    contact: "rohan.m@bitmesra.ac.in · +91 94311 44102",
    members:
      "Sneha P. (firmware), Amit S. (hydraulics), Priyanka K. (GIS) + 2 others",
    mentor: "Dr. S. Kulkarni (Head, Soil & Water Engg)",
  },
  sponsor: {
    name: "Usha Martin Ltd.",
    role: "IoT hardware sponsor & telemetry mentor",
    note: "₹2.5 L grant · 24 ultrasonic meters · LoRaWAN gateway · fortnightly mentorship",
    ours: true,
  },
  timeline: {
    started: "12 Aug 2025",
    expected: "20 Dec 2025",
    stage: "Stage 4 — field validation",
  },
  dispatch:
    "Deployed six LoRaWAN nodes along the 12 km stretch; packet latency held at 1.4 s through monsoon rainfall.",
  updated: "2 hours ago by Rohan Mahto",
};

export const TRACKED: TrackedProject[] = [
  SPOTLIGHT,
  {
    id: "PRJ-189",
    health: "At risk",
    domain: "Renewable Energy & Storage",
    authority: "Ormanjhi block rural development",
    title: "Solar micro cold-storage with automated grid switch",
    problem:
      "Off-grid perishable cold room for marginal tomato and onion growers losing a third of each harvest to spoilage.",
    percent: 45,
    team: {
      name: "Helios",
      dept: "Dept. of Mechanical Engineering, NIT Jamshedpur",
      lead: "Anjali Tirkey (M.Tech Thermal)",
      contact: "anjali.t@nitjsr.ac.in · +91 94702 11876",
      members: "Farhan Q. (power), Devraj M. (controls) + 3 others",
      mentor: "Prof. K. Bhattacharya",
    },
    sponsor: {
      name: "Jindal Renewables",
      role: "Hybrid inverter sponsor",
      note: "Awaiting hybrid inverter delivery — customs clearance pending",
      ours: false,
    },
    timeline: {
      started: "02 Jul 2025",
      expected: "15 Jan 2026",
      stage: "Stage 3 — bench integration",
    },
    dispatch:
      "Custom lithium BMS is held at customs; bench testing extended by ten days and the field window slips to January.",
    updated: "Yesterday by Prof. K. Bhattacharya",
  },
  {
    id: "PRJ-215",
    health: "On track",
    domain: "Water & Sanitation",
    authority: "Ranchi Municipal Corporation",
    title: "Municipal greywater biological filtration prototype",
    problem:
      "Phytoremediation and aeration reed beds processing 8,000 L/day of civic greywater for non-potable landscaping reuse.",
    percent: 88,
    team: {
      name: "BioClean",
      dept: "Environmental Sciences cohort, Ranchi University",
      lead: "Meera Kujur (M.Sc Environmental Science)",
      contact: "meera.k@ranchiuniversity.ac.in · +91 90062 55310",
      members: "Sahil E. (microbiology), Nidhi B. (civil) + 4 others",
      mentor: "Dr. P. Sinha",
    },
    sponsor: {
      name: "Usha Martin Ltd.",
      role: "Membrane filtration unit sponsor",
      note: "₹3.1 L grant · 4 membrane stacks · commissioning support",
      ours: true,
    },
    timeline: {
      started: "18 Apr 2025",
      expected: "30 Nov 2025",
      stage: "Stage 5 — handover trial",
    },
    dispatch:
      "Water quality metrics conform to CPCB Class B; the final handover trial with the corporation is underway.",
    updated: "3 days ago by Dr. P. Sinha",
  },
];

/** The verification workflow shown inside the PRJ-204 dossier. */
export const MILESTONES: {
  n: string;
  name: string;
  body: string;
  percent: number;
  state: "done" | "active" | "todo";
  note: string;
}[] = [
  {
    n: "M1",
    name: "Citizen need & topographic survey",
    body: "47 geotagged breach coordinates mapped against drone LiDAR telemetry.",
    percent: 100,
    state: "done",
    note: "Collector sanctioned",
  },
  {
    n: "M2",
    name: "Sensor prototype & bench calibration",
    body: "Ultrasonic level meters calibrated in the BIT Mesra fluid dynamics tank.",
    percent: 100,
    state: "done",
    note: "Lab calibrated",
  },
  {
    n: "M3",
    name: "LoRaWAN telemetry & industry integration",
    body: "Six of eight nodes installed; latency steady at 1.4 s under rainfall.",
    percent: 68,
    state: "active",
    note: "Current milestone",
  },
  {
    n: "M4",
    name: "Canal bed field testing & sluice actuation",
    body: "Gate actuator commissioning on breach gate #4 with the field engineer on site.",
    percent: 0,
    state: "todo",
    note: "ETA 15 Nov 2025",
  },
  {
    n: "M5",
    name: "Collectorate handover & early warning",
    body: "Final validation with the Ranchi Irrigation Authority and citizen OTP sign-off.",
    percent: 0,
    state: "todo",
    note: "ETA 10 Dec 2025",
  },
];

export const DELIVERABLES: { name: string; icon: IconName; size: string }[] = [
  { name: "Field_Telemetry_Report_v2.pdf", icon: "file-pen", size: "2.4 MB" },
  { name: "Circuit_Schematic_PCB.zip", icon: "code", size: "8.1 MB" },
  { name: "Interim_Field_Data.csv", icon: "bar-chart", size: "640 KB" },
  { name: "Collectorate_Site_Permission.pdf", icon: "shield", size: "310 KB" },
];

/* ---------------------------------------------- screen 7: CSR & impact --- */

export const IMPACT = {
  certificate: "JH-RAN-CSR-FY26-UM-014",
  nextAudit: "18 Nov 2025",
  headline: [
    {
      label: "FY26 CSR utilised",
      value: "₹18,60,000",
      note: "93% of the annual JanMaang commitment",
      icon: "banknote" as IconName,
      tone: "community" as const,
    },
    {
      label: "Citizens impacted",
      value: "18,400+",
      note: "Across 32 villages in nine blocks",
      icon: "users" as IconName,
      tone: "impact" as const,
    },
    {
      label: "Student researchers funded",
      value: "84",
      note: "Across 14 institutions in Jharkhand",
      icon: "graduation" as IconName,
      tone: "navy" as const,
    },
    {
      label: "Patent & tech filings",
      value: "3",
      note: "Joint academic–industry IP, two provisional",
      icon: "award" as IconName,
      tone: "community" as const,
    },
  ],
  domains: [
    {
      label: "Water conservation & canal infrastructure",
      percent: 45,
      value: "₹8.37 L",
      tone: "impact" as const,
    },
    {
      label: "Smart agriculture & micro-irrigation",
      percent: 35,
      value: "₹6.51 L",
      tone: "navy" as const,
    },
    {
      label: "Rural drinking water quality",
      percent: 20,
      value: "₹3.72 L",
      tone: "community" as const,
    },
  ],
  partners: [
    {
      name: "BIT Mesra",
      note: "2 active projects · 16 students",
      amount: "₹6.5 L",
      percent: 100,
    },
    {
      name: "Ranchi University",
      note: "3 active projects · 24 students",
      amount: "₹7.2 L",
      percent: 92,
    },
    {
      name: "Vinoba Bhave University",
      note: "1 active project · 8 students",
      amount: "₹4.9 L",
      percent: 63,
    },
  ],
  /** Quarterly disbursement, FY25 Q1 through FY26 Q2. */
  disbursement: [1.2, 1.8, 2.4, 2.1, 3.2, 4.0, 3.9],
  outcomes: [
    { label: "Grievances closed with sponsor hardware", value: "19" },
    { label: "Average cost per deployed solution", value: "₹18,400" },
    { label: "Internships converted to offers", value: "4 of 4" },
    { label: "Tranches verified by the Collectorate", value: "11" },
  ],
} as const;
