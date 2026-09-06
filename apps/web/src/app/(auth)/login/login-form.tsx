"use client";

import { useActionState, useState } from "react";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { signIn, signInAsDemo, type SignInState } from "@/lib/auth/actions";
import { DEMO_PASSWORD, DEMO_USERS } from "@/lib/auth/directory";
import type { Role } from "@/lib/auth/roles";

const EMPTY: SignInState = {};

/** Label and icon per role. Order matches the sign-up funnel, not ROLES. */
const ROLE_LABELS: Partial<Record<Role, { label: string; icon: "graduation" | "user" | "landmark" | "map-pin" | "shield" | "briefcase" | "scale" | "settings" }>> = {
  student: { label: "Student", icon: "graduation" },
  faculty: { label: "Faculty", icon: "user" },
  institute: { label: "Institute", icon: "landmark" },
  panchayat: { label: "Gram Panchayat", icon: "map-pin" },
  department: { label: "Department", icon: "landmark" },
  officer: { label: "Officer", icon: "shield" },
  industry: { label: "Industry / CSR", icon: "briefcase" },
  gov_admin: { label: "Government Admin", icon: "scale" },
  super_admin: { label: "Super Admin", icon: "settings" },
};

function ErrorNote({ message }: { message: string }) {
  return (
    <p
      className="flex items-start gap-2 rounded-[0.5rem] border border-danger/25 bg-danger-wash px-3 py-2 text-sm text-danger"
      role="alert"
    >
      <Icon className="mt-0.5 shrink-0" name="alert-circle" size={16} />
      {message}
    </p>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, EMPTY);
  const [demoState, demoAction, demoPending] = useActionState(
    signInAsDemo,
    EMPTY,
  );
  const [showDemo, setShowDemo] = useState(false);

  const error = state.error ?? demoState.error;

  return (
    <div className="mt-8 space-y-6">
      <form action={action} className="space-y-4">
        <input name="next" type="hidden" value={next} />

        <label className="block space-y-1.5">
          <span className="label-caps text-ink-faint">Email</span>
          <input
            autoComplete="username"
            className="h-12 w-full rounded-[0.5rem] border border-line bg-card px-4 text-sm text-ink placeholder:text-ink-faint focus:border-navy focus:outline-none"
            name="email"
            placeholder="you@institution.ac.in"
            required
            type="email"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="label-caps text-ink-faint">Password</span>
          <input
            autoComplete="current-password"
            className="h-12 w-full rounded-[0.5rem] border border-line bg-card px-4 text-sm text-ink placeholder:text-ink-faint focus:border-navy focus:outline-none"
            name="password"
            required
            type="password"
          />
        </label>

        {error ? <ErrorNote message={error} /> : null}

        <Button
          className="w-full"
          disabled={pending || demoPending}
          iconAfter="arrow-right"
          size="lg"
          type="submit"
        >
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {/*
        Demo sign-in. Delete this block together with lib/auth/directory.ts once
        services/api issues real sessions — it is here so a reviewer can walk
        all nine roles without nine sets of credentials.
      */}
      <section className="rounded-lg border border-line bg-card-muted p-4">
        <button
          aria-expanded={showDemo}
          className="flex w-full items-center gap-2 text-left text-sm font-semibold text-ink"
          onClick={() => setShowDemo((open) => !open)}
          type="button"
        >
          <Icon name={showDemo ? "chevron-down" : "chevron-right"} size={16} />
          Continue as a demo role
        </button>

        {showDemo ? (
          <>
            <p className="mt-2 text-xs text-ink-muted">
              Fixture accounts, no real authentication. Every one of them also
              signs in above with the password{" "}
              <code className="mono-data rounded bg-card px-1.5 py-0.5">
                {DEMO_PASSWORD}
              </code>
              .
            </p>
            <form action={demoAction} className="mt-3 grid gap-2 sm:grid-cols-2">
              <input name="next" type="hidden" value={next} />
              {DEMO_USERS.map((user) => {
                const meta = ROLE_LABELS[user.role];
                return (
                  <button
                    className="flex items-center gap-2.5 rounded-[0.5rem] border border-line bg-card px-3 py-2.5 text-left text-sm font-semibold text-ink transition-colors hover:border-navy disabled:opacity-45"
                    disabled={pending || demoPending}
                    key={user.role}
                    name="role"
                    type="submit"
                    value={user.role}
                  >
                    <Icon
                      className="shrink-0 text-navy-tint"
                      name={meta?.icon ?? "user"}
                      size={18}
                    />
                    <span className="min-w-0">
                      <span className="block truncate">
                        {meta?.label ?? user.role}
                      </span>
                      <span className="block truncate text-xs font-normal text-ink-faint">
                        {user.name}
                      </span>
                    </span>
                  </button>
                );
              })}
            </form>
          </>
        ) : null}
      </section>
    </div>
  );
}
