import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import {
  Callout,
  DataTable,
  Legend,
  Panel,
  Readout,
  StatusChip,
  type Column,
} from "@/features/gov/components";
import {
  DEPARTMENT_FUNDS,
  PENDING_SANCTIONS,
  type DepartmentFunds,
} from "@/features/gov/admin";

export const metadata: Metadata = { title: "Funding & Sanctions" };

const crore = (value: number) => `₹${value.toFixed(1)} Cr`;
const pct = (part: number, whole: number) => Math.round((part / whole) * 100);

const COLUMNS: Column<DepartmentFunds>[] = [
  {
    key: "department",
    header: "Department",
    className: "min-w-[16rem]",
    cell: (row) => (
      <span className="font-semibold text-ink">{row.department}</span>
    ),
  },
  {
    key: "allocated",
    header: "Allocated",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink">{crore(row.allocated)}</span>
    ),
  },
  {
    key: "released",
    header: "Released",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink">
        {crore(row.released)}
        <span className="block text-xs text-ink-faint">
          {pct(row.released, row.allocated)}% of allocation
        </span>
      </span>
    ),
  },
  {
    key: "utilised",
    header: "Utilised",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink">
        {crore(row.utilised)}
        <span className="block text-xs text-ink-faint">
          {pct(row.utilised, row.released)}% of release
        </span>
      </span>
    ),
  },
  {
    key: "bar",
    header: "Allocated → released → utilised",
    className: "min-w-[14rem]",
    cell: (row) => (
      <div className="relative h-4 rounded-sm bg-card-muted">
        <span
          className="absolute inset-y-0 left-0 rounded-sm bg-navy-soft"
          style={{ width: `${pct(row.released, row.allocated)}%` }}
        />
        <span
          className="absolute inset-y-0 left-0 rounded-sm bg-navy"
          style={{ width: `${pct(row.utilised, row.allocated)}%` }}
        />
      </div>
    ),
  },
];

/**
 * Money, by the two questions the state desk is asked about it: is it
 * reaching the departments, and is it being spent once it gets there.
 * Sanctions above the district ceiling sit underneath, because approving one
 * is the decision this screen exists to inform.
 *
 * Approve and return are static until the funding module's sanction route
 * lands; every other figure is read-only by design.
 */
export default function FundingPage() {
  const totals = DEPARTMENT_FUNDS.reduce(
    (acc, row) => ({
      allocated: acc.allocated + row.allocated,
      released: acc.released + row.released,
      utilised: acc.utilised + row.utilised,
    }),
    { allocated: 0, released: 0, utilised: 0 },
  );

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="label-caps mb-2 flex items-center gap-2 text-ink-faint">
            <span>State Command</span>
            <Icon name="chevron-right" size={12} />
            <span>Funding & sanctions</span>
          </nav>
          <h1 className="headline-xl text-ink">Funding & sanctions</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            FY 2025-26 to date, ₹ crore. Released money that is not utilised
            within 180 days lapses back to the state treasury.
          </p>
        </div>
        <Button icon="download" size="sm" tone="outline">
          Treasury reconciliation (CSV)
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Readout label="Allocated" value={crore(totals.allocated)} />
        <Readout
          label="Released"
          note={`${pct(totals.released, totals.allocated)}% of allocation`}
          value={crore(totals.released)}
        />
        <Readout
          label="Utilised"
          note={`${pct(totals.utilised, totals.released)}% of release`}
          value={crore(totals.utilised)}
        />
        <Readout
          label="Released, not spent"
          note="Lapse risk if held past 180 days"
          tone="danger"
          value={crore(totals.released - totals.utilised)}
        />
      </section>

      <Panel
        action={
          <Legend
            items={[
              { label: "Utilised", tone: "navy" },
              { label: "Released", tone: "soft-navy" },
              { label: "Allocated", tone: "muted" },
            ]}
          />
        }
        bodyClassName="p-0"
        caption="By department"
        title="Fund position"
      >
        <DataTable
          caption="Department fund position"
          columns={COLUMNS}
          rowKey={(row) => row.department}
          rows={DEPARTMENT_FUNDS}
        />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          bodyClassName="space-y-3"
          caption="Above ₹25 L district ceiling"
          title="Sanctions awaiting state approval"
        >
          {PENDING_SANCTIONS.map((sanction) => (
            <article
              className="rounded-sm border border-line p-4"
              key={sanction.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="mono-data text-ink-muted">
                    #{sanction.id}
                  </span>
                  <StatusChip tone="navy">{sanction.department}</StatusChip>
                </div>
                <span className="headline-md text-ink tabular-nums">
                  {sanction.amount}
                </span>
              </div>
              <h2 className="mt-2 text-sm font-bold text-ink">
                {sanction.title}
              </h2>
              <p className="mt-1 text-xs text-ink-faint">
                {sanction.district} · recommended by {sanction.recommendedBy} ·
                waiting {sanction.age}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                <Button icon="check" size="sm">
                  Approve sanction
                </Button>
                <Button icon="arrow-left" size="sm" tone="outline">
                  Return with query
                </Button>
                <Button icon="eye" size="sm" tone="ghost">
                  Open docket
                </Button>
              </div>
            </article>
          ))}
        </Panel>

        <div className="flex flex-col gap-4">
          <Callout title="Two-key release" tone="navy">
            A state sanction releases nothing by itself. The department&rsquo;s
            DDO raises the first tranche against it, and both signatures are on
            the audit record.
          </Callout>
          <Callout title="CSR co-funding" tone="impact">
            Sanctions with an industry pledge attached show the pledge as a
            separate line. The state share is what this desk approves.
          </Callout>
          <Callout title="Lapse watch" tone="danger">
            Health and Water Resources hold the largest unspent release relative
            to allocation. Both are on the Q2 review agenda.
          </Callout>
        </div>
      </div>
    </div>
  );
}
