/**
 * Authenticated shell: navigation, role switcher, session boundary.
 *
 * Shared by all eight role segments. This is the payoff of one application over
 * nine — one shell, one session refresh, one design system, code-split per role
 * so a student never downloads the admin bundle.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="jm-app-shell">
      {/* TODO(layout): sidebar nav driven by the session's role. */}
      <main>{children}</main>
    </div>
  );
}
