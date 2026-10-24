import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { Callout, Panel, Readout, StatusChip } from "@/features/gov/components";
import { inr } from "@/features/gov/data";
import {
  ACCESS_REQUESTS,
  PERMISSIONS,
  ROLE_COUNTS,
  ROLE_PERMISSIONS,
} from "@/features/gov/admin";
import { ROLES, ROLE_LABEL } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Users & Roles" };

/**
 * Accounts, access requests and the permission matrix.
 *
 * The matrix is a mirror of the API's `ROLE_PERMISSIONS` (and admin.test.ts
 * fails the build if it drifts). Reading it here is useful; trusting it is
 * not — the API re-checks every permission on every request.
 */
export default function UsersAndRolesPage() {
  const total = ROLE_COUNTS.reduce((sum, row) => sum + row.accounts, 0);
  const active = ROLE_COUNTS.reduce((sum, row) => sum + row.active30d, 0);
  const max = Math.max(...ROLE_COUNTS.map((row) => row.accounts));

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="label-caps mb-2 flex items-center gap-2 text-ink-faint">
            <span>State Command</span>
            <Icon name="chevron-right" size={12} />
            <span>Users & roles</span>
          </nav>
          <h1 className="headline-xl text-ink">Users & roles</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            Web accounts by role, requests waiting for a grant, and what each
            role is allowed to do. Citizens sign in on the mobile app and are
            not counted here.
          </p>
        </div>
        <Button icon="user-plus" size="sm" tone="outline">
          Invite account
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Readout label="Web accounts" value={inr(total)} />
        <Readout
          label="Active, last 30 days"
          note={`${Math.round((active / total) * 100)}% of accounts`}
          value={inr(active)}
        />
        <Readout
          label="Access requests"
          note="Need a sponsor's countersignature"
          value={`${ACCESS_REQUESTS.length}`}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Panel caption="Accounts" title="By role">
          <ul className="space-y-3">
            {ROLE_COUNTS.map((row) => (
              <li
                className="grid grid-cols-[minmax(7rem,9rem)_1fr_auto] items-center gap-3"
                key={row.role}
              >
                <span className="truncate text-sm text-ink">
                  {ROLE_LABEL[row.role]}
                </span>
                <span className="relative h-5 rounded-sm bg-card-muted">
                  <span
                    className="absolute inset-y-0 left-0 rounded-sm bg-navy-soft"
                    style={{ width: `${(row.accounts / max) * 100}%` }}
                  />
                  <span
                    className="absolute inset-y-0 left-0 rounded-sm bg-navy"
                    style={{ width: `${(row.active30d / max) * 100}%` }}
                  />
                </span>
                <span className="mono-data w-16 text-right text-ink-muted">
                  {inr(row.accounts)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-faint">
            Dark: active in the last 30 days. Light: all accounts.
          </p>
        </Panel>

        <Panel
          bodyClassName="space-y-3"
          caption="Pending"
          title="Access requests"
        >
          {ACCESS_REQUESTS.map((request) => (
            <article
              className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line p-4"
              key={request.email}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-ink">
                    {request.name}
                  </span>
                  <StatusChip tone="navy">
                    {ROLE_LABEL[request.requested]}
                  </StatusChip>
                </div>
                <p className="mt-1 truncate text-xs text-ink-muted">
                  {request.email} · {request.scope}
                </p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Sponsor: {request.sponsor} · {request.age} ago
                </p>
              </div>
              <div className="flex gap-2">
                <Button icon="check" size="sm">
                  Grant
                </Button>
                <Button icon="x" size="sm" tone="outline">
                  Decline
                </Button>
              </div>
            </article>
          ))}
        </Panel>
      </div>

      <Panel
        bodyClassName="p-0"
        caption="Mirrors services/api permissions.py"
        title="Role × permission matrix"
      >
        {/* `relative` contains the cells' absolutely positioned sr-only
            labels; without it they escape the scroller and widen the page. */}
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[64rem] border-collapse text-left">
            <caption className="sr-only">
              Permissions granted to each role
            </caption>
            <thead>
              <tr className="border-b-2 border-line-strong bg-card-muted">
                <th
                  className="label-caps sticky left-0 bg-card-muted px-4 py-3 text-ink-muted"
                  scope="col"
                >
                  Permission
                </th>
                {ROLES.map((role) => (
                  <th
                    className="label-caps px-2 py-3 text-center text-ink-muted"
                    key={role}
                    scope="col"
                  >
                    {ROLE_LABEL[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((permission) => (
                <tr
                  className="border-b border-line last:border-0 hover:bg-card-muted"
                  key={permission}
                >
                  <th
                    className="mono-data sticky left-0 bg-card px-4 py-2.5 font-medium text-ink"
                    scope="row"
                  >
                    {permission}
                  </th>
                  {ROLES.map((role) => {
                    const granted = ROLE_PERMISSIONS[role].includes(permission);
                    return (
                      <td className="px-2 py-2.5 text-center" key={role}>
                        {granted ? (
                          <>
                            <Icon
                              className="inline text-impact-deep"
                              name="check"
                              size={16}
                            />
                            <span className="sr-only">Granted</span>
                          </>
                        ) : (
                          <>
                            <span
                              aria-hidden="true"
                              className="text-line-strong"
                            >
                              ·
                            </span>
                            <span className="sr-only">Not granted</span>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Callout title="Granting is not trusting" tone="navy">
        A role grant sets what an account may attempt. Scope — which district,
        department or institute — is attached separately at grant time, and the
        API checks both on every request.
      </Callout>
    </div>
  );
}
