# JanMaang — Stitch Design Inventory (Phase 1)

Source: Stitch project `projects/5610348960166970948` — "JanMaang Civic Intelligence System"
Design systems attached: `JanMaang Civic Intelligence System`, `Asymmetric Editorial Split`

## Product

JanMaang is a civic demand-to-budget platform. A citizen reports a local need (by voice,
text, photo or location). AI structures the report, clusters it with similar reports,
ranks it against other demands, government funds the prioritised demands, and citizens
verify the completed work.

Pipeline: **Speak → Analyze → Cluster → Prioritise → Fund → Execute → Citizen Verify**

## Screen inventory

| # | Stitch screen | Flutter route | Notes |
|---|---|---|---|
| 1 | JanMaang — Mobile Landing Page | `/onboarding` | Hero "Civic action starts here.", 4-step stepper, pilot-impact card, recently-fixed cards |
| 2 | Citizen Login — JanMaang | `/login` | +91 mobile input, Aadhaar "High-Trust Verification" toggle, Send OTP |
| 3 | (derived) OTP verification | `/login/otp` | Not in Stitch; built from login design language |
| 4 | Citizen Home — JanMaang | `/home` | Namaste header, location chip, hero report card, Community Pulse 2×2 stats, Near You map + demand cards |
| 5 | Report a Need — Voice Interaction | `/report` | Mic FAB w/ pulse rings, live transcript card, AI extraction bento (need/location/severity), location action card, "finding similar requests" loader |
| 6 | You Are Not Alone — Demand Cluster | `/cluster/:id` | Cluster ID chip, "41 people reported the same issue", map, 4,281 affected, analysis list, Join / Different issue |
| 7 | Track Demand — Transparency Flow | `/demand/:id` | Rank chip + ID, "Why is this ranked #2?" 5 metric bars, Question this ranking, 7-step status timeline |
| 8 | Citizen Portal & Tracking | `/track` | My Demands list w/ status chips, demand detail, verification request card |
| 9 | Citizen Verification — Closing the Loop | `/verify/:id` | Before photo vs current upload, Yes fixed / No still broken, info note |
| 10 | Field Verification Tool | `/field-verification/:id` | Assigned project, objective, 3-item checklist, geotagged evidence capture, submit |
| 11 | Citizen Portal — Editorial Fidelity | — | Editorial variant; design language folded into shared components |
| 12 | (derived) Public Ledger | `/ledger` | Required by the Stitch bottom-nav 4th tab; built from Public Ledger / transparency language |

Desktop-only admin console (side nav: Dashboard, Priority Queue, Funding Console, Geographic
Map, Public Ledger) is out of scope for the mobile app; its Priority-Engine concepts surface
in the citizen "Why is this ranked?" screen.

## Navigation

Bottom navigation (mobile, from Stitch): **Home · Track · Report (elevated mic) · Ledger**
- Report is a raised primary-coloured circular button overlapping the bar (`-top-6`, 4px surface border).
- Active tab: `primary-container` pill with `on-primary-container` text, filled icon.
- Inactive: `on-surface-variant`, outlined icon.
- Login / OTP / Report flow / Verification suppress the bottom nav (transactional intent).

## Design system (verbatim from Stitch theme)

### Colour roles (light)
| Role | Hex |
|---|---|
| primary | `#00152a` |
| on-primary | `#ffffff` |
| primary-container | `#102a43` |
| on-primary-container | `#7a92b0` |
| primary-fixed | `#d1e4ff` |
| secondary | `#0057c2` |
| secondary-container | `#246fe7` |
| on-secondary-container | `#fefcff` |
| secondary-fixed | `#d9e2ff` |
| on-secondary-fixed | `#001a43` |
| tertiary | `#001816` |
| tertiary-container | `#002f2b` |
| on-tertiary-container | `#469e95` |
| tertiary-fixed | `#9cf2e8` |
| on-tertiary-fixed | `#00201d` |
| error | `#ba1a1a` |
| error-container | `#ffdad6` |
| on-error-container | `#93000a` |
| background / surface | `#f6fafe` |
| on-surface | `#171c1f` |
| on-surface-variant | `#43474d` |
| surface-container-lowest | `#ffffff` |
| surface-container-low | `#f0f4f8` |
| surface-container | `#eaeef2` |
| surface-container-high | `#e4e9ed` |
| surface-container-highest | `#dfe3e7` |
| surface-variant | `#dfe3e7` |
| outline | `#74777e` |
| outline-variant | `#c3c6ce` |
| inverse-surface | `#2c3134` |
| inverse-on-surface | `#edf1f5` |
| inverse-primary | `#b0c9e8` |

### Typography (DM Sans display/headline, Inter body/label)
| Token | Family | Size | Line | Weight | Tracking |
|---|---|---|---|---|---|
| display-lg | DM Sans | 48 | 56 | 700 | -0.02em |
| display-lg-mobile | DM Sans | 32 | 40 | 700 | -0.02em |
| headline-md | DM Sans | 30 | 38 | 600 | — |
| headline-sm | DM Sans | 24 | 32 | 600 | — |
| title-lg | Inter | 20 | 28 | 600 | — |
| body-lg | Inter | 18 | 28 | 400 | — |
| body-md | Inter | 16 | 24 | 400 | — |
| body-sm | Inter | 14 | 20 | 400 | — |
| label-md | Inter | 12 | 16 | 600 | 0.05em |
| tabular-nums | Inter | 14 | 20 | 500 | — (tnum on) |

### Spacing (4px baseline)
`xs 4 · sm 8 · md 16 · lg 24 · xl 48 · gutter 24 · margin-mobile 16 · margin-desktop 32 · container-max 1280`

### Shape
`sm 2 · DEFAULT 4 · lg 4 · xl 8 · full 12` (Stitch tailwind radii) — institutional, no pills for
primary UI. Cards 12px, buttons/inputs 8px, chips/badges 4px. Circles only for avatars and status pips.

### Elevation
- L0 background flat `#f6fafe`
- L1 cards: `surface-container-lowest` + 1px `outline-variant`, **no shadow**
- L2 interactive: y2 blur4 @4%
- L3 modal: y8 blur16 @8% + 8px backdrop blur

### Components observed
- **Buttons** — primary: `primary` bg / `on-primary` text, 8px radius, `active:scale-0.98`.
  Secondary: 1px outline + surface bg. Ghost: text only.
- **Cards** — white, 1px `outline-variant`, 12px radius.
- **Status chips** — 4px radius, `label-md`. tertiary/teal = Funded, amber/warning = In Review,
  primary/navy = Prioritised, `surface-variant` = Pending Review, `error-container` = High Priority.
- **Rank badge** — `#1` uses solid `primary` + star icon; others `secondary-container` + trending_up.
- **Metric bars** — label + tabular number right-aligned, thin track with `primary` fill.
- **Timeline** — completed = filled check circle, active = pulsing ring, future = hollow dot; vertical connector.
- **Stat tile** — big `headline-md` tabular number + `label-md` caption.
- **Mic FAB** — 96px `primary` circle, shadow `0 8px 16px rgba(0,21,42,.15)`, two pulse rings at `primary-fixed` 50%/30%.
- **Icons** — Material Symbols Outlined; `FILL 1` for active/selected states.

### States seen in the designs
- Loading: spinning `sync` icon + "Finding similar requests in this area…"; button swaps to
  `progress_activity` spinner + "Sending…".
- Empty: dashed-outline photo dropzone ("Tap to Capture Evidence").
- Error: `error-container` / `on-error-container` severity badge.
- Active/selected: filled icon + `primary-container` pill.

---

# CivicBridge Command Portal (Phase 2 — government web)

Source: Stitch export `stitch_civicbridge_command_portal.zip`, design system **Civic Command**
(`civic_command/DESIGN.md`). A separate Stitch project from the citizen app above: desktop,
administrative, and built around a district command rail rather than a mobile bottom nav.

The export is a **Maharashtra / Pune** district portal. The *structure* is what was adopted —
layout, panel hierarchy, density, the quad-helix pipeline — while every place name, institution
and figure was rewritten for Jharkhand, because a Ranchi officer reading Pune taluka names would
rightly ignore the screen. See `apps/web/src/features/gov/data.ts` for the shared vocabulary.

## Screen mapping

| # | Stitch screen | Web route | Notes |
|---|---|---|---|
| 1 | CivicBridge Command Dashboard | `/department` | 6 KPI tiles, quad-helix pipeline strip, priority grievance table, live officer triage docket, cluster strip |
| 2 | AI Problem Clusters & Geo Intelligence | `/department/clusters` | Beacon map, actionable-cluster rail with partner/sponsor matching, hotspot blocks, CSR pot |
| 3 | Problem #P-1024 Detail & Evidence | `/department/problems/[id]` | Field evidence, voice intelligence (Hindi original + English synthesis), GIS radar, AI synthesis, academic + industry partners, sanction desk |
| 4 | Project Tracking & Resolution Lifecycle | `/department/projects` | 8-stage lifecycle track, live telemetry chart, tranche approval, other active projects |
| 5 | Analytics & Ecosystem Intelligence | `/department/analytics` | Category donut, AI funnel, SLA severity matrix, block efficiency, university leaderboard, CSR allocation |
| — | (derived) | `/department/problems` | Full register; the reference only ever shows the table embedded in screen 1 |

## Gram Panchayat portal (derived)

Not in the export. The reference is district-scale throughout, and a ward secretary has neither
the powers nor the numbers of a district officer, so `/panchayat` reuses the same components at
village scale with the panchayat's own verbs — **verify** and **escalate**, never *sanction*.

| Route | Purpose |
|---|---|
| `/panchayat` | Ward KPIs, verification queue preview, ward load, fund position, Gram Sabha calendar |
| `/panchayat/demands` | Full demand register across all lifecycle stages |
| `/panchayat/verify` | Stage 3 of the lifecycle — the panchayat's whole statutory job: a checklist and two outcomes per demand |
| `/panchayat/works` | Sanctioned works, stage rail, fund flow released against each |

## Design-token divergence

`civic_command/DESIGN.md` ships its own Material-style palette (navy `#0F2042`, teal `#0D9488`,
emerald `#10B981`, slate neutrals). It was **not** imported. `@janmaang/tokens` is generated from
one JSON source shared with the Flutter app, and forking a second palette into the web build
would break the guarantee that the map legend and wordmark are the same colours on both. The
reference's roles map onto existing tokens closely enough:

| Civic Command role | JanMaang token |
|---|---|
| Primary navy `#0F2042` | `--color-navy` / `--color-primary` |
| Resolution emerald `#10B981` | `--color-impact` |
| High severity `#DC2626` | `--color-danger` |
| Medium severity `#D97706` | `--color-community` |
| Divider `#E2E8F0` | `--color-line` |

What *was* taken verbatim: tabular numerics on every figure, uppercase micro-labels above large
readouts, hairline rules over shadows, and strictly rectangular status chips (4px, never pills).
Those live in `apps/web/src/features/gov/components.tsx`, deliberately separate from the roomier
citizen/student kit in `src/components/ui.tsx`.

---

# Industry Collaboration Portal (Phase 2 — industry/CSR web)

Source: Stitch export `stitch_remix_of_remix_of_janmaang_industry_collaboration_portal.zip`. A
remix of the Command Portal above, so it inherits the same density and panel hierarchy and is
built with the same `features/gov/components.tsx` kit — but from the sponsor's chair rather than
the sanction desk.

Same transposition rule as the Command Portal: the export is a **Maharashtra / Pune** portal
whose partner is "AquaTech Solutions" and whose lab is MPKV Rahuri. The structure carried over
verbatim; the partner became **Usha Martin Ltd.** and the lab **BIT Mesra**, because those are
already who `/department` names as the sponsor and cohort on P-1024 / PRJ-204. Where a screen
shows that docket, the record is imported from `features/gov` rather than restated — the two
portals must not disagree about a real sanction order.

## Screen mapping

| # | Stitch view | Web route | Notes |
|---|---|---|---|
| 1 | Dashboard | `/industry` | Partner banner + CSR pool, five-link civic chain with "you are here", 6 KPI tiles, top-AI-match hero with confidence breakdown, ranked opportunity queue |
| 2 | Discover Projects | `/industry/discover` | Marketplace cards — severity, verification, match meter, citizens impacted, funding gap |
| 3 | Project Detail | `/industry/projects/[id]` | Government rationale, assigned cohort, audit chain, stakeholder alignment, and the proposal builder |
| 4 | Active Workspace | `/industry/workspace` | Contract milestone rail, live sensor stream table, field update thread, tranche position, field-pass request |
| 5 | University Labs | `/industry/universities` → `/industry/labs` | Institution cards with cohort size, rating, sponsorship state |
| 6 | Monitoring & Tracking | `/industry/monitoring` | Delivery tracker across all cohorts (including other firms' sponsorships), plus the PRJ-204 milestone/deliverable dossier |
| 7 | CSR Compliance & ESG | `/industry/impact` | FY26 ledger — domain donut, tranche release curve, partner performance, compliance artefacts |

## What changed from the reference

- **The proposal modal became a panel.** The reference opens a modal from any screen and fires a
  toast. Modals are the wrong shape for a docket a compliance officer may need to re-read, so the
  builder lives inline on the project it belongs to and every "express interest" link deep-links
  to it. It is the segment's only client component; everything else renders on the server.
- **The support options are priced from the project.** The reference hard-codes "₹3.5L" into the
  option list. Here the grant line is worth whatever gap the cohort actually filed, so one list
  serves all 28 dockets and the "short by" line is arithmetic rather than copy.
- **Non-sponsored projects are shown, marked.** The reference tracker lists only the partner's own
  projects. A sponsor who cannot see that a neighbouring block is stalled on hardware they stock
  never gets the introduction the platform exists to make.
- **Two money figures, kept apart.** `/department` analytics attributes ₹3.2 Cr of CSR to Usha
  Martin. That is the group's whole Jharkhand outlay; the ₹20.0 L on these screens is the FY26
  slice routed through JanMaang. The ledger says so explicitly rather than letting the two read
  as the same number.
