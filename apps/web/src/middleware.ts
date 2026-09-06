/**
 * Edge role guard.
 *
 * Redirects a signed-out visitor to /login and a signed-in user away from a
 * segment their role cannot enter.
 *
 * THIS IS NOT SECURITY. It runs on a token the browser sends and only shapes
 * navigation. Every protected read and write is authorised again by the API,
 * which is the enforcement point. A user who defeats this middleware gains a
 * dashboard shell with no data in it.
 */

import { NextResponse, type NextRequest } from "next/server";

import { ROLE_HOME, canEnter, type Role } from "@/lib/auth/roles";

const PUBLIC_PREFIXES = ["/login", "/register", "/verify", "/impact", "/leaderboard", "/problems"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // TODO(auth): verify and decode the session cookie instead of trusting it.
  const role = request.cookies.get("jm_role")?.value as Role | undefined;

  if (!role) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const segment = pathname.split("/")[1] ?? "";
  if (segment && !canEnter(segment, role)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
