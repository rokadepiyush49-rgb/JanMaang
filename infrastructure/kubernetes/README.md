# Kubernetes

Kustomize manifests for running JanMaang on any conformant cluster. They are
**ready, not required**: a managed container platform (Cloud Run, ECS, Container
Apps) still carries this workload comfortably, and the same images run on both.
The manifests exist so the move is a `kubectl apply`, not a project.

## Adopt when at least one is true

- Multiple services genuinely need independent horizontal scaling under load
- A government deployment mandates on-prem or a specific sovereign cloud
- The AI service needs GPU node pools with different scheduling from the API

## Layout

```
base/                     every workload, environment-agnostic
  config.yaml             shared ConfigMap; documents each service's Secret
  web.yaml                Deployment · Service · HPA · PDB   (Next.js, :3000)
  api.yaml                Deployment · Service · HPA · PDB   (FastAPI, :8000)
  worker.yaml             Deployment                        (arq, same image as api)
  ai.yaml                 Deployment · ClusterIP Service     (internal only, :8001)
  ingress.yaml            one host: /api/v1 + /health → api, everything else → web
  network-policy.yaml     ai accepts traffic from api and worker only
overlays/staging/         namespace, :staging tags, 1 replica, staging host
overlays/production/      namespace, :production tags, 3 API replicas, prod host
```

Render or apply an environment:

```bash
kubectl kustomize infrastructure/kubernetes/overlays/staging
kubectl apply -k infrastructure/kubernetes/overlays/staging
```

## What the cluster must provide

| Dependency | Why | Typical choice |
|---|---|---|
| Ingress controller | `ingressClassName: nginx` | ingress-nginx |
| TLS certificate in `janmaang-tls` | HTTPS on the public host | cert-manager |
| Secrets `janmaang-web`, `janmaang-api`, `janmaang-ai` | Runtime secrets, keys listed in `base/config.yaml` | External Secrets Operator |
| PostgreSQL 16 + PostGIS + pgvector | `DATABASE_URL` in `janmaang-api` | Managed database, not in-cluster |
| Redis 7 | `REDIS_URL` | Managed Redis |
| metrics-server | HPAs scale on CPU | Usually pre-installed |

**Never commit a `Secret` manifest.** It is base64, not encryption.

## Rules baked into the manifests

- **Same image everywhere.** Overlays change tags, replicas and hosts, never the
  build. The web image has no API URL compiled in; the browser calls `/api/v1`
  on the host it loaded from.
- **Restricted pod security.** Every pod runs as UID 10001 with a read-only root
  filesystem, no privilege escalation and all capabilities dropped; the
  namespaces enforce the `restricted` Pod Security Standard.
- **Migrations run once, outside the Deployments.** The deploy workflow takes a
  backup, runs `alembic upgrade head`, then rolls the services, so replicas never
  race each other through a migration.
- **Zero-downtime rollouts.** `maxUnavailable: 0` with readiness probes on
  `/health` (api, ai) and `/api/health` (web).
