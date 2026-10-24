/**
 * Government Admin portal fixtures — the `/admin` segment.
 *
 * The state oversight desk sees every district at once and owns the three
 * things no district can do for itself: release state funds above the
 * district ceiling, read the audit trail across departments, and grant roles.
 * Where `/department` is one district's command screen, this is twenty-four
 * of them side by side, so the unit of every table is the district.
 *
 * ISOLATION RULE (see app/(app)/admin/page.tsx): the admin segment imports
 * from here and from the shared gov kit, never from another role segment.
 *
 * See ./data.ts for why these are fixtures.
 */

import type { IconName } from "@/components/icon";
import type { Role } from "@/lib/auth/roles";

export const NAV = [
  { href: "/admin", label: "State Command", icon: "dashboard" },
  { href: "/admin/districts", label: "Districts", icon: "map" },
  { href: "/admin/funding", label: "Funding & Sanctions", icon: "banknote" },
  { href: "/admin/audit", label: "Audit Log", icon: "shield" },
  { href: "/admin/users", label: "Users & Roles", icon: "users" },
] satisfies { href: string; label: string; icon: IconName }[];

export const STATE = {
  name: "Jharkhand",
  desk: "State Oversight Desk",
  department: "Department of Planning & Development",
  districts: 24,
  blocks: 264,
  panchayats: 4_347,
  villages: 32_620,
  asOf: "22 Sep 2025, 09:00 IST",
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
    label: "Demands state-wide",
    value: "1,84,260",
    icon: "clipboard",
    tone: "navy",
    delta: "+8.2% vs last quarter",
    footLabel: "Verified by panchayats",
    footValue: "1,21,904",
  },
  {
    label: "Resolved",
    value: "61",
    unit: "%",
    icon: "check-circle",
    tone: "impact",
    delta: "1,12,940 with citizen sign-off",
    footLabel: "Median days to resolve",
    footValue: "34",
  },
  {
    label: "Funds released",
    value: "₹412.6",
    unit: "Cr",
    icon: "banknote",
    tone: "community",
    delta: "of ₹638.0 Cr allocated FY 25-26",
    footLabel: "Utilised",
    footValue: "₹301.8 Cr",
  },
  {
    label: "SLA breaches",
    value: "1,284",
    icon: "alert-circle",
    tone: "danger",
    delta: "96 critical (P0) open",
    footLabel: "Escalated to state",
    footValue: "38",
  },
];

/* ----------------------------------------------------------- districts --- */

export interface District {
  name: string;
  division: string;
  demands: number;
  resolved: number;
  medianDays: number;
  utilisation: number;
  breaches: number;
  liveProjects: number;
  trend: "up" | "down" | "flat";
}

/**
 * All 24 districts. Kept as one tuple per row so the table can be checked
 * against the source sheet line by line; the objects are built below.
 */
const DISTRICT_ROWS: [
  string,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  District["trend"],
][] = [
  ["Ranchi", "South Chotanagpur", 16_480, 71, 26, 78, 64, 212, "up"],
  ["Dhanbad", "North Chotanagpur", 14_920, 58, 38, 66, 142, 168, "down"],
  ["East Singhbhum", "Kolhan", 12_760, 69, 28, 74, 58, 184, "up"],
  ["Bokaro", "North Chotanagpur", 10_340, 63, 33, 70, 71, 121, "flat"],
  ["Hazaribagh", "North Chotanagpur", 9_870, 66, 31, 72, 49, 117, "up"],
  ["Giridih", "North Chotanagpur", 9_610, 52, 44, 58, 96, 88, "down"],
  ["Deoghar", "Santhal Pargana", 8_420, 60, 36, 64, 54, 92, "flat"],
  ["Palamu", "Palamu", 8_960, 49, 47, 55, 118, 79, "down"],
  ["West Singhbhum", "Kolhan", 8_150, 54, 41, 60, 83, 86, "up"],
  ["Dumka", "Santhal Pargana", 7_380, 57, 39, 61, 61, 74, "up"],
  ["Ramgarh", "North Chotanagpur", 6_240, 65, 30, 71, 33, 68, "flat"],
  ["Gumla", "South Chotanagpur", 6_810, 62, 35, 67, 42, 71, "up"],
  ["Godda", "Santhal Pargana", 6_120, 55, 40, 59, 57, 58, "flat"],
  ["Sahibganj", "Santhal Pargana", 6_530, 47, 49, 52, 88, 52, "down"],
  ["Seraikela-Kharsawan", "Kolhan", 5_980, 64, 32, 69, 36, 66, "up"],
  ["Chatra", "North Chotanagpur", 5_460, 51, 45, 56, 64, 49, "flat"],
  ["Garhwa", "Palamu", 6_090, 46, 51, 50, 92, 47, "down"],
  ["Lohardaga", "South Chotanagpur", 3_870, 67, 29, 73, 18, 41, "up"],
  ["Latehar", "Palamu", 4_620, 48, 48, 53, 59, 38, "flat"],
  ["Koderma", "North Chotanagpur", 3_940, 63, 33, 68, 21, 44, "up"],
  ["Jamtara", "Santhal Pargana", 3_710, 56, 40, 60, 27, 36, "flat"],
  ["Khunti", "South Chotanagpur", 3_980, 68, 27, 75, 19, 52, "up"],
  ["Pakur", "Santhal Pargana", 4_260, 44, 53, 49, 71, 31, "down"],
  ["Simdega", "South Chotanagpur", 3_760, 59, 37, 63, 22, 39, "flat"],
];

export const DISTRICTS: District[] = DISTRICT_ROWS.map(
  ([
    name,
    division,
    demands,
    resolved,
    medianDays,
    utilisation,
    breaches,
    liveProjects,
    trend,
  ]) => ({
    name,
    division,
    demands,
    resolved,
    medianDays,
    utilisation,
    breaches,
    liveProjects,
    trend,
  }),
);

export const DIVISIONS = [
  "South Chotanagpur",
  "North Chotanagpur",
  "Kolhan",
  "Santhal Pargana",
  "Palamu",
] as const;

/* ------------------------------------------------------------- funding --- */

export interface DepartmentFunds {
  department: string;
  allocated: number;
  released: number;
  utilised: number;
}

/** ₹ crore, FY 2025-26 to date. */
export const DEPARTMENT_FUNDS: DepartmentFunds[] = [
  {
    department: "Drinking Water & Sanitation (PHED)",
    allocated: 168.0,
    released: 118.4,
    utilised: 89.2,
  },
  {
    department: "Rural Works Department",
    allocated: 142.5,
    released: 92.1,
    utilised: 70.6,
  },
  {
    department: "Water Resources",
    allocated: 96.0,
    released: 61.8,
    utilised: 41.3,
  },
  {
    department: "Agriculture & Animal Husbandry",
    allocated: 74.2,
    released: 44.0,
    utilised: 30.9,
  },
  {
    department: "Panchayati Raj",
    allocated: 62.8,
    released: 41.6,
    utilised: 33.4,
  },
  {
    department: "Energy (JBVNL)",
    allocated: 51.5,
    released: 31.2,
    utilised: 22.0,
  },
  {
    department: "Health, Medical Education & FW",
    allocated: 43.0,
    released: 23.5,
    utilised: 14.4,
  },
];

/** Share of released funds by source. Four bands, not five: the danger tone
 *  is reserved for alarms, so the smaller state lines share one segment. */
export const SCHEMES: {
  name: string;
  share: number;
  tone: "navy" | "impact" | "community" | "muted";
}[] = [
  { name: "Jal Jeevan Mission", share: 31, tone: "navy" },
  { name: "15th Finance Commission grants", share: 24, tone: "community" },
  { name: "MGNREGA convergence & DMF", share: 33, tone: "muted" },
  { name: "CSR pool (industry)", share: 12, tone: "impact" },
];

/** Monthly state release, ₹ crore, April to September. */
export const RELEASE_SERIES = [38.2, 51.6, 64.0, 72.4, 88.9, 97.5] as const;
export const RELEASE_MONTHS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
] as const;

export interface PendingSanction {
  id: string;
  title: string;
  district: string;
  department: string;
  amount: string;
  age: string;
  recommendedBy: string;
  overCeiling: boolean;
}

/**
 * Sanctions above the ₹25 L district ceiling, which only the state can
 * approve. Below the ceiling the district sanctions on its own and the record
 * only appears here in the audit log.
 */
export const PENDING_SANCTIONS: PendingSanction[] = [
  {
    id: "S-3318",
    title: "Jharia subsidence zone — piped supply to 14 relocated tolas",
    district: "Dhanbad",
    department: "PHED",
    amount: "₹2.84 Cr",
    age: "9 days",
    recommendedBy: "DC Dhanbad",
    overCeiling: true,
  },
  {
    id: "S-3306",
    title: "Koel river check-dam series, 6 structures",
    district: "Palamu",
    department: "Water Resources",
    amount: "₹1.62 Cr",
    age: "6 days",
    recommendedBy: "EE Water Resources, Daltonganj",
    overCeiling: true,
  },
  {
    id: "S-3299",
    title: "Solar mini-grid for 9 forest villages",
    district: "Latehar",
    department: "Energy (JBVNL)",
    amount: "₹98.0 L",
    age: "4 days",
    recommendedBy: "DDC Latehar",
    overCeiling: true,
  },
  {
    id: "S-3291",
    title: "PHC cold-chain retrofit across Santhal Pargana",
    district: "Dumka",
    department: "Health",
    amount: "₹46.5 L",
    age: "2 days",
    recommendedBy: "Civil Surgeon Dumka",
    overCeiling: true,
  },
];

/* --------------------------------------------------------- escalations --- */

export const ESCALATIONS: {
  district: string;
  title: string;
  body: string;
  tone: "danger" | "community" | "navy";
}[] = [
  {
    district: "Dhanbad",
    title: "142 SLA breaches, 31 critical",
    body: "Concentrated in Jharia and Baghmara blocks. PHED and Rural Works both cite the same land-acquisition hold.",
    tone: "danger",
  },
  {
    district: "Garhwa",
    title: "Resolution rate below 50% for 3 quarters",
    body: "Panchayat verification turnaround is 9 days against a 72-hour norm. Block officers short-staffed in 4 of 20 blocks.",
    tone: "community",
  },
  {
    district: "Pakur",
    title: "Fund utilisation 49%",
    body: "₹6.1 Cr released in Q1 still unspent. Unspent balance lapses at year end unless re-appropriated.",
    tone: "navy",
  },
];

/* ----------------------------------------------------------- audit log --- */

export interface AuditEvent {
  at: string;
  actor: string;
  role: Role;
  action: string;
  record: string;
  scope: string;
  /** First eight hex of the chained SHA-256 — enough to quote on paper. */
  hash: string;
  flagged?: string;
}

/**
 * The append-only event stream. Each event's hash covers the previous one, so
 * a deleted or edited row breaks the chain from that point on; the full hash
 * and its predecessor are on the API, the prefix is what an auditor quotes.
 */
export const AUDIT_EVENTS: AuditEvent[] = [
  {
    at: "22 Sep 09:12",
    actor: "Anand Kumar",
    role: "officer",
    action: "field_update.posted",
    record: "W-2041",
    scope: "Ranchi · Angara",
    hash: "9f3a61c2",
  },
  {
    at: "22 Sep 08:57",
    actor: "Sunita Devi",
    role: "panchayat",
    action: "problem.verified",
    record: "P-1029",
    scope: "Ranchi · Getalsud GP",
    hash: "41be07d9",
  },
  {
    at: "21 Sep 18:40",
    actor: "Jharkhand PHED",
    role: "department",
    action: "tranche.released",
    record: "W-2049 · T3",
    scope: "Ranchi · Kanke",
    hash: "c07d55a1",
    flagged: "Released 2 days before milestone M3 was witnessed",
  },
  {
    at: "21 Sep 17:05",
    actor: "Usha Martin Ltd.",
    role: "industry",
    action: "sponsorship.pledged",
    record: "W-2041",
    scope: "CSR · ₹1.84 L",
    hash: "e2194b0f",
  },
  {
    at: "21 Sep 15:22",
    actor: "R. Hembrom",
    role: "officer",
    action: "field_update.posted",
    record: "W-1987",
    scope: "Dumka · Jama",
    hash: "5ad8e3c4",
    flagged: "GPS fix 11.4 km outside work boundary",
  },
  {
    at: "21 Sep 12:48",
    actor: "Meera Singh",
    role: "gov_admin",
    action: "sanction.approved",
    record: "S-3284",
    scope: "Bokaro · ₹1.12 Cr",
    hash: "7713fa20",
  },
  {
    at: "21 Sep 11:30",
    actor: "Platform Admin",
    role: "super_admin",
    action: "role.assigned",
    record: "u-officer-214",
    scope: "officer · Garhwa",
    hash: "b94c0e6d",
  },
  {
    at: "20 Sep 19:02",
    actor: "S. Mahato",
    role: "department",
    action: "problem.verified",
    record: "P-2211",
    scope: "Giridih · Bengabad",
    hash: "0c5e9a3b",
    flagged: "Same account sanctioned this docket on 18 Sep",
  },
  {
    at: "20 Sep 16:14",
    actor: "Dr. Rakesh Mahto",
    role: "faculty",
    action: "project.reviewed",
    record: "PRJ-0412",
    scope: "Ranchi University",
    hash: "d61f2287",
  },
  {
    at: "20 Sep 10:09",
    actor: "Aisha Patel",
    role: "student",
    action: "project.created",
    record: "PRJ-0431",
    scope: "Ranchi University",
    hash: "38a0bb14",
  },
];

/* --------------------------------------------------------------- users --- */

export const ROLE_COUNTS: {
  role: Role;
  accounts: number;
  active30d: number;
}[] = [
  { role: "student", accounts: 18_420, active30d: 11_260 },
  { role: "faculty", accounts: 1_284, active30d: 862 },
  { role: "institute", accounts: 96, active30d: 71 },
  { role: "panchayat", accounts: 4_212, active30d: 3_418 },
  { role: "department", accounts: 312, active30d: 287 },
  { role: "officer", accounts: 2_046, active30d: 1_734 },
  { role: "industry", accounts: 148, active30d: 92 },
  { role: "gov_admin", accounts: 18, active30d: 17 },
  { role: "super_admin", accounts: 4, active30d: 4 },
];

export const ACCESS_REQUESTS: {
  name: string;
  email: string;
  requested: Role;
  scope: string;
  sponsor: string;
  age: string;
}[] = [
  {
    name: "Priya Kujur",
    email: "priya@officer.janmaang.in",
    requested: "officer",
    scope: "PHED · Gumla",
    sponsor: "EE PHED Gumla",
    age: "1 day",
  },
  {
    name: "Tata Steel Foundation",
    email: "csr.tsf@industry.janmaang.in",
    requested: "industry",
    scope: "CSR · East Singhbhum",
    sponsor: "DC East Singhbhum",
    age: "3 days",
  },
  {
    name: "Ravi Soren",
    email: "ravi@dept.janmaang.in",
    requested: "department",
    scope: "Rural Works · Dumka",
    sponsor: "Secretary, RWD",
    age: "4 days",
  },
  {
    name: "NIT Jamshedpur",
    email: "rnd.nitjsr@institute.janmaang.in",
    requested: "institute",
    scope: "East Singhbhum",
    sponsor: "Higher Education Dept",
    age: "6 days",
  },
];

/**
 * The role × permission matrix.
 *
 * MIRRORS services/api/app/core/permissions.py `ROLE_PERMISSIONS`, and
 * admin.test.ts parses that file to fail the build if the two drift. This copy
 * is for display only — the API is the enforcement point.
 */
export const PERMISSIONS = [
  "problem:create",
  "problem:read",
  "problem:moderate",
  "problem:verify",
  "statement:create",
  "statement:publish",
  "project:create",
  "project:review",
  "project:approve",
  "team:manage",
  "buildfolio:endorse",
  "funding:allocate",
  "funding:disburse",
  "funding:sponsor",
  "analytics:view",
  "analytics:view_all",
  "user:manage",
  "role:assign",
  "audit:read",
  "system:configure",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  citizen: ["problem:create", "problem:read", "problem:verify"],
  student: ["problem:read", "project:create", "team:manage"],
  faculty: [
    "problem:read",
    "project:review",
    "buildfolio:endorse",
    "analytics:view",
  ],
  institute: [
    "problem:read",
    "project:review",
    "analytics:view",
    "user:manage",
  ],
  panchayat: [
    "problem:read",
    "problem:moderate",
    "problem:verify",
    "analytics:view",
  ],
  department: [
    "problem:read",
    "statement:create",
    "statement:publish",
    "project:approve",
    "funding:allocate",
    "analytics:view",
  ],
  officer: ["problem:read", "problem:moderate", "problem:verify"],
  industry: ["problem:read", "funding:sponsor", "analytics:view"],
  gov_admin: [
    "problem:read",
    "problem:moderate",
    "statement:publish",
    "funding:allocate",
    "funding:disburse",
    "analytics:view_all",
    "user:manage",
    "audit:read",
  ],
  super_admin: PERMISSIONS,
};
