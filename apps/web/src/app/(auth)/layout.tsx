import Link from "next/link";

/**
 * Chrome for the signed-out routes. No sidebar, no session — everything here
 * renders for a visitor we know nothing about.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex h-18 items-center px-4 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex size-11 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
            JM
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold text-ink">JanMaang</span>
            <span className="label-caps block text-ink-faint">Jharkhand OS</span>
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-16">
        {children}
      </main>
    </div>
  );
}
