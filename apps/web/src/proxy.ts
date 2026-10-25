/**
 * Edge role guard. (Next 16 renamed this convention from `middleware`; the job
 * is unchanged, and the new name is the more honest one.)
 *
 * Sends a signed-out visitor to /login, a signed-in one away from a segment
 * their role cannot enter, and anyone already signed in away from /login.
 *
 * THIS IS NOT SECURITY. It runs on a cookie the browser supplies and only
 * shapes navigation. The signature stops a visitor editing their own role into
 * the cookie, which is worth having — but every protected read and write is
 * authorised again by the API, which is the enforcement point. A user who
 * defeats this proxy gains a dashboard shell with no data in it.
 */

import { NextResponse, type NextRequest } from "next/server";

import { safeRedirectPath } from "@/lib/auth/redirect";
import { ROLE_HOME, canEnter } from "@/lib/auth/roles";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

/** Readable without a session. Everything else needs one. */
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/verify",
  "/impact",
  "/leaderboard",
  "/problems",
];

const isPublic = (pathname: string) =>
  pathname === "/" ||
  PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (isPublic(pathname)) {
    // Signing in again when you already have a session is a dead end; send the
    // user where they were going instead of showing them the form twice.
    if (session && pathname.startsWith("/login")) {
      // `startsWith("/")` let `//evil.example` through, and `new URL()`
      // resolves that to another host: an open redirect for any signed-in
      // user who clicked a crafted /login link.
      const destination = safeRedirectPath(
        request.nextUrl.searchParams.get("next"),
        ROLE_HOME[session.role],
      );
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    const response = NextResponse.redirect(login);
    // An expired or tampered cookie is worse than none: without this the
    // browser keeps replaying it on every navigation.
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const segment = pathname.split("/")[1] ?? "";
  if (segment && !canEnter(segment, session.role)) {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
