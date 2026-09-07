/**
 * Shared vocabulary for the two government portals.
 *
 * `/panchayat` and `/department` are one pipeline seen from two rungs of the
 * administrative ladder: a ward secretary verifying a demand and a district
 * officer sanctioning it are looking at the same record with different powers
 * over it. Severity, lifecycle stages and partner vocabulary therefore live
 * here instead of being spelled twice, and the portal files import them.
 *
 * Transcribed from the Stitch "Civic Command" reference screens — see
 * docs/STITCH_INVENTORY.md. The reference is a Maharashtra district portal;
 * the structure carries over verbatim, the place names do not, so every
 * fixture below is Jharkhand and every colour comes from @janmaang/tokens
 * rather than the reference's own palette.
 *
 * All values are presentation fixtures. They are the shape the API will
 * return, so screens can be written against them today and re-pointed at
 * services/api/app/modules/{problems,projects,analytics} when it lands.
 */

import type { IconName } from "@/components/icon";

/* ------------------------------------------------------------ severity --- */

/**
 * Statutory priority bands. `code` is what appears on paper dockets and in
 * the SLA rules, `label` is what appears on screen.
 */
export type Severity = "critical" | "high" | "medium" | "routine";

export const SEVERITY: Record<
  Severity,
  { label: string; code: string; sla: string }
> = {
  critical: { label: "Critical", code: "P0", sla: "4 hours" },
  high: { label: "High", code: "P1", sla: "24 hours" },
  medium: { label: "Medium", code: "P2", sla: "7 days" },
  routine: { label: "Routine", code: "P3", sla: "30 days" },
};

export const SEVERITY_ORDER: Severity[] = [
  "critical",
  "high",
  "medium",
  "routine",
];

/* ----------------------------------------------------------- lifecycle --- */

/**
 * The eight stages a demand passes through from a citizen's voice note to a
 * signed-off asset. Panchayat owns stages 1-3, the department owns 4-8, which
 * is why both portals render the same track and highlight different segments.
 */
export const LIFECYCLE = [
  { n: 1, name: "Citizen Demand", owner: "Citizen" },
  { n: 2, name: "AI Deduplication", owner: "Platform" },
  { n: 3, name: "Panchayat Verification", owner: "Gram Panchayat" },
  { n: 4, name: "District Sanction", owner: "Department" },
  { n: 5, name: "Cohort Allotted", owner: "University" },
  { n: 6, name: "CSR Pledged", owner: "Industry" },
  { n: 7, name: "Field Execution", owner: "Officer" },
  { n: 8, name: "Citizen Sign-off", owner: "Citizen" },
] as const;

/* -------------------------------------------------------------- context -- */

/** Who the portal thinks it is serving. Real deployments read this from the
 *  officer's posting, not a constant. */
export const DISTRICT = {
  name: "Ranchi",
  state: "Jharkhand",
  code: "JH-RAN",
  blocks: 18,
  panchayats: 305,
} as const;

export const BLOCK = {
  name: "Angara",
  panchayat: "Getalsud Gram Panchayat",
  district: "Ranchi",
  wards: 11,
  households: 2_840,
} as const;

/**
 * The quad-helix pipeline, the spine both portals are built around.
 *
 * Shared rather than duplicated because the two portals sit at *different*
 * nodes of the same chain: the panchayat owns node 03 and the department owns
 * node 04. `PipelineStrip` takes the node to mark, so neither copy of the list
 * can drift from the other.
 */
export const PIPELINE: {
  n: string;
  title: string;
  body: string;
  icon: IconName;
  statLabel: string;
  statValue: string;
}[] = [
  {
    n: "Node 01",
    title: "Citizen Intake",
    body: "Voice note in Hindi, Santali or Nagpuri, WhatsApp media, or portal geo-photo.",
    icon: "message",
    statLabel: "Sub-second GPS",
    statValue: "12.4k inputs",
  },
  {
    n: "Node 02",
    title: "AI Geo-Clustering",
    body: "Deduplication vectors merge hyper-local duplicate complaints into unified issues.",
    icon: "sparkles",
    statLabel: "DBSCAN + NLP",
    statValue: "94.8% match",
  },
  {
    n: "Node 03",
    title: "Panchayat Verification",
    body: "Ward secretary confirms the demand on the ground and attaches field evidence.",
    icon: "landmark",
    statLabel: "Avg turnaround",
    statValue: "305 GPs",
  },
  {
    n: "Node 04",
    title: "District Sanction",
    body: "Executive Engineer applies statutory sanction and releases the resource greenlight.",
    icon: "shield",
    statLabel: "Instant sign-off",
    statValue: "EE review",
  },
  {
    n: "Node 05",
    title: "University R&D",
    body: "Auto-assigned to regional college engineering departments for capstone resolution.",
    icon: "graduation",
    statLabel: "BIT / RU / NIT",
    statValue: "72 live labs",
  },
  {
    n: "Node 06",
    title: "Ground Audit",
    body: "Revenue officer drone check plus citizen satisfaction OTP closure.",
    icon: "check-circle",
    statLabel: "Immutable log",
    statValue: "4.8 / 5",
  },
];

/* ------------------------------------------------------------- domains --- */

/** Problem categories, matching the department that owns each one. */
export const DOMAINS: {
  key: string;
  label: string;
  icon: IconName;
  department: string;
}[] = [
  {
    key: "water",
    label: "Water & Sanitation",
    icon: "droplet",
    department: "PHED",
  },
  {
    key: "agri",
    label: "Agriculture & Irrigation",
    icon: "leaf",
    department: "Agriculture Dept",
  },
  {
    key: "roads",
    label: "Roads & Infrastructure",
    icon: "map",
    department: "Rural Works Dept",
  },
  { key: "power", label: "Power & Energy", icon: "zap", department: "JBVNL" },
  {
    key: "health",
    label: "Public Health & Safety",
    icon: "shield",
    department: "Health Dept",
  },
];

/* ------------------------------------------------------------- helpers --- */

/**
 * Time-of-day greeting for the two portal home screens.
 *
 * Computed on the server against IST rather than the request's own clock, so a
 * server in another region still greets an officer in Ranchi correctly. Swap
 * for the officer's posting timezone the day this platform runs outside one
 * state — not for a client-side `new Date()`, which would make the whole
 * banner a client component for one word.
 */
export function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Indian digit grouping, used by every tabular readout in both portals. */
export function inr(value: number): string {
  return value.toLocaleString("en-IN");
}
