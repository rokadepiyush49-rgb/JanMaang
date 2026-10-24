import { AppShell } from "@/components/layout/shell";
import { NAV } from "@/features/gov/panchayat";

/**
 * Gram Panchayat chrome.
 *
 * Four entries against the department's five: the panchayat verifies and
 * escalates, it does not sanction or commission research, so the AI cluster
 * and analytics screens are deliberately absent rather than shown read-only.
 */
export default function PanchayatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      action={{ href: "/panchayat/verify", label: "Verify demands" }}
      nav={NAV}
    >
      {children}
    </AppShell>
  );
}
