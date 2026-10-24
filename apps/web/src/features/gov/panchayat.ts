/**
 * Gram Panchayat portal fixtures — the `/panchayat` segment.
 *
 * The panchayat sees the same records as `/department` but one tier down and
 * with different verbs: it *verifies* and *escalates*, it does not sanction.
 * The reference screens are district-scale, so the layouts carry over while
 * the numbers shrink from 18 blocks to 11 wards — a ward secretary reading a
 * "12,486 demands" tile would rightly ignore the whole screen.
 *
 * See ./data.ts for why these are fixtures.
 */

import type { IconName } from "@/components/icon";
import type { Severity } from "./data";

export const NAV = [
  { href: "/panchayat", label: "Panchayat Home", icon: "dashboard" },
  { href: "/panchayat/demands", label: "Demand Register", icon: "clipboard" },
  {
    href: "/panchayat/verify",
    label: "Verification Queue",
    icon: "check-circle",
  },
  { href: "/panchayat/works", label: "Sanctioned Works", icon: "landmark" },
] satisfies { href: string; label: string; icon: IconName }[];

export const MUKHIYA = {
  name: "Sunita Devi",
  designation: "Mukhiya · Getalsud Gram Panchayat",
  block: "Angara Block, Ranchi",
  sabha: "Gram Sabha quorum met · 18 Sep 2025",
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
    label: "Open demands",
    value: "48",
    icon: "clipboard",
    tone: "navy",
    delta: "+6 this week",
    footLabel: "Raised in last 24h",
    footValue: "3",
  },
  {
    label: "Awaiting verification",
    value: "12",
    icon: "eye",
    tone: "danger",
    delta: "4 past the 72h window",
    footLabel: "Oldest pending",
    footValue: "6 days",
  },
  {
    label: "Escalated to district",
    value: "19",
    icon: "arrow-up-right",
    tone: "community",
    delta: "14 sanctioned",
    footLabel: "Returned for detail",
    footValue: "2",
  },
  {
    label: "Works completed",
    value: "27",
    icon: "check-circle",
    tone: "impact",
    delta: "This financial year",
    footLabel: "Citizen sign-off rate",
    footValue: "96%",
  },
];

/** Ward-level demand load, for the panchayat's own hotspot rail. */
export const WARDS = [
  { name: "Ward 3 · Getalsud Tola", open: 11, share: 100, households: 312 },
  { name: "Ward 7 · Sikidiri", open: 9, share: 82, households: 268 },
  { name: "Ward 1 · Hesalong", open: 7, share: 64, households: 240 },
  { name: "Ward 9 · Chutupalu", open: 5, share: 45, households: 195 },
  { name: "Ward 5 · Bariatu Khurd", open: 3, share: 27, households: 178 },
];

export interface Demand {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  ward: string;
  reporter: string;
  reports: number;
  raised: string;
  /** Where the demand currently sits in the eight-stage lifecycle. */
  state:
    | "Awaiting verification"
    | "Verified — escalated"
    | "Sanctioned"
    | "Work in progress"
    | "Closed";
}

export const DEMANDS: Demand[] = [
  {
    id: "P-1024",
    title: "Sikidiri canal distributary breach flooding farmland",
    category: "Agriculture & Irrigation",
    severity: "critical",
    ward: "Ward 7 · Sikidiri",
    reporter: "Mukhiya Vitthal Oraon",
    reports: 47,
    raised: "12 Sep 2025",
    state: "Verified — escalated",
  },
  {
    id: "P-1031",
    title: "Handpump platform collapsed near primary school",
    category: "Water & Sanitation",
    severity: "high",
    ward: "Ward 3 · Getalsud Tola",
    reporter: "Ward member Phulmani Devi",
    reports: 14,
    raised: "16 Sep 2025",
    state: "Awaiting verification",
  },
  {
    id: "P-1029",
    title: "Street light outage on the Anganwadi approach lane",
    category: "Power & Energy",
    severity: "medium",
    ward: "Ward 1 · Hesalong",
    reporter: "Citizen app · 9 reports",
    reports: 9,
    raised: "15 Sep 2025",
    state: "Awaiting verification",
  },
  {
    id: "P-1022",
    title: "Drain blockage causing standing water near the haat",
    category: "Public Health & Safety",
    severity: "high",
    ward: "Ward 3 · Getalsud Tola",
    reporter: "Rozgar Sevak",
    reports: 21,
    raised: "11 Sep 2025",
    state: "Sanctioned",
  },
  {
    id: "P-1015",
    title: "Culvert railing missing on the Chutupalu link road",
    category: "Roads & Infrastructure",
    severity: "medium",
    ward: "Ward 9 · Chutupalu",
    reporter: "Ward member Birsa Munda",
    reports: 8,
    raised: "10 Sep 2025",
    state: "Work in progress",
  },
  {
    id: "P-1004",
    title: "Community toilet block water connection dry",
    category: "Water & Sanitation",
    severity: "routine",
    ward: "Ward 5 · Bariatu Khurd",
    reporter: "Jal Sahiya Kunti Devi",
    reports: 6,
    raised: "05 Sep 2025",
    state: "Closed",
  },
];

/**
 * The verification queue. Each entry is a demand the AI has clustered and the
 * panchayat must confirm on the ground before the district will look at it —
 * this is stage 3 of the lifecycle, and it is the panchayat's whole job.
 */
export interface VerificationItem {
  id: string;
  title: string;
  severity: Severity;
  ward: string;
  reports: number;
  confidence: number;
  age: string;
  overdue: boolean;
  checks: { label: string; done: boolean }[];
  evidence: number;
  voiceNote: string;
}

export const QUEUE: VerificationItem[] = [
  {
    id: "P-1031",
    title: "Handpump platform collapsed near primary school",
    severity: "high",
    ward: "Ward 3 · Getalsud Tola",
    reports: 14,
    confidence: 88,
    age: "2 days",
    overdue: false,
    checks: [
      { label: "Site photograph attached", done: true },
      { label: "GPS inside panchayat boundary", done: true },
      { label: "Ward member counter-signature", done: false },
      { label: "Duplicate of an open work", done: false },
    ],
    evidence: 3,
    voiceNote: "चापाकल का चबूतरा टूट गया है, बच्चे वहीं से पानी लेते हैं।",
  },
  {
    id: "P-1029",
    title: "Street light outage on the Anganwadi approach lane",
    severity: "medium",
    ward: "Ward 1 · Hesalong",
    reports: 9,
    confidence: 84,
    age: "3 days",
    overdue: false,
    checks: [
      { label: "Site photograph attached", done: true },
      { label: "GPS inside panchayat boundary", done: true },
      { label: "Ward member counter-signature", done: true },
      { label: "Duplicate of an open work", done: false },
    ],
    evidence: 2,
    voiceNote: "आंगनबाड़ी जाने वाली गली में तीन महीने से लाइट नहीं जल रही।",
  },
  {
    id: "P-1009",
    title: "Overhead tank leakage wasting the morning supply",
    severity: "high",
    ward: "Ward 7 · Sikidiri",
    reports: 17,
    confidence: 91,
    age: "6 days",
    overdue: true,
    checks: [
      { label: "Site photograph attached", done: true },
      { label: "GPS inside panchayat boundary", done: false },
      { label: "Ward member counter-signature", done: false },
      { label: "Duplicate of an open work", done: false },
    ],
    evidence: 5,
    voiceNote: "टंकी से लगातार पानी बह रहा है, सुबह की सप्लाई आधी हो गई है।",
  },
];

/** Works sanctioned for this panchayat, with the money actually released. */
export interface Work {
  id: string;
  title: string;
  demandId: string;
  scheme: string;
  ward: string;
  sanctioned: string;
  released: string;
  percent: number;
  stage: number;
  stageLabel: string;
  agency: string;
  due: string;
}

export const WORKS: Work[] = [
  {
    id: "W-2041",
    title: "Smart sluice sensor & canal lining repair",
    demandId: "P-1024",
    scheme: "District Innovation Cell · Water Resources",
    ward: "Ward 7 · Sikidiri",
    sanctioned: "₹8,40,000",
    released: "₹5,71,200",
    percent: 68,
    stage: 6,
    stageLabel: "Prototype fabrication",
    agency: "BIT Mesra + Usha Martin Ltd.",
    due: "18 Nov 2025",
  },
  {
    id: "W-2033",
    title: "Haat drain desilting & covered channel",
    demandId: "P-1022",
    scheme: "15th Finance Commission (tied)",
    ward: "Ward 3 · Getalsud Tola",
    sanctioned: "₹2,10,000",
    released: "₹63,000",
    percent: 30,
    stage: 4,
    stageLabel: "Awaiting agency mobilisation",
    agency: "Panchayat Rozgar Sevak",
    due: "02 Dec 2025",
  },
  {
    id: "W-2028",
    title: "Chutupalu link road culvert railing",
    demandId: "P-1015",
    scheme: "MGNREGA convergence",
    ward: "Ward 9 · Chutupalu",
    sanctioned: "₹1,45,000",
    released: "₹1,45,000",
    percent: 85,
    stage: 7,
    stageLabel: "Field execution",
    agency: "Rural Works Dept · Angara",
    due: "28 Oct 2025",
  },
  {
    id: "W-2011",
    title: "Community toilet water connection restoration",
    demandId: "P-1004",
    scheme: "Swachh Bharat Mission (G)",
    ward: "Ward 5 · Bariatu Khurd",
    sanctioned: "₹64,000",
    released: "₹64,000",
    percent: 100,
    stage: 8,
    stageLabel: "Citizen sign-off complete",
    agency: "PHED · Angara sub-division",
    due: "Closed 30 Aug 2025",
  },
];

/** Fund position for the panchayat's own budget line. */
export const FUNDS = {
  allocated: "₹42.60 L",
  released: "₹28.14 L",
  utilised: "₹21.90 L",
  utilisedPercent: 51,
  unspentDays: "Unspent balance ages out in 46 days",
} as const;

/** The Gram Sabha calendar strip on the panchayat home screen. */
export const SABHA = [
  {
    date: "18 Sep 2025",
    title: "Demand prioritisation sabha",
    note: "Quorum met · 142 present",
    state: "done",
  },
  {
    date: "02 Oct 2025",
    title: "Gram Sabha (statutory)",
    note: "Agenda: works audit + new demands",
    state: "next",
  },
  {
    date: "14 Oct 2025",
    title: "Social audit — W-2028",
    note: "Rural Works Dept to present",
    state: "upcoming",
  },
] as const;
