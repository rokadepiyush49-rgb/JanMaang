"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui";

/**
 * App-wide error boundary.
 *
 * Catches a render or data failure in any segment below the root layout, so a
 * failed API call shows a way forward instead of a blank page. `digest` is the
 * server-side error ID Next logs; showing it lets support find the stack trace
 * without the page leaking the message itself.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
        <span className="label-caps rounded-sm bg-danger px-2.5 py-1 text-white">
          Something went wrong
        </span>
        <h1 className="headline-lg text-ink">This screen could not load</h1>
        <p className="text-sm text-ink-muted">
          Nothing you entered has been lost. Try again, and if it keeps
          happening, quote the reference below to support.
        </p>
        {error.digest ? (
          <p className="mono-data rounded-sm bg-card-muted px-3 py-2 text-ink-muted">
            Ref {error.digest}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          <Button icon="refresh" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/" tone="outline">
            Home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
