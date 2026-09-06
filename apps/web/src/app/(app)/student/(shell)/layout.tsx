import { AppShell } from "@/components/layout/shell";
import { NAV } from "@/features/student/data";

/**
 * The everyday student chrome: sidebar, topbar, account menu.
 *
 * Navigation is passed in rather than read inside AppShell, because the shell
 * is shared and the nav is not — when faculty and department segments get
 * their screens they reuse this component with their own list.
 *
 * Sibling group `(focus)` deliberately opts out of this: the collaboration
 * wizard is a full-width flow with its own header, and nesting it inside the
 * sidebar made the step layout unusable. Both groups keep the /student/ URL
 * prefix, which is what the proxy's segment guard reads.
 */
export default function StudentShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      action={{ href: "/student/collaborate/new", label: "New Collaboration" }}
      nav={NAV}
    >
      {children}
    </AppShell>
  );
}
