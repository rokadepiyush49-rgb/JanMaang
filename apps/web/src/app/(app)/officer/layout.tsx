import { AppShell } from "@/components/layout/shell";
import { NAV } from "@/features/gov/officer";

/**
 * Field Officer chrome.
 *
 * Three entries: the officer neither verifies nor sanctions, so the demand
 * register and the AI cluster screens are absent rather than read-only. The
 * filled action is the one thing this desk owes every week — a field update.
 */
export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      action={{ href: "/officer/works", label: "Post field update" }}
      nav={NAV}
    >
      {children}
    </AppShell>
  );
}
