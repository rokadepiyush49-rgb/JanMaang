import { AppShell } from "@/components/layout/shell";
import { NAV } from "@/features/industry/data";

/**
 * Industry collaboration portal chrome.
 *
 * Like `/department` and unlike `/student`, every screen in this segment wants
 * the same rail — the proposal builder is a panel inside a dossier, not a
 * full-bleed wizard, so there is nothing here that needs to opt out of it.
 */
export default function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      action={{ href: "/industry/discover", label: "Explore opportunities" }}
      nav={NAV}
    >
      {children}
    </AppShell>
  );
}
