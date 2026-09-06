import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // The proxy puts the blocked path here so sign-in returns you to it.
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "";

  return (
    <div className="w-full max-w-md">
      <h1 className="headline-xl text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-ink-muted">
        One account, nine roles. Where you land depends on yours.
      </p>
      <LoginForm next={safeNext} />
    </div>
  );
}
