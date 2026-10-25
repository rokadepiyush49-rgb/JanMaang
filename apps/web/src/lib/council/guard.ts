import "server-only";

import { NextResponse } from "next/server";

import { canEnter } from "@/lib/auth/roles";
import type { Session } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session.server";
import { RateLimiter } from "@/lib/security/rate-limit";
import type { ApiError } from "./types";

/**
 * The gate in front of every /api/council route.
 *
 * These routes spend the Groq key and an external TTS service, and the role
 * proxy deliberately skips /api, so until this existed anyone on the internet
 * could run them. Each route now needs, in order:
 *
 *   1. a same-origin request — a cross-site page cannot drive them with the
 *      visitor's cookie (SameSite=Lax already blocks most of this; the Origin
 *      check covers browsers and redirects where it does not);
 *   2. a body under the route's ceiling, checked before it is parsed;
 *   3. a valid session for a role that may use the student hub;
 *   4. room in that user's per-minute budget.
 */

export type CouncilRoute = "turn" | "verdict" | "speech";

/**
 * Per user, per minute. A full session is ~19 turns spread over several
 * minutes of speech, so these leave real use untouched and stop a loop.
 */
const LIMITERS: Record<CouncilRoute, RateLimiter> = {
  turn: new RateLimiter(20, 60_000),
  verdict: new RateLimiter(4, 60_000),
  speech: new RateLimiter(40, 60_000),
};

/**
 * Largest legitimate body per route. A turn re-posts the whole transcript
 * (200 entries × 8,000 characters at the validator's limits), so it gets the
 * most room; speech carries one line.
 */
const MAX_BODY_BYTES: Record<CouncilRoute, number> = {
  turn: 2_000_000,
  verdict: 2_000_000,
  speech: 16_000,
};

function deny(
  status: number,
  code: ApiError["code"],
  error: string,
  headers?: Record<string, string>,
): NextResponse<ApiError> {
  return NextResponse.json<ApiError>({ error, code }, { status, headers });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Same-origin fetches from older browsers may omit Origin on POST; the
  // SameSite cookie still applies to them.
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function guardCouncilRequest(
  request: Request,
  route: CouncilRoute,
): Promise<{ session: Session } | { response: NextResponse<ApiError> }> {
  if (!sameOrigin(request)) {
    return { response: deny(403, "FORBIDDEN", "Cross-site request refused.") };
  }

  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > MAX_BODY_BYTES[route]) {
    return { response: deny(413, "TOO_LARGE", "Request body too large.") };
  }

  const session = await getSession();
  if (!session) {
    return {
      response: deny(401, "UNAUTHENTICATED", "Sign in to use the council."),
    };
  }
  if (!canEnter("student", session.role)) {
    return {
      response: deny(
        403,
        "FORBIDDEN",
        "The council is part of the student hub.",
      ),
    };
  }

  const limit = LIMITERS[route].take(session.userId);
  if (!limit.ok) {
    return {
      response: deny(
        429,
        "RATE_LIMITED",
        "Too many council requests. Wait a moment and resume.",
        { "Retry-After": String(limit.retryAfter) },
      ),
    };
  }

  return { session };
}

/**
 * Reads a JSON body without trusting Content-Length, which a client can omit
 * or understate. Returns null for anything over the ceiling or not JSON.
 */
export async function readJsonBody(
  request: Request,
  route: CouncilRoute,
): Promise<Record<string, unknown> | null> {
  const text = await request.text().catch(() => "");
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES[route])
    return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
