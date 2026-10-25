import type { Metadata } from "next";

import {
  DEMO_PASSWORD,
  DEMO_USERS,
  demoAuthEnabled,
} from "@/lib/auth/directory";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // The proxy puts the blocked path here so sign-in returns you to it.
  const safeNext = safeRedirectPath(next, "");

  // Decided on the server so a production build never ships the demo list or
  // its password to the browser. The actions re-check the same gate.
  const demo = demoAuthEnabled()
    ? {
        password: DEMO_PASSWORD,
        personas: DEMO_USERS.map(({ role, name }) => ({ role, name })),
      }
    : null;

  return (
    <div className="w-full max-w-md">
      <h1 className="headline-xl text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-ink-muted">
        One account, nine roles. Where you land depends on yours.
      </p>
      <LoginForm demo={demo} next={safeNext} />
    </div>
  );
}
