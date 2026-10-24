/**
 * Liveness and readiness probe for the web container.
 *
 * Used by the Dockerfile HEALTHCHECK, the Kubernetes probes and the post-deploy
 * smoke test. Deliberately shallow: it proves the Node server is up and routing,
 * and does not call the API — a web pod that restarts because the API is down
 * only adds a second outage to the first.
 *
 * Outside the proxy matcher (it skips `/api`), so it answers without a session.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "web",
      // Runtime, not NEXT_PUBLIC_*: a public value is frozen at build time,
      // and the same image runs in staging and production.
      environment: process.env.ENVIRONMENT ?? "development",
      // Set at image build time; lets the smoke test confirm which commit is live.
      version: process.env.GIT_SHA ?? "dev",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
