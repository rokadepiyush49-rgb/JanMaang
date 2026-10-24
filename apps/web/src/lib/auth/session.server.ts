import "server-only";

import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  type Session,
  signSession,
  verifySession,
} from "./session";

/**
 * Reading and writing the session cookie. Server side only — `server-only`
 * makes importing this from a client component a build error rather than a
 * runtime leak of AUTH_SECRET.
 */

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(session: Session): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(session), {
    httpOnly: true, // the browser can send it; script cannot read it
    sameSite: "lax", // survives the redirect back from /login, blocks CSRF POSTs
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
