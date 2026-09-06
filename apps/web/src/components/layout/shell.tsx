"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/auth/actions";
import { ROLE_HOME, ROLE_LABEL, segmentsFor } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-context";
import { LanguageSwitcher } from "../language-switcher";
import { Icon, type IconName } from "../icon";
import { Avatar } from "../ui";

/** One nav entry. Each role segment supplies its own list. */
export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

/** The sidebar's one filled button — a role's most common create action. */
export interface NavAction {
  href: string;
  label: string;
}

function Brand({ home }: { home: string }) {
  return (
    <Link className="flex items-center gap-3" href={home}>
      <span className="flex size-11 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
        JM
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold text-ink">JanMaang</span>
        <span className="label-caps block text-ink-faint">Jharkhand OS</span>
      </span>
    </Link>
  );
}

/**
 * The active entry is the longest nav href the path starts with.
 *
 * A plain prefix test is wrong here: the role's landing route is a prefix of
 * every one of its children, so `/student` would light up alongside
 * `/student/council`. Longest-match picks the child and only falls back to the
 * landing route when nothing deeper matches.
 */
function activeHref(nav: NavItem[], pathname: string): string | null {
  let best: string | null = null;
  for (const item of nav) {
    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (best === null || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}

function NavLinks({ nav, onNavigate }: { nav: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const current = activeHref(nav, pathname);
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = item.href === current;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={[
              "flex items-center gap-3 rounded-[0.5rem] px-4 py-3 text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-white"
                : "text-ink-muted hover:bg-card-muted hover:text-ink",
            ].join(" ")}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            <Icon name={item.icon} size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  nav,
  home,
  action,
  onNavigate,
}: {
  nav: NavItem[];
  home: string;
  action?: NavAction;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6 px-5 py-6">
      <Brand home={home} />
      {action ? (
        <Link
          className="flex h-12 items-center justify-center gap-2 rounded-[0.5rem] bg-primary text-sm font-semibold text-white transition-colors hover:bg-navy"
          href={action.href}
          onClick={onNavigate}
        >
          <Icon name="plus" size={18} />
          {action.label}
        </Link>
      ) : null}
      <NavLinks nav={nav} onNavigate={onNavigate} />
      <div className="mt-auto space-y-1 border-t border-line pt-5">
        <Link
          className="flex items-center gap-3 rounded-[0.5rem] px-4 py-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-card-muted hover:text-ink"
          href={`${home}/profile`}
          onClick={onNavigate}
        >
          <Icon name="settings" size={20} />
          Settings
        </Link>
        <Link
          className="flex items-center gap-3 rounded-[0.5rem] px-4 py-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-card-muted hover:text-ink"
          href={`${home}/profile`}
          onClick={onNavigate}
        >
          <Icon name="help" size={20} />
          Support
        </Link>
      </div>
    </div>
  );
}

/**
 * Who you are signed in as, and the way out.
 *
 * The segment list is the old "Switch Role" button made real: it shows only
 * the segments this role may enter, so it is a single entry for a student and
 * a full list for a super admin. It is convenience, not privilege — the proxy
 * re-checks the destination and the API authorises whatever loads there.
 */
function AccountMenu() {
  const session = useSession();
  const segments = segmentsFor(session.role);
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={container}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full p-0.5 hover:bg-card-muted"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="sr-only">Account menu</span>
        <Avatar name={session.name} size={40} tone="navy" />
        <Icon className="mr-1 text-ink-faint" name="chevron-down" size={16} />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-line bg-card p-2 shadow-level2"
          role="menu"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold text-ink">{session.name}</p>
            <p className="truncate text-xs text-ink-muted">
              {session.affiliation}
            </p>
            <span className="label-caps mt-2 inline-flex rounded-full bg-navy-soft px-2.5 py-1 text-navy">
              {ROLE_LABEL[session.role]}
            </span>
          </div>

          {segments.length > 1 ? (
            <div className="mt-1 border-t border-line pt-2">
              <p className="label-caps px-3 pb-1 text-ink-faint">Switch view</p>
              {segments.map((segment) => (
                <Link
                  className="flex items-center gap-2 rounded-[0.5rem] px-3 py-2 text-sm font-semibold text-ink-muted capitalize hover:bg-card-muted hover:text-ink"
                  href={`/${segment}`}
                  key={segment}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                >
                  <Icon name="arrow-right" size={16} />
                  {segment.replace("_", " ")}
                </Link>
              ))}
            </div>
          ) : null}

          <form action={signOut} className="mt-1 border-t border-line pt-2">
            <button
              className="flex w-full items-center gap-2 rounded-[0.5rem] px-3 py-2 text-left text-sm font-semibold text-danger hover:bg-danger-wash"
              role="menuitem"
              type="submit"
            >
              <Icon name="lock" size={16} />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur lg:px-8">
      <button
        aria-label="Open navigation"
        className="flex size-10 items-center justify-center rounded-[0.5rem] text-ink-muted hover:bg-card-muted lg:hidden"
        onClick={onMenu}
        type="button"
      >
        <Icon name="dashboard" size={20} />
      </button>

      <label className="relative flex max-w-xl flex-1 items-center">
        <Icon
          className="pointer-events-none absolute left-4 text-ink-faint"
          name="search"
          size={18}
        />
        <span className="sr-only">Search JanMaang</span>
        <input
          className="h-11 w-full rounded-full border border-line bg-card-muted pr-4 pl-11 text-sm text-ink placeholder:text-ink-faint focus:border-navy focus:bg-card focus:outline-none"
          placeholder="Search projects, challenges, peers…"
          type="search"
        />
      </label>

      <div className="ml-auto flex items-center gap-1">
        {(["bell", "apps", "help"] as const).map((name) => (
          <button
            aria-label={name}
            className="hidden size-10 items-center justify-center rounded-full text-ink-muted hover:bg-card-muted hover:text-ink sm:flex"
            key={name}
            type="button"
          >
            <Icon name={name} size={20} />
          </button>
        ))}
        <span className="mx-2 hidden h-7 w-px bg-line sm:block" />
        <LanguageSwitcher />
        <AccountMenu />
      </div>
    </header>
  );
}

export function AppShell({
  nav,
  action,
  children,
}: {
  nav: NavItem[];
  action?: NavAction;
  children: React.ReactNode;
}) {
  const session = useSession();
  const home = ROLE_HOME[session.role];
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 shrink-0 border-r border-line bg-surface lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarBody action={action} home={home} nav={nav} />
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className="relative h-full w-72 border-r border-line bg-surface shadow-level2">
            <SidebarBody
              action={action}
              home={home}
              nav={nav}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
