/**
 * Streaming fallback for the role dashboards.
 *
 * Each role segment's `loading.tsx` re-exports this, so it renders inside that
 * segment's sidebar shell rather than replacing it. Shaped like the common
 * page — a banner, a row of four tiles, a wide panel — so the layout does not
 * jump when the real content arrives.
 */
export function PageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex max-w-[92rem] animate-pulse flex-col gap-6"
    >
      <span className="sr-only">Loading…</span>
      <div className="h-40 rounded-md border border-line bg-card" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((tile) => (
          <div
            className="h-32 rounded-md border border-line bg-card"
            key={tile}
          />
        ))}
      </div>
      <div className="h-72 rounded-md border border-line bg-card" />
    </div>
  );
}
