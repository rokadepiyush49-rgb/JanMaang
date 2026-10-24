# Role dashboards — status and plan

Every web role lands on its own segment under `apps/web/src/app/(app)/<segment>`
(see `ROLE_HOME` in `apps/web/src/lib/auth/roles.ts`). This page records which
of those segments are built, and the plan for the ones that are not.

## Status

| Side | Segment | Role(s) | Screens | State |
|---|---|---|---|---|
| Student | `/student` | student | Home, Problem Explorer, Council (new/session/verdict), Impact Hub, Industry Hub, Profile, Collaborate wizard | Built |
| Industry | `/industry` | industry | Home, Discover, Workspace, Labs, Monitoring, Impact, Project detail | Built |
| Government | `/panchayat` | panchayat, gov_admin | Home, Demand Register, Verification Queue, Sanctioned Works | Built |
| Government | `/department` | department, gov_admin | Command, Problem Reports, Docket, AI Clusters, Projects, Analytics | Built |
| Government | `/officer` | officer, department | Field Desk, Assigned Works, Work docket, Site Visits | **This plan** |
| Government | `/admin` | gov_admin, super_admin | State Command, Districts, Funding, Audit Log, Users & Roles | **This plan** |
| Academia | `/faculty`, `/institute` | faculty, institute | — | Placeholder, out of scope here |

## Plan

### 1. Officer — field execution (`/officer`)

Stage 7 of the lifecycle (`LIFECYCLE` in `features/gov/data.ts`). The officer
receives sanctioned works from the department and moves them to citizen
sign-off.

| Route | Purpose |
|---|---|
| `/officer` | Field desk: KPIs, today's site visits, works needing an update, SLA alerts |
| `/officer/works` | Register of every work assigned to this officer |
| `/officer/works/[id]` | Work docket: lifecycle track, milestones, fund tranches, update log, field-update form |
| `/officer/visits` | Site-visit schedule for the week, with route order and checklists |

Fixtures: `features/gov/officer.ts`. Work IDs reuse the panchayat's `W-20xx`
records so the same work reads identically in all three government portals.

### 2. Government Admin — state oversight (`/admin`)

State-wide view across all 24 districts. The segment keeps the isolation rule in
`(app)/admin/page.tsx`: it imports from `features/*` and `components/*`, never
from another role segment, so it can be split into its own deployment.

| Route | Purpose |
|---|---|
| `/admin` | State command: KPIs, district league table, fund flow, SLA breaches, escalations |
| `/admin/districts` | Performance of every district on intake, resolution and fund utilisation |
| `/admin/funding` | Allocation vs release vs utilisation by department and scheme; sanctions awaiting approval |
| `/admin/audit` | Append-only audit log and anomaly flags |
| `/admin/users` | Accounts by role, pending access requests, role-permission matrix |

Fixtures: `features/gov/admin.ts`.

### 3. Shared rules both portals follow

- **Theme** comes from `@janmaang/tokens`, the same JSON the Flutter app builds
  from. No hex values outside `features/gov/components.tsx`'s SVG table.
- **Server components only.** Same reason as the existing portals: read-only
  telemetry, inline-SVG charts, zero client JavaScript per page.
- **Fixtures are the API's shape.** Each screen reads constants today and moves
  to `services/api/app/modules/*` by swapping the import, not the markup.
- **App-wide states**: `not-found`, `error` and `loading` boundaries so a bad
  link or a failed fetch never shows a blank page.

## Re-pointing at the API

When the matching API module lands, replace the fixture import with a typed
fetch from `@janmaang/contracts`. The screens already treat every value as
data, so the change is per-file and does not touch layout.
