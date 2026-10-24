# Environments

| | Development | Staging | Production |
|---|---|---|---|
| Where | Your laptop, docker compose | Cloud, auto-deployed | Cloud, manual + approval |
| Deploys on | — | merge to `main` | `workflow_dispatch` on a verified SHA |
| Data | Seeded demo data | Seeded, refreshed weekly | Real |
| Secrets | Local `.env` files | GitHub Environment `staging` | Secret manager |
| AI | Real key optional | Real key, low budget | Real key, budgeted |
| Approval | none | none | required reviewers |

## Rules

**Production deploys an image already verified in staging.** It never rebuilds
from source, so what ships is byte-identical to what was tested.

**CI holds deploy credentials only.** It authenticates by OIDC federation and
never sees `LLM_API_KEY` or the database password — those come from the
platform's secret manager at runtime.

**Every production migration is preceded by a backup.** A destructive migration
cannot be undone by redeploying the old image. Prefer additive migrations: add a
column, backfill, drop in a later release.

## Where it runs

The same three images (`web`, `api`, `ai`) run on a managed container platform
today and on Kubernetes when one of the adoption triggers in
[`infrastructure/kubernetes/README.md`](../../infrastructure/kubernetes/README.md)
is met. The Kustomize overlays there mirror the staging/production split in
the table above.

Every deploy ends with
[`infrastructure/scripts/smoke-test.sh`](../../infrastructure/scripts/smoke-test.sh),
which checks the API (`/health`, OpenAPI, an authorised endpoint refusing an
anonymous caller) and the web app (`/api/health`, `/login`, and `/admin`
redirecting an anonymous visitor). Set `STAGING_WEB_URL` / `PRODUCTION_WEB_URL`
repository variables only if the web app is on a different host from the API.

## Rollback

```bash
# Code only — safe.
bash infrastructure/scripts/rollback.sh

# The deploy included a migration — restore instead.
bash infrastructure/scripts/restore.sh <pre-deploy-dump>
```

See [runbook.md](runbook.md).
