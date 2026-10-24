# Implementation roadmap

The source of truth for what is next. Priorities: **P0** blocks any real
deployment, **P1** a core feature that is missing or broken, **P2**
quality and secondary features, **P3** polish. Status: Done / In progress /
Next / Planned / Blocked. Evidence for Done items is in
[security/SECURITY_TEST_PLAN.md](security/SECURITY_TEST_PLAN.md).

## Done (this branch and PR #2)

| ID | Task | Verification |
|---|---|---|
| D-1 | Officer and State Admin dashboards; error, 404 and loading states | build, tests, browser walk-through |
| D-2 | Critical security fixes S-01…S-21 (see audit) | 76 web, 26 API, 10 AI, 8 Functions tests; production probe |
| D-3 | All dependency trees audited clean; audits now block CI | `pnpm audit`, `pip-audit`, `npm audit` |
| D-4 | Contracts CI job fixed (doubled path, untracked output) | job replayed locally; pushed in `e9f9a86` |
| D-5 | Deployment scaffolding: health checks, smoke tests, Kustomize, Dependabot | `kubectl kustomize`, `bash -n` |

## P0 — before any production deploy

### P0-1 · API authentication — **Next**
*Problem:* `get_current_principal` refuses every token; production has no way to sign anyone in once demo sign-in is off.
*Evidence:* `services/api/app/core/security.py`; `users/models.py` is a TODO.
*Solution:* verify Firebase ID tokens with `firebase_admin.auth.verify_id_token` (checks signature, audience, expiry, revocation with `check_revoked=True`); resolve to a `users` row (uid → user id, role, district/department/institute scope); web signs in via Firebase Auth client SDK and exchanges the ID token for its session cookie; delete `lib/auth/directory.ts` and `DEMO_AUTH`.
*Files:* `services/api/app/core/security.py`, `modules/auth/*`, `modules/users/models.py`, first Alembic migration, `apps/web/src/lib/auth/*`.
*Depends on:* P0-2 (where the user record lives).
*Acceptance:* forged, expired, revoked and wrong-project tokens → 401; a valid token for an unknown uid → 403; a valid token resolves the right role and scope; sign-out revokes refresh tokens.
*Tests:* unit tests with a stubbed verifier for each rejection; integration test against Postgres in `ci-api`.

### P0-2 · Choose the system of record for demands — **Blocked on a decision**
*Problem:* mobile writes demands to Firestore; ADR 0002 and the API design say PostgreSQL; the web reads neither.
*Options:* (a) PostgreSQL is the source of truth, the mobile app calls the API, Firestore is dropped or kept for push only; (b) Firestore stays the citizen-facing store and a Function mirrors into PostgreSQL for ranking, funding and dashboards.
*Recommendation:* (a) — it is what ADR 0002 records, keeps one authorisation model (`require(Permission)` + scope), and the PostGIS/pgvector dedup cascade only works in Postgres.
*Acceptance:* an ADR recording the choice; the mobile repository interface points at one backend.

### P0-3 · Initial schema and migrations — **Planned**
Users, roles/scopes, demands, clusters, verifications, works, allocations, audit events (hash-chained). *Acceptance:* `alembic upgrade head` on an empty database in CI; downgrade of the last revision works; every table has an owner-scoped index for the queries P1 needs.

### P0-4 · Run the Firebase rules tests in CI — **Next**
Push this branch; confirm `ci-firebase.yml` passes. If (b) is chosen in P0-2 these rules stay load-bearing; if (a), they still guard the Storage bucket.

### P0-5 · Release signing and App Check — **Planned (manual)**
See the production checklist §5–6.

## P1 — core features

| ID | Task | Depends on | Acceptance |
|---|---|---|---|
| P1-1 | Demand endpoints: create, list (paginated, filtered by scope), get, verify, escalate — each with an ownership/scope test | P0-1, P0-3 | IDOR tests: a panchayat cannot read or change another panchayat's demand |
| P1-2 | AI capabilities behind the internal key: classification, dedup cascade (PostGIS 150 m → pgvector → LLM), priority score | P0-3 | Eval suite in `services/ai/evals` runs in `ai-evals.yml` with a pass threshold |
| P1-3 | Point dashboards at the API: Panchayat verification queue first, then Department triage, then Officer works | P1-1 | Screens render API data; fixtures removed from those screens; Playwright spec per journey |
| P1-4 | Officer field updates persist — needs a `project:update` (or `field_update:create`) permission for officers | P1-1 | Update visible on the department docket and in the audit log |
| P1-5 | Wire the mobile app to the chosen backend; remove mocks behind `USE_MOCKS` | P0-2 | Report → analyse → submit on a device |
| P1-6 | Login brute-force protection and server-side session revocation | P0-1 | 6th failed attempt in 15 min throttled; signed-out session rejected |

## P2 — quality

- Replace the in-memory council rate limiter with Redis when the web tier runs more than one replica.
- Move the AI Council from the web server into `services/ai` (ADR 0005).
- Faculty and Institute dashboards.
- Fix the 15px horizontal overflow on `/student` at 375 px.
- Playwright smoke suite for every role's landing page in `e2e.yml`.
- Fill in the `TODO(deploy)` step in both deploy workflows once a platform is chosen.

## P3 — polish

- Nonce-based CSP once public pages are dynamic.
- Android 12+ `dataExtractionRules` to cover device-to-device transfer.
- Replace the Edge TTS public token with a supported TTS provider.
