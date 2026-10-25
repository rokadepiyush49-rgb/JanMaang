# Production deployment checklist

Code changes do not configure the hosting platform. Every item below is a
setting someone has to make by hand, with the place to make it. Work top to
bottom; an unchecked **Blocker** means do not deploy.

Related: [environments](../deployment/environments.md) ·
[runbook](../deployment/runbook.md) ·
[Kubernetes](../../infrastructure/kubernetes/README.md).

## 0. Release blockers (code)

- [ ] **Blocker** — API authentication implemented (`services/api/app/core/security.py`:
  verify Firebase ID tokens, resolve the local user). Until then no production
  user can sign in once demo sign-in is off. See `docs/IMPLEMENTATION_ROADMAP.md` P0-1.
- [ ] **Blocker** — Initial database schema and migrations exist and apply to
  an empty database (`alembic upgrade head` in CI).
- [ ] **Blocker** — Firebase rules tests pass in `ci-firebase.yml` (they could
  not run on the audit machine).
- [ ] All CI workflows green on the release SHA, including the now-blocking
  dependency audit.

## 1. Secrets — generate, store, never reuse

Generate each with `openssl rand -hex 32`. Store in the platform secret
manager (GCP Secret Manager / External Secrets), never in Git or CI logs.

- [ ] Web `AUTH_SECRET` (session signing). The app refuses example or short values.
- [ ] API `AUTH_SECRET` — a different value from the web's.
- [ ] `AI_SERVICE_KEY` (API) = `INTERNAL_API_KEY` (AI service): same value, used only by those two.
- [ ] `DATABASE_URL` for a least-privilege application role (see §4).
- [ ] `LLM_API_KEY` (AI service), `GROQ_API_KEY` (web council), each with a
  spend cap set in the provider's console.
- [ ] Cloud Functions `GEMINI_API_KEY`: `firebase functions:secrets:set GEMINI_API_KEY`.
- [ ] **`DEMO_AUTH` is unset in production.** Set `DEMO_AUTH=enabled` on a
  staging review deployment only, never where real data lives.
- [ ] Rotate any key that was ever pasted into a chat, ticket or screenshot.

## 2. Environment variables (non-secret)

- [ ] `ENVIRONMENT=production` for API and AI (enables the startup guards).
- [ ] `DEBUG=false` (the API and AI refuse to start otherwise).
- [ ] API `CORS_ORIGINS` = the exact https web origin(s). No `*`, no http.
- [ ] `NODE_ENV=production` for the web (the Docker image sets it).

## 3. Domain, TLS, edge

- [ ] DNS A/AAAA or CNAME for the public host; TLS certificate issued (cert-manager or the platform's managed certs).
- [ ] HTTP → HTTPS redirect at the load balancer. The web sends HSTS (2 years, no preload); only submit to the preload list after a deliberate decision.
- [ ] Ingress routes `/api/v1` and `/health` to the API, everything else to web; the AI service has **no** public route.
- [ ] Load balancer forwards `X-Forwarded-For`/`-Proto`; nothing else is trusted as client identity.
- [ ] Request body limit at the edge ≥ API's `MAX_REQUEST_BODY_BYTES` (1 MB) and ≥ 2 MB for `/api/council/*`.

## 4. Database

- [ ] Managed PostgreSQL 16 + PostGIS + pgvector, private network only, TLS required.
- [ ] Separate roles: a migration role (DDL) used only by the deploy job; an app role with DML on application tables only.
- [ ] Automated daily backups + point-in-time recovery; **one restore actually tested** (`infrastructure/scripts/restore.sh`) before launch.
- [ ] The deploy workflow takes a backup before `alembic upgrade head` (already in `deploy-production.yml`).

## 5. Firebase project (console / CLI)

- [ ] Deploy rules: `firebase deploy --only firestore:rules,storage` from `apps/mobile/firebase`.
- [ ] Deploy functions: `npm ci && npm run build` in `functions/`, then `firebase deploy --only functions`.
- [ ] **App Check** registered for Android (Play Integrity) and iOS (App Attest/DeviceCheck) *before* the app ships: both callables set `enforceAppCheck: true` and will reject every call otherwise.
- [ ] Officer accounts get the `officer` custom claim through an admin script run by an operator — never from a client.
- [ ] Authentication → only the sign-in providers actually used are enabled; authorised domains list only the production domains.
- [ ] Storage bucket has no public IAM bindings; access is through rules only.
- [ ] Budget alert on the Firebase/GCP project.

## 6. Mobile release

- [ ] Create an upload keystore; configure `android/key.properties` (gitignored) and replace the debug `signingConfig` in `android/app/build.gradle`. Enrol in Play App Signing.
- [ ] `flutterfire configure` for the production project; Firebase initialisation un-commented in `lib/bootstrap.dart`; `USE_MOCKS=false`.
- [ ] Build with `--obfuscate --split-debug-info=build/symbols`; upload symbols to Crashlytics.
- [ ] iOS: App Transport Security left at default (no arbitrary loads); release signing via the team's distribution certificate.
- [ ] Verify on a real device: report → analyse → submit; verification by a supporter succeeds and by a stranger fails.

## 7. Monitoring and response

- [ ] Logs from all three services shipped to the platform log store (they emit JSON).
- [ ] Alerts: 5xx rate, p95 latency, health-check failures, AI provider 429s/spend, `resource-exhausted` from `analyzeReport`, 429s from `/api/council/*`.
- [ ] Error tracking for web and mobile (Crashlytics is already a dependency).
- [ ] An owner and an on-call rota; the incident steps in `SECURITY.md` and `docs/deployment/runbook.md` reviewed.

## 8. Final smoke test (after every deploy)

`infrastructure/scripts/smoke-test.sh <api-url> [web-url]` runs automatically
in both deploy workflows. It must show: API health, OpenAPI served, protected
API endpoint refusing anonymous callers, web health, login page renders,
anonymous `/admin` redirected. Then by hand:

- [ ] `curl -sI https://<host>/login` shows CSP, HSTS, `X-Frame-Options: DENY`, no `X-Powered-By`.
- [ ] The login page shows **no** "Continue as a demo role" section.
- [ ] `POST /api/council/turn` without a cookie → 401.
- [ ] `https://<host>/login?next=//example.org` after signing in stays on the host.

## 9. Rollback

`deploy-production.yml` runs `infrastructure/scripts/rollback.sh` on a failed
smoke test. A deploy that ran a destructive migration needs `restore.sh` with
the pre-deploy dump instead — prefer additive migrations so this never comes up.
