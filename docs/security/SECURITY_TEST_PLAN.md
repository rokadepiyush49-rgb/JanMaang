# Security test plan

Every case says how it is run and what happened on 2026-10-25. "Not run" means
the test exists but this machine could not execute it, with the reason.

## How to run

```bash
pnpm --filter @janmaang/web test
```

```bash
cd services/api && uv run pytest tests/api tests/unit
```

```bash
cd services/ai && uv run pytest -m "not eval"
```

```bash
cd apps/mobile && flutter test
```

```bash
cd apps/mobile/firebase/tests && npm ci && npm test
```

The last one starts the Firestore and Storage emulators, which need Java 11+.
On this machine: `export JAVA_HOME=/opt/homebrew/opt/openjdk@17` first. CI runs
it in `ci-firebase.yml` on every change under `apps/mobile/firebase`.

## Results

| Area | Test | Expected | Result |
|---|---|---|---|
| Web auth | `directory.test.ts`: demo personas refused in production by default; only `DEMO_AUTH=enabled` opts in; same error for bad email and bad password | refused / generic | **Pass** |
| Web auth | `session.test.ts`: tampered, expired, wrong-key tokens rejected; production refuses example, short and empty `AUTH_SECRET` | rejected | **Pass** |
| Web auth | `redirect.test.ts`: `//evil`, `/\evil`, `/\t/evil`, `javascript:`, absolute URLs, over-long, non-strings → fallback | fallback | **Pass** |
| Web authz | `roles.test.ts`: every role's segment access; super admin everywhere | as matrix | **Pass** |
| Web authz | `guard.test.ts`: anonymous 401; officer/industry/panchayat/gov_admin 403; student and super_admin admitted; cross-site 403 before session read | as stated | **Pass** |
| Web abuse | `guard.test.ts`: 413 by Content-Length and by bytes read; 5th verdict in a minute 429 with `Retry-After`; other users unaffected | as stated | **Pass** |
| Web abuse | `rate-limit.test.ts`: limit, window reset, per-key isolation, bounded memory under key flood | as stated | **Pass** |
| Web headers | `headers.test.ts`: CSP directives, no `unsafe-eval` in production, HSTS production-only, XFO/nosniff/referrer | as stated | **Pass** |
| Web drift | `admin.test.ts`: web permission matrix equals `permissions.py` | equal | **Pass** |
| Web, live | `next start` (NODE_ENV=production, generated secret): login HTML has no demo section or demo emails; headers present, no `X-Powered-By`; council anonymous 401, officer 403, cross-site 403, oversized 413; `?next=//evil.example` and `?next=/%5Cevil.example` → `/student`; officer → `/admin` redirected | as stated | **Pass** (manual curl probe) |
| API | `test_security.py`: headers on every response; 413 by length and by streamed bytes; CORS answers only listed origins, no credentials header; protected route 401 anonymous, 503 with any token (fails closed); 500 body hides exception text | as stated | **Pass** |
| API auth | `test_auth.py`: no token 401 with Bearer challenge; bad token 401 without saying why; provider outage 503; verified-but-unregistered 403; disabled 403; missing resolver or verifier fails closed 503; role claims in the token never change the database role; Firebase expired/revoked/invalid/disabled/malformed → 401, certificate fetch failure → 503; revocation check always on; register 201 then 200; logout revokes and audits, and records nothing when Firebase is down | as stated | **Pass** (24) |
| API accounts (DB) | `test_accounts.py`: one citizen per uid with an audit row; token claims cannot grant a role; re-registering cannot reset a granted role; resolver returns DB role and panchayat/district scope; deactivated accounts locked out; audit chain links and names a tampered row; UPDATE, DELETE and TRUNCATE on `audit_events` refused by the database | as stated | Runs in `ci-api` against PostGIS — **pending first CI run** (skipped locally: no PostGIS) |
| Schema drift (DB) | `test_migrations.py`: migrated schema equals the models; downgrade to base and back is clean | no diff | Runs in `ci-api` — **pending first CI run**. Offline SQL render passes locally |
| API config | `test_security.py`: production/staging refuse example/short secrets, empty or example AI key, `DEBUG`, http origins; `*` refused everywhere; development still accepts example values | as stated | **Pass** |
| API | `test_permissions.py`, `test_module_boundaries.py`, `test_health.py` | existing | **Pass** (26 total) |
| AI | `test_security.py`: missing/wrong key 401, right key 200, unset key refuses all; deployed settings refuse weak keys | as stated | **Pass** (10 total) |
| Functions | `verification-input.test.js`: demand-id traversal, checklist bounds and shape, photo URLs limited to https Storage hosts, max 10 | as stated | **Pass** (8) |
| Firestore rules | `rules.test.js`: 7 server-only fields refused on create; spoofed reporter; non-`reported` status; reporter cannot rewrite `reporterId`, status or score; others cannot edit; supporters only for self and existing demands; client writes refused on 5 server collections; quota docs hidden; users cannot self-grant officer/trust | as stated | **Pass** in CI — 42/42 (34 rules + 8 input) at `e315a89`, each test from a clean emulator |
| Storage rules | `rules.test.js`: owner upload ok; other folder, SVG, empty, >8 MB, overwrite, anonymous refused; cannot touch another's verification photo; owner create/delete ok | as stated | **Pass** in CI at `e315a89`. The first runs caught a real gap (owner overwrite) and two harness bugs, all fixed |
| submitVerification | `verification-policy.test.js`: reporter and supporter may verify, a stranger may not; field verdict needs the officer claim and the claim does not grant a citizen verdict; missing or not-in-progress demand refused; second verdict refused; only a citizen's "fixed" closes, either side's "broken" reopens | as stated | **Pass** (14 with quota). The transaction only gathers facts and applies the result; that glue is typechecked, not executed |
| analyzeReport quota | `verification-policy.test.js`: 20 calls allowed, 21st refused with no write, new window after an hour | as stated | **Pass** |
| Mobile | `flutter analyze`, `dart format`, 74 widget/unit tests | clean | **Pass** |
| Dependencies | `pnpm audit` (all), `pnpm audit --prod`, `pip-audit` api and ai, `npm audit` functions | 0 known | **Pass** |
| Secrets | History scan for `.env` files on all branches; pattern scan of tracked files | none | **Pass** |

## Not covered yet

- **Real authentication** (password hashing, reset, MFA for admins, lockout,
  session revocation): nothing to test until the API's auth module exists.
- **IDOR/BOLA on API resources**: there are no resource endpoints yet. Add an
  ownership test with every endpoint that takes an id.
- **SQL injection**: no queries exist yet; SQLAlchemy Core/ORM parameterises
  by default. Add a test per endpoint that accepts search or filter input.
- **Mobile release configuration** (signing, ProGuard/R8, ATS): verified by
  inspection only; needs a release build on a device.
- **Docker images**: not built here (Docker daemon not running).
