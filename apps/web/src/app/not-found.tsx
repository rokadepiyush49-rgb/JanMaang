import type { Metadata } from "next";

import { ButtonLink, EmptyNote } from "@/components/ui";

export const metadata: Metadata = { title: "Not found" };

/**
 * App-wide 404.
 *
 * Reached by a mistyped URL, a docket ID that no longer exists, or a sidebar
 * entry whose screen has not been built yet. The way out is the public home
 * page, which every visitor can reach whether or not they are signed in.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <span className="label-caps rounded-sm bg-primary px-2.5 py-1 text-white">
          404
        </span>
        <h1 className="headline-xl text-ink">This page isn&rsquo;t here</h1>
        <EmptyNote icon="search">
          The link may be out of date, or the record it pointed to has moved.
        </EmptyNote>
        <ButtonLink href="/" icon="arrow-left">
          Back to JanMaang
        </ButtonLink>
      </div>
    </main>
  );
}
