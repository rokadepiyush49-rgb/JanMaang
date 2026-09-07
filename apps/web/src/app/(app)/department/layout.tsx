import { AppShell } from "@/components/layout/shell";
import { NAV } from "@/features/gov/department";

/**
 * District Command chrome.
 *
 * Every department screen wants the same rail, so unlike `/student` this
 * segment has no `(shell)` / `(focus)` split — there is no full-bleed wizard
 * here to opt out of it. Add one as a route group if a sanction flow ever
 * needs the whole viewport.
 */
export default function DepartmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      action={{ href: "/department/problems", label: "Triage Queue" }}
      nav={NAV}
    >
      {children}
    </AppShell>
  );
}
