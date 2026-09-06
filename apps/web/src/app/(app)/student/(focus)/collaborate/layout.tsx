import Link from "next/link";

import { Icon } from "@/components/icon";
import { Avatar } from "@/components/ui";
import { getSession } from "@/lib/auth/session.server";

/**
 * Focus chrome for the collaboration wizard: back out, or finish. No sidebar —
 * the step layout needs the full width, and a half-completed team is not
 * somewhere to invite wandering off.
 */
export default async function CollaborateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Non-null: (app)/layout redirects a sessionless visitor before reaching here.
  const session = await getSession();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-18 items-center gap-4 border-b border-line bg-surface/85 px-4 backdrop-blur lg:px-8">
        <Link
          aria-label="Back to dashboard"
          className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-card-muted"
          href="/student"
        >
          <Icon name="arrow-left" size={22} />
        </Link>
        <p className="text-xl font-bold text-ink">JanMaang OS</p>

        <div className="ml-auto flex items-center gap-1">
          <button
            aria-label="Notifications"
            className="hidden size-10 items-center justify-center rounded-full text-ink-muted hover:bg-card-muted sm:flex"
            type="button"
          >
            <Icon name="bell" size={20} />
          </button>
          <button
            aria-label="Help"
            className="hidden size-10 items-center justify-center rounded-full text-ink-muted hover:bg-card-muted sm:flex"
            type="button"
          >
            <Icon name="help" size={20} />
          </button>
          <Avatar name={session?.name ?? ""} size={40} tone="navy" />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}
