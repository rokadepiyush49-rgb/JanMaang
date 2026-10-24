import { redirect } from "next/navigation";

import { SessionProvider } from "@/lib/auth/session-context";
import { getSession } from "@/lib/auth/session.server";

/**
 * Session boundary for every role segment.
 *
 * The proxy already redirects a signed-out visitor, so reaching this without a
 * session means the proxy was bypassed or its matcher has a hole. Checking
 * again here costs nothing and means a rendered dashboard always had a valid
 * cookie behind it.
 *
 * Deliberately no chrome: `(app)/student/(shell)` owns the sidebar, and
 * `(app)/student/(focus)` opts out of it. Roles differ enough in navigation
 * that forcing one frame on all of them here would be the wrong seam.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
