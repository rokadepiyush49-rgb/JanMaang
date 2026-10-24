# 0005. The AI Project Council runs in the web app, for now

Date: 2026-09-06
Status: accepted (as debt)

## Context

The student web surface arrived from `rokadepiyush49-rgb/ps-36`, where it was a
standalone Next.js application with no backend of its own. It brings the AI
Project Council: a six-seat panel that debates a student's project proposal
across three phases and returns a scored verdict. Roughly nineteen LLM calls per
session, plus text-to-speech.

It is implemented as three Next route handlers under `src/app/api/council/`
calling Groq directly, with the orchestration in `src/lib/council/`.

This conflicts with **Invariant 3**: the AI service is internal, and the API is
its only legitimate caller.

## Decision

**Port it as it stands, and record the debt here rather than in a comment.**

The alternative was to port the four council screens against a
`services/ai` endpoint that does not exist yet, which means shipping a dead
feature and doing the work twice — once to stub it, once to build it.

## Consequences

**What we accept.** `GROQ_API_KEY` now lives in the web app's server
environment. It is server-only and never reaches the browser, so no client
ships a credential — Invariant 6 holds. But it is a second place a model key
lives, and a second rate-limit bucket nobody is watching.

The route handlers themselves are stateless — the client holds the sitting in
`sessionStorage` and posts the whole transcript with each turn — so this does
not block scaling `apps/web`. It does mean the transcript crosses the wire
nineteen times per session and grows every turn, and that a sitting cannot be
resumed on another device or reviewed by a mentor afterwards. Both go away when
the session lives server-side.

**What is already right.** `orchestrator.ts`, `verdict.ts`, `personas.ts` and
`debate-policy.ts` are pure and framework-free — the route handlers are thin.
Moving them into `services/ai` is a file move plus a FastAPI router, which is
the same shape as every other extraction in ARCHITECTURE.md.

**Trigger to pay it down.** Whichever comes first: a second surface (the mobile
app, faculty review) wants to run a council, or a sitting needs to outlive the
browser tab — be resumed, mentor-reviewed, or counted in analytics. Either one
needs the session on the server, and moving it there is most of the extraction.

## Not in scope

Nothing else in `apps/web` calls a model. This ADR licenses the council and
nothing more; a new feature wanting an LLM goes through `services/api`.
