import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import {
  Callout,
  DataTable,
  FilterBar,
  Panel,
  Readout,
  StatusChip,
  type Column,
} from "@/features/gov/components";
import { AUDIT_EVENTS, type AuditEvent } from "@/features/gov/admin";
import { ROLE_LABEL } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Audit Log" };

const COLUMNS: Column<AuditEvent>[] = [
  {
    key: "at",
    header: "Time (IST)",
    cell: (row) => <span className="mono-data text-ink-muted">{row.at}</span>,
  },
  {
    key: "actor",
    header: "Actor",
    cell: (row) => (
      <span>
        <span className="font-semibold text-ink">{row.actor}</span>
        <span className="block text-xs text-ink-faint">
          {ROLE_LABEL[row.role]}
        </span>
      </span>
    ),
  },
  {
    key: "action",
    header: "Action",
    cell: (row) => <span className="mono-data text-navy">{row.action}</span>,
  },
  {
    key: "record",
    header: "Record",
    cell: (row) => <span className="mono-data text-ink">{row.record}</span>,
  },
  {
    key: "scope",
    header: "Scope",
    className: "min-w-[10rem]",
    cell: (row) => <span className="text-xs text-ink-muted">{row.scope}</span>,
  },
  {
    key: "check",
    header: "Check",
    className: "min-w-[14rem]",
    cell: (row) =>
      row.flagged ? (
        <span className="flex items-start gap-1.5 text-xs font-semibold text-danger">
          <Icon className="mt-0.5 shrink-0" name="warning" size={13} />
          {row.flagged}
        </span>
      ) : (
        <StatusChip icon="check" tone="impact">
          Passed
        </StatusChip>
      ),
  },
  {
    key: "hash",
    header: "Hash",
    align: "right",
    cell: (row) => <span className="mono-data text-ink-faint">{row.hash}</span>,
  },
];

/**
 * The append-only audit stream across every department.
 *
 * Read-only by construction: there is no edit or delete affordance anywhere
 * on this screen, because there is none in the API. An auditor's only verbs
 * are filter, export and raise a query against a flagged row.
 */
export default function AuditLogPage() {
  const flagged = AUDIT_EVENTS.filter((event) => event.flagged).length;

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="label-caps mb-2 flex items-center gap-2 text-ink-faint">
            <span>State Command</span>
            <Icon name="chevron-right" size={12} />
            <span>Audit log</span>
          </nav>
          <h1 className="headline-xl text-ink">Audit log</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            Every sanction, release, verification, field update and role change
            on the platform, hash-chained so a deleted or altered row breaks
            every hash after it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon="shield" size="sm" tone="outline">
            Verify chain
          </Button>
          <Button icon="download" size="sm" tone="outline">
            Export (CSV)
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Readout label="Events, last 24h" value="4,812" />
        <Readout
          label="Flagged by checks"
          note="Awaiting auditor review"
          tone={flagged > 0 ? "danger" : undefined}
          value={`${flagged}`}
        />
        <Readout
          label="Chain status"
          note="Last verified 09:00 IST"
          value="Intact"
        />
        <Readout
          label="Retention"
          note="Per state record-keeping rules"
          value="10 years"
        />
      </section>

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <FilterBar
            active="All events"
            filters={[
              "All events",
              "Flagged",
              "Funds",
              "Verification",
              "Roles",
            ]}
          />
          <span className="text-xs text-ink-faint">Newest first</span>
        </div>
        <DataTable
          caption="Platform audit log"
          columns={COLUMNS}
          rowKey={(row) => row.hash}
          rows={AUDIT_EVENTS}
        />
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <Callout title="Release before milestone" tone="danger">
          A tranche released before its milestone was witnessed by the field
          officer. Usually a back-dated measurement book.
        </Callout>
        <Callout title="Off-site update" tone="community">
          A field update whose GPS fix is outside the work&rsquo;s boundary.
          Counts as a desk review, never as a site visit.
        </Callout>
        <Callout title="Same hand, two keys" tone="navy">
          One account both verified and sanctioned a docket. The platform blocks
          this going forward; the flag catches historical cases.
        </Callout>
      </div>
    </div>
  );
}
