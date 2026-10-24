# Security implementation

What changed on `security/production-hardening`, where, and why. Findings are
numbered as in [SECURITY_AUDIT.md](SECURITY_AUDIT.md).

## Web (`apps/web`)

| Control | Files | Finding |
|---|---|---|
| Demo sign-in off in production unless `DEMO_AUTH=enabled`; checked in the server actions, not just the UI | `src/lib/auth/directory.ts`, `src/lib/auth/actions.ts`, `src/app/(auth)/login/page.tsx`, `login-form.tsx` | S-01, S-13 |
| One redirect validator for `?next=`: path-only, rejects `//`, `\`, control characters, and anything that resolves off-origin | `src/lib/auth/redirect.ts` (used by `proxy.ts`, `actions.ts`, login page) | S-06 |
| Production refuses an `AUTH_SECRET` under 32 characters or shaped like a placeholder | `src/lib/auth/session.ts` | S-08 |
| Council guard: same-origin, body-size ceiling (checked before and during read), signed-in student-hub role, per-user per-minute limit with `Retry-After` | `src/lib/council/guard.ts`, `src/lib/security/rate-limit.ts`, the three `src/app/api/council/*/route.ts` | S-05 |
| Upstream errors logged server-side, generic message to the client | council routes | S-19 |
| CSP (no nonces; see below), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS (production), `poweredByHeader: false` | `next.config.ts` | S-14 |
| `next` 16.3.4 → 16.4.2; removed unused `maplibre-gl`, `firebase`, `zod`; `pnpm.overrides` for patched transitive `brace-expansion`, `source-map-js`, `js-yaml`; `vitest` 4, `vite` 7, `@vitejs/plugin-react` 5.2 | `apps/web/package.json`, root `package.json`, `pnpm-lock.yaml` | S-02, S-10, S-29 |

**Design decision — CSP without nonces.** The Next.js guide's nonce variant
needs every page dynamically rendered (the public home page is static) and a
nonce in `style-src` would block the inline `style={{ width }}` used by every
progress bar. The no-nonce policy still blocks third-party scripts, frames,
plugins, `<base>` hijacking, cross-origin form posts and connections. Revisit
when the public pages become dynamic.

**Design decision — in-memory rate limiter.** It stops the abuse that costs
money (one account looping paid AI calls) without new infrastructure. With N
web replicas the budget is N×; swap in Redis behind the same `take()` when the
web tier scales out.

## API (`services/api`)

| Control | Files | Finding |
|---|---|---|
| Startup guards outside development: no `DEBUG`, generated `AUTH_SECRET` (32+, not a placeholder), `AI_SERVICE_KEY` set, https-only CORS origins; `*` refused everywhere | `app/core/config.py` | S-08, S-15 |
| `CORS_ORIGINS` parsed as a comma list (`NoDecode`) — the documented value crashed startup | `app/core/config.py` | S-16 |
| CORS: no credentials (clients use bearer tokens), explicit methods and headers | `app/main.py` | S-15 |
| Security headers incl. strict API CSP and `Cache-Control: no-store`; HSTS outside development | `app/core/middleware.py` | S-15 |
| Body-size cap (default 1 MB) checked on `Content-Length` and on bytes actually received | `app/core/middleware.py` | S-15 |
| Generic 500 body; the exception is logged, never returned | `app/core/errors.py` | S-15 |
| Auth stub answers 503 instead of raising `NotImplementedError` (still fails closed) | `app/core/security.py` | S-24 (partial) |
| `pyjwt` 2.15.1, `urllib3` 2.8.0, `certifi` 2026.10.23, `opentelemetry-api` 1.45.1 | `uv.lock` | S-09 |

## AI service (`services/ai`)

| Control | Files | Finding |
|---|---|---|
| Internal key compared with `hmac.compare_digest`; empty key refuses everyone | `app/main.py` | S-17 |
| Startup refuses a missing/short/placeholder `INTERNAL_API_KEY` or `DEBUG` outside development | `app/core/config.py` | S-08 |
| `urllib3`, `certifi` upgraded | `uv.lock` | S-09 |

## Firebase (`apps/mobile/firebase`)

| Control | Files | Finding |
|---|---|---|
| `submitVerification`: reporter/supporter for citizen verdicts, `officer` claim for field verdicts, one verdict per person/demand/kind, transaction, validated payload | `functions/src/submitVerification.ts`, `functions/src/verificationInput.ts` | S-03 |
| `analyzeReport`: 20 reports/user/hour shared across instances; model text length-capped; BCP-47 check; JSON parse failure handled | `functions/src/analyzeReport.ts`, `functions/src/quota.ts` | S-18 |
| Storage: raster types only, 0 < size < 8 MB, create/delete for the owner, no overwrite; verification photos moved under the uploader's uid | `storage.rules`, `lib/core/constants/firestore_paths.dart` | S-04 |
| Firestore: creation blocks every server-only field; `reporterId` immutable; supporters only on existing demands | `firestore.rules` | S-07 |
| `firebase-admin` 14.5, `firebase-functions` 7.4, fixed `eslint` range, committed lockfile | `functions/package.json`, `functions/package-lock.json` | S-20 |
| Emulator test suite for the rules and input validation | `tests/` | — |

**Mobile path change.** `FirestorePaths.verificationPhoto` now takes the
uploader's uid. Nothing called it yet, so no client code changed.

## Mobile (`apps/mobile`)

| Control | Files | Finding |
|---|---|---|
| `allowBackup="false"`, `fullBackupContent="false"`, explicit `usesCleartextTraffic="false"` | `android/app/src/main/AndroidManifest.xml` | S-21 |
| Uncaught-error logging only in debug builds | `lib/bootstrap.dart` | S-21 |
| Analyzer ignores `firebase/` (Node code and its `node_modules`) | `analysis_options.yaml` | — |

**Not done, with reasons.** Certificate pinning: Firebase rotates Google
certificates and pinning would brick the app on rotation, for little gain
over the platform trust store. Root/jailbreak detection: authorisation is
server-side; a rooted phone gains nothing the rules do not already refuse.
Token storage: the Firebase Auth SDK keeps tokens in the Keychain on iOS and
in app-private storage on Android; no custom storage is used, so nothing to
move to secure storage yet.

## CI/CD

| Control | Files | Finding |
|---|---|---|
| Dependency audits block on high/critical (pnpm, pip-audit for api and ai) | `.github/workflows/security.yml` | S-11 |
| New Firebase workflow: Functions typecheck + audit, rules and input tests against emulators with Java 21 | `.github/workflows/ci-firebase.yml` | S-03, S-04, S-07 |
| Rules files require mobile + devops review | `.github/CODEOWNERS` | — |

## Remaining limitations

See "Open" rows in the audit. The largest: the API has no authentication or
endpoints (S-24), so the production web app can authenticate nobody once demo
sign-in is off — correct, but it means production is blocked on the auth
module.
