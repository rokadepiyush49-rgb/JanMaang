import { AppShell } from "@/components/layout/shell";
import { NAV } from "@/features/gov/admin";

/**
 * State Oversight chrome, shared by Government Admin and Super Admin.
 *
 * ISOLATION RULE: like every file under (app)/admin, this imports from
 * `components/` and `features/` only, never from another role segment, so the
 * segment can be lifted into its own network-isolated deployment.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      action={{ href: "/admin/funding", label: "Review sanctions" }}
      nav={NAV}
    >
      {children}
    </AppShell>
  );
}
