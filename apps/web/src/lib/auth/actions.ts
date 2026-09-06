"use server";

import { redirect } from "next/navigation";

import { authenticate, demoUserFor } from "./directory";
import { ROLE_HOME, ROLES, type Role } from "./roles";
import { clearSessionCookie, setSessionCookie } from "./session.server";
import { newSession } from "./session";

export interface SignInState {
  error?: string;
}

/** Only ever redirect within this app — an open redirect here is a phishing gift. */
function safeNext(value: FormDataEntryValue | null, fallback: string): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

/**
 * Sign in with email and password.
 *
 * Credentials are checked by lib/auth/directory.ts, which is a stand-in for
 * services/api's /auth/login. When that endpoint lands this action does not
 * change — only what `authenticate` calls does.
 */
export async function signIn(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await authenticate(email, password);
  // One message for a wrong address and a wrong password alike: saying which
  // was wrong tells an attacker which accounts exist.
  if (!user) {
    return { error: "That email and password do not match an account." };
  }

  await setSessionCookie(newSession(user));
  redirect(safeNext(formData.get("next"), ROLE_HOME[user.role]));
}

/**
 * Sign in as a role's demo persona, no password.
 *
 * Demo-only, and it goes when directory.ts does. It exists because reviewers
 * need to see nine roles in five minutes, not because it is a sound way in.
 */
export async function signInAsDemo(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const role = String(formData.get("role") ?? "");
  if (!ROLES.includes(role as Role)) return { error: "Unknown role." };

  const user = demoUserFor(role as Role);
  if (!user) return { error: "No demo account for that role yet." };

  await setSessionCookie(newSession(user));
  redirect(safeNext(formData.get("next"), ROLE_HOME[user.role]));
}

export async function signOut(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
