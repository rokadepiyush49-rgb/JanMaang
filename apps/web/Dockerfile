# syntax=docker/dockerfile:1
# Build context is the REPO ROOT, not apps/web — the app depends on workspace
# packages under packages/, which must be inside the context.
#   docker build -f apps/web/Dockerfile .

# Node 22 LTS: Node 20 reached end of life in April 2026, and the test
# tooling (vite 7, vitest 4) needs 22.12+. Keep in step with .nvmrc.
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/tokens/package.json ./packages/tokens/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
# Listed in pnpm-workspace.yaml and so in the lockfile's importers. Without its
# manifest the workspace no longer matches the lockfile and a frozen install
# refuses to run.
COPY tests/e2e/package.json ./tests/e2e/
# Frozen, with no fallback: an install that silently re-resolves the lockfile
# ships dependency versions nobody reviewed. CI runs the same frozen install, so
# a drifted lockfile fails there first.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Sources plus the generated design tokens. dist/tokens.css is gitignored and
# globals.css imports it, so every stage that compiles the app needs it built.
FROM deps AS src
COPY . .
RUN pnpm --filter @janmaang/tokens build

FROM src AS development
EXPOSE 3000
CMD ["pnpm", "--filter", "@janmaang/web", "dev"]

FROM src AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# No per-environment build arguments, on purpose. Production promotes the exact
# image staging tested, so anything compiled in here — every NEXT_PUBLIC_*
# value — would ship staging's settings to production. The browser reaches the
# API same-origin at /api/v1 through the ingress, and server code reads its
# environment at runtime.
RUN pnpm --filter @janmaang/web build

FROM base AS production
# The commit this image was built from, surfaced by /api/health.
ARG GIT_SHA=dev
# HOSTNAME: Docker sets it to the container ID, and the standalone server binds
# to whatever it holds. 0.0.0.0 makes it reachable from outside the container.
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 PORT=3000 GIT_SHA=$GIT_SHA
RUN addgroup -g 10001 nodejs && adduser -S -u 10001 -G nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
# busybox wget ships with alpine; curl does not.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "apps/web/server.js"]
