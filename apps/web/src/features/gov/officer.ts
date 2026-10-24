/**
 * Field Officer portal fixtures — the `/officer` segment.
 *
 * The officer is stage 7 of the lifecycle: the department has sanctioned the
 * work and released money, and this desk turns that into something a citizen
 * can sign off. Where the panchayat *verifies* and the department *sanctions*,
 * the officer *executes and reports* — every screen is organised around the
 * next update owed, not the next decision to make.
 *
 * Work IDs reuse the panchayat's `W-20xx` records, so W-2041 reads the same
 * money, stage and agency in `/panchayat/works`, here, and on the industry
 * monitoring screen. See ./data.ts for why these are fixtures.
 */

import type { IconName } from "@/components/icon";
import type { Severity } from "./data";

export const NAV = [
  { href: "/officer", label: "Field Desk", icon: "dashboard" },
  { href: "/officer/works", label: "Assigned Works", icon: "clipboard" },
  { href: "/officer/visits", label: "Site Visits", icon: "calendar" },
] satisfies { href: string; label: string; icon: IconName }[];

/** The posting being viewed. Real deployments read this from the HRMS record. */
export const POSTING = {
  name: "Anand Kumar",
  designation: "Assistant Engineer · PHED",
  subdivision: "Angara sub-division, Ranchi",
  badge: "AE-RAN-0417",
  reportsTo: "Executive Engineer, PHED Ranchi",
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
    label: "Assigned works",
    value: "7",
    icon: "clipboard",
    tone: "navy",
    delta: "2 added this month",
    footLabel: "Sanctioned value",
    footValue: "₹46.9 L",
  },
  {
    label: "Updates overdue",
    value: "2",
    icon: "alert-circle",
    tone: "danger",
    delta: "Weekly update window missed",
    footLabel: "Due in next 48h",
    footValue: "3",
  },
  {
    label: "Site visits today",
    value: "3",
    icon: "map-pin",
    tone: "community",
    delta: "64 km planned route",
    footLabel: "This week",
    footValue: "9",
  },
  {
    label: "Awaiting sign-off",
    value: "1",
    icon: "check-circle",
    tone: "impact",
    delta: "Citizen OTP sent",
    footLabel: "Closed this FY",
    footValue: "11",
  },
];

/* --------------------------------------------------------------- works --- */

export interface OfficerWork {
  id: string;
  title: string;
  demandId: string;
  panchayat: string;
  block: string;
  domain: string;
  severity: Severity;
  /** Lifecycle stage, 1-8, from LIFECYCLE in ./data.ts. */
  stage: number;
  stageLabel: string;
  percent: number;
  sanctioned: string;
  released: string;
  agency: string;
  due: string;
  lastUpdate: string;
  /** The officer's next statutory progress report on this work. */
  nextUpdate: string;
  updateState: "overdue" | "due" | "ok" | "closed";
}

/** How each reporting state reads on a chip, shared by every officer screen. */
export const UPDATE_STATE: Record<
  OfficerWork["updateState"],
  { label: string; tone: "danger" | "community" | "navy" | "impact" }
> = {
  overdue: { label: "Update overdue", tone: "danger" },
  due: { label: "Update due", tone: "community" },
  ok: { label: "On schedule", tone: "navy" },
  closed: { label: "Closed", tone: "impact" },
};

export const WORKS: OfficerWork[] = [
  {
    id: "W-2041",
    title: "Smart sluice sensor & canal lining repair",
    demandId: "P-1024",
    panchayat: "Getalsud GP",
    block: "Angara",
    domain: "Agriculture & Irrigation",
    severity: "critical",
    stage: 7,
    stageLabel: "Field installation",
    percent: 68,
    sanctioned: "₹8,40,000",
    released: "₹5,71,200",
    agency: "BIT Mesra + Usha Martin Ltd.",
    due: "18 Nov 2025",
    lastUpdate: "20 Sep 2025",
    nextUpdate: "23 Sep 2025",
    updateState: "due",
  },
  {
    id: "W-2033",
    title: "Haat drain desilting & covered channel",
    demandId: "P-1022",
    panchayat: "Getalsud GP",
    block: "Angara",
    domain: "Public Health & Safety",
    severity: "high",
    stage: 7,
    stageLabel: "Agency mobilisation",
    percent: 30,
    sanctioned: "₹2,10,000",
    released: "₹63,000",
    agency: "Panchayat Rozgar Sevak",
    due: "02 Dec 2025",
    lastUpdate: "12 Sep 2025",
    nextUpdate: "19 Sep 2025",
    updateState: "overdue",
  },
  {
    id: "W-2056",
    title: "Solar dual-pump mini piped water supply",
    demandId: "P-1047",
    panchayat: "Lalkhatanga GP",
    block: "Namkum",
    domain: "Water & Sanitation",
    severity: "high",
    stage: 7,
    stageLabel: "Tank erection",
    percent: 54,
    sanctioned: "₹14,80,000",
    released: "₹8,88,000",
    agency: "Jharkhand Renewable Energy Dev. Agency",
    due: "30 Dec 2025",
    lastUpdate: "18 Sep 2025",
    nextUpdate: "25 Sep 2025",
    updateState: "ok",
  },
  {
    id: "W-2049",
    title: "Jal Jeevan household tap connections (186 HH)",
    demandId: "P-1039",
    panchayat: "Pithoria GP",
    block: "Kanke",
    domain: "Water & Sanitation",
    severity: "medium",
    stage: 7,
    stageLabel: "Last-mile connections",
    percent: 72,
    sanctioned: "₹11,16,000",
    released: "₹8,03,500",
    agency: "PHED · Kanke sub-division",
    due: "15 Nov 2025",
    lastUpdate: "19 Sep 2025",
    nextUpdate: "26 Sep 2025",
    updateState: "ok",
  },
  {
    id: "W-2044",
    title: "Iron-removal plant retrofit at village tank",
    demandId: "P-1036",
    panchayat: "Sildiri GP",
    block: "Ormanjhi",
    domain: "Water & Sanitation",
    severity: "medium",
    stage: 7,
    stageLabel: "Filter media replacement",
    percent: 40,
    sanctioned: "₹6,20,000",
    released: "₹1,86,000",
    agency: "BIT Mesra · Dept. of Chemical Engg.",
    due: "20 Dec 2025",
    lastUpdate: "08 Sep 2025",
    nextUpdate: "15 Sep 2025",
    updateState: "overdue",
  },
  {
    id: "W-2038",
    title: "Handpump repair drive — 22 points",
    demandId: "P-1027",
    panchayat: "Bero GP",
    block: "Bero",
    domain: "Water & Sanitation",
    severity: "routine",
    stage: 8,
    stageLabel: "Citizen sign-off pending",
    percent: 96,
    sanctioned: "₹3,30,000",
    released: "₹3,16,800",
    agency: "PHED · Bero mechanic cell",
    due: "30 Sep 2025",
    lastUpdate: "21 Sep 2025",
    nextUpdate: "OTP closure",
    updateState: "due",
  },
  {
    id: "W-2011",
    title: "Community toilet water connection restoration",
    demandId: "P-1004",
    panchayat: "Getalsud GP",
    block: "Angara",
    domain: "Water & Sanitation",
    severity: "routine",
    stage: 8,
    stageLabel: "Citizen sign-off complete",
    percent: 100,
    sanctioned: "₹64,000",
    released: "₹64,000",
    agency: "PHED · Angara sub-division",
    due: "Closed 30 Aug 2025",
    lastUpdate: "30 Aug 2025",
    nextUpdate: "—",
    updateState: "closed",
  },
];

/* --------------------------------------------------------------- visits --- */

export interface SiteVisit {
  time: string;
  workId: string;
  site: string;
  purpose: string;
  distance: string;
  checklist: { label: string; done: boolean }[];
  state: "done" | "next" | "later";
}

/** Today's route, in driving order from the sub-division office. */
export const TODAY = {
  date: "Mon 22 Sep 2025",
  start: "PHED sub-division office, Angara",
  vehicle: "JH01-GA-4471",
  visits: [
    {
      time: "09:30",
      workId: "W-2033",
      site: "Getalsud haat, Ward 3",
      purpose: "Confirm agency on site; record desilting start",
      distance: "6 km",
      checklist: [
        { label: "Geo-tagged photo of drain mouth", done: true },
        { label: "Labour muster counter-signed", done: true },
        { label: "Rozgar Sevak statement", done: false },
      ],
      state: "done",
    },
    {
      time: "11:15",
      workId: "W-2041",
      site: "Sikidiri distributary, chainage 1.2 km",
      purpose: "Witness sluice sensor install; lining cure check",
      distance: "18 km",
      checklist: [
        { label: "Sensor serial matched to BOQ", done: false },
        { label: "Lining thickness at 3 points", done: false },
        { label: "Farmer group present", done: false },
      ],
      state: "next",
    },
    {
      time: "15:00",
      workId: "W-2038",
      site: "Bero market handpump cluster",
      purpose: "Citizen OTP closure for last 4 handpumps",
      distance: "40 km",
      checklist: [
        { label: "Water sample (field kit)", done: false },
        { label: "Jal Sahiya present", done: false },
        { label: "OTP from 3 user households", done: false },
      ],
      state: "later",
    },
  ] satisfies SiteVisit[],
};

/** The rest of the week, one row per planned visit. */
export const WEEK = [
  {
    day: "Tue 23 Sep",
    workId: "W-2049",
    site: "Pithoria · Tola 4 & 5",
    purpose: "Tap connection spot-check, 20 HH sample",
  },
  {
    day: "Tue 23 Sep",
    workId: "W-2044",
    site: "Sildiri village tank",
    purpose: "Filter media delivery inspection",
  },
  {
    day: "Wed 24 Sep",
    workId: "W-2056",
    site: "Lalkhatanga pump house",
    purpose: "Tank erection — staging weld inspection",
  },
  {
    day: "Thu 25 Sep",
    workId: "W-2041",
    site: "Sikidiri distributary",
    purpose: "Sensor telemetry first-day reading",
  },
  {
    day: "Fri 26 Sep",
    workId: "W-2033",
    site: "Getalsud haat",
    purpose: "Desilting progress measurement",
  },
  {
    day: "Sat 27 Sep",
    workId: "W-2049",
    site: "Pithoria GP office",
    purpose: "Joint review with Mukhiya and JE",
  },
] as const;

/* -------------------------------------------------------------- alerts --- */

export const ALERTS: {
  tone: "danger" | "community" | "navy";
  title: string;
  body: string;
  workId: string;
}[] = [
  {
    tone: "danger",
    title: "W-2044 · update 7 days overdue",
    body: "No field update since 08 Sep. The district dashboard now shows this work amber to the EE.",
    workId: "W-2044",
  },
  {
    tone: "danger",
    title: "W-2033 · update 3 days overdue",
    body: "Agency mobilisation not yet evidenced. Second tranche is blocked until it is.",
    workId: "W-2033",
  },
  {
    tone: "community",
    title: "W-2041 · tranche 3 claim ready",
    body: "Milestone M3 hits 75% once today's install is witnessed. Attach the sensor serials.",
    workId: "W-2041",
  },
];

/* ------------------------------------------------------- work docket --- */

/**
 * Full docket for W-2041. As on the department's problem docket, only the
 * flagship work carries a full bundle; the rest render the same frame with
 * the panels they genuinely have and an honest empty state for the rest.
 */
export const DOCKET: Record<
  string,
  {
    milestones: {
      code: string;
      name: string;
      weight: number;
      state: "done" | "active" | "todo";
      date: string;
    }[];
    tranches: {
      name: string;
      share: number;
      amount: string;
      state: "released" | "claimable" | "locked";
      condition: string;
    }[];
    updates: {
      date: string;
      author: string;
      percent: number;
      note: string;
      photos: number;
      geoVerified: boolean;
    }[];
  }
> = {
  "W-2041": {
    milestones: [
      {
        code: "M1",
        name: "Survey, design and BOQ approval",
        weight: 15,
        state: "done",
        date: "02 Aug 2025",
      },
      {
        code: "M2",
        name: "Canal lining — 1.4 km distributary",
        weight: 35,
        state: "done",
        date: "05 Sep 2025",
      },
      {
        code: "M3",
        name: "Sluice sensor fabrication & install",
        weight: 25,
        state: "active",
        date: "Target 30 Sep",
      },
      {
        code: "M4",
        name: "Telemetry link to district dashboard",
        weight: 15,
        state: "todo",
        date: "Target 25 Oct",
      },
      {
        code: "M5",
        name: "Farmer group handover & sign-off",
        weight: 10,
        state: "todo",
        date: "Target 18 Nov",
      },
    ],
    tranches: [
      {
        name: "Tranche 1 · mobilisation",
        share: 30,
        amount: "₹2,52,000",
        state: "released",
        condition: "BOQ approved",
      },
      {
        name: "Tranche 2 · lining complete",
        share: 38,
        amount: "₹3,19,200",
        state: "released",
        condition: "M2 measured by AE",
      },
      {
        name: "Tranche 3 · sensors live",
        share: 22,
        amount: "₹1,84,800",
        state: "claimable",
        condition: "M3 witnessed + serials",
      },
      {
        name: "Tranche 4 · retention",
        share: 10,
        amount: "₹84,000",
        state: "locked",
        condition: "Citizen sign-off + 90 days",
      },
    ],
    updates: [
      {
        date: "20 Sep 2025",
        author: "Anand Kumar (AE)",
        percent: 68,
        note: "Two of three sluice housings fabricated at Usha Martin Tatisilwai. Third casting passed pressure test; dispatch scheduled for 22 Sep.",
        photos: 4,
        geoVerified: true,
      },
      {
        date: "12 Sep 2025",
        author: "Anand Kumar (AE)",
        percent: 61,
        note: "Lining cure checked at chainage 0.4, 0.9 and 1.3 km — average 78 mm against 75 mm spec. No seepage at the breach point after first release.",
        photos: 6,
        geoVerified: true,
      },
      {
        date: "05 Sep 2025",
        author: "BIT Mesra student cohort",
        percent: 50,
        note: "M2 complete. Measurement book entry submitted for AE countersignature.",
        photos: 9,
        geoVerified: true,
      },
    ],
  },
};
