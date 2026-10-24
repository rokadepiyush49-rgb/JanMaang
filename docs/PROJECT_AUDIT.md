# Project audit

An honest inventory of what JanMaang is today, measured against what the
README describes. Written 2026-10-25 on `security/production-hardening`.
System diagrams live in the [README](../README.md#architecture) and
[ARCHITECTURE.md](../ARCHITECTURE.md); security detail in
[security/SECURITY_AUDIT.md](security/SECURITY_AUDIT.md).

## What the product does

Citizens report local problems by voice, photo or text. Reports are clustered
and ranked, verified by the Gram Panchayat, sanctioned by the department,
turned into problem statements for students, funded (including CSR), executed
by field officers, and closed only when the citizens who raised them confirm
the fix.

## Component status

| Component | Implemented | Missing for real use |
|---|---|---|
| **Web** (`apps/web`) | 9 role segments with 40+ screens on fixture data; signed-session login with demo personas; role proxy; AI Project Council calling Groq + Edge TTS; security headers; health endpoint | Real sign-in (blocked on API); every screen reads constants from `src/features/*` instead of the API; Faculty and Institute dashboards are placeholders; officer field updates do not persist |
| **API** (`services/api`) | App factory, settings with production guards, permission matrix + `require()`, error shape, security middleware, 26 tests, CI with Postgres + Redis | **Everything domain-level:** 0 routes, 0 tables (every `models.py` is a TODO), 0 migrations, authentication stub (fails closed) |
| **AI** (`services/ai`) | App factory, internal-key guard, provider abstraction stubs, 1 prompt, 6 eval files, 10 tests | 0 capability routes; no classification, dedup, ranking or statement generation implemented |
| **Mobile** (`apps/mobile`) | 11 feature areas of Flutter UI, Riverpod, routing, 74 tests, mock repositories | Firebase initialisation commented out; runs on mocks only; release signing uses the debug key |
| **Firebase** (`apps/mobile/firebase`) | Firestore + Storage rules, 4 Cloud Functions (`analyzeReport` with Gemini, `clusterDemand`, `computePriority`, `submitVerification`), emulator tests | Not deployed; App Check not configured; officer claims have no admin tool |
| **Contracts** (`packages/contracts`) | Generation pipeline (fixed in PR #2), committed output | Output is empty because the API has no routes |
| **Infra** | Dockerfiles, compose, CI per service, staging auto-deploy, approved production promotion, smoke test, Kustomize manifests | Deploy step is `TODO(deploy)`; no Terraform; no environment provisioned |
| **E2E** (`tests/e2e`) | Playwright config | 0 specs |

## Two data planes, one product

The README describes FastAPI + PostgreSQL as the system of record (ADR 0002).
The code that exists for citizens writes to **Firestore** through Cloud
Functions instead, and the web dashboards read neither. Until one plane is
chosen for demands, the web and mobile halves cannot show the same record.
This is the most important architectural decision outstanding; the roadmap
treats it as P0.

## Baseline (this branch)

| Check | Result |
|---|---|
| Web: lint, typecheck, 76 tests, `next build` | pass |
| API: ruff, format, mypy, import contracts, 26 tests | pass |
| AI: ruff, format, mypy, 10 tests | pass |
| Mobile: format, analyze, 74 tests | pass |
| Functions: `tsc`, 8 input tests | pass |
| Firebase rules tests (34) | not run — needs Java; runs in CI |
| Dependency audits (pnpm, pip-audit ×2, npm) | 0 known vulnerabilities |
| Docker image builds | not run — Docker daemon off |

## Technical debt worth naming

- **ADR 0005:** the AI Council calls Groq from the web server, bypassing the
  AI service. Acceptable while the AI service has no routes; move it when it does.
- **Fixture-driven screens.** Fixtures are shaped like the expected API
  responses, so each screen re-points by swapping an import, but nothing
  enforces that shape until the contracts package has types to check against.
- **Stateless sessions** cannot be revoked server-side (audit S-22).
- **In-memory rate limiting** on the web tier (audit S-28).

## Risks

| Risk | Impact | Mitigation in roadmap |
|---|---|---|
| Two data planes diverge further as both grow | Rework of whichever loses | P0-2 decision before any more domain code |
| Demo sign-in accidentally enabled on a real deployment | Full takeover | Gated by `DEMO_AUTH`, documented in the checklist; remove `directory.ts` with P0-1 |
| AI provider cost | Bill shock | Per-user limits (web, Functions), daily budget setting in the AI service, provider spend caps (checklist) |
| Firebase rules regress unnoticed | Data tampering | `ci-firebase.yml` + CODEOWNERS on rules files |
