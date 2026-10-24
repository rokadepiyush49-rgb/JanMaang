"use client";

import { createContext, useContext } from "react";

import type { Session } from "./session";

/**
 * The session, read on the server and handed down for the chrome to render.
 *
 * Client components get name, role and affiliation so the shell can show who
 * you are. They do not get the token, and nothing here decides access — the
 * role in this context styles a badge and shapes a menu, nothing more.
 */
const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
  );
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used inside the (app) layout.");
  }
  return session;
}
