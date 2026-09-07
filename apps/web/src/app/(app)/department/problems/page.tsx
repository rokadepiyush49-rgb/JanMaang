import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import {
  DataTable,
  FilterBar,
  Panel,
  SeverityChip,
  StatusChip,
  type Column,
} from "@/features/gov/components";
import { DOMAINS, SEVERITY, SEVERITY_ORDER } from "@/features/gov/data";
import { PROBLEMS, type Problem } from "@/features/gov/department";

export const metadata: Metadata = { title: "Problem Reports" };

const COLUMNS: Column<Problem>[] = [
  {
    key: "severity",
    header: "Severity",
    cell: (row) => <SeverityChip severity={row.severity} />,
  },
  {
    key: "id",
    header: "Docket",
    cell: (row) => (
      <Link
        className="mono-data text-navy hover:underline"
        href={`/department/problems/${row.id}`}
      >
        #{row.id}
      </Link>
    ),
  },
  {
    key: "title",
    header: "Title & category",
    className: "min-w-[20rem]",
    cell: (row) => (
      <Link className="group block" href={`/department/problems/${row.id}`}>
        <span className="font-semibold text-ink group-hover:underline">
          {row.title}
        </span>
        <span className="mt-0.5 block text-xs text-ink-faint">
          {row.category}
        </span>
      </Link>
    ),
  },
  {
    key: "location",
    header: "Block / village",
    cell: (row) => (
      <span className="text-sm text-ink-muted">
        {row.village}
        <span className="block text-xs text-ink-faint">{row.block} block</span>
      </span>
    ),
  },
  {
    key: "cluster",
    header: "Cluster",
    cell: (row) => (
      <span className="mono-data text-ink-muted">#{row.cluster}</span>
    ),
  },
  {
    key: "reports",
    header: "Merged",
    align: "right",
    cell: (row) => <StatusChip tone="navy">{row.reports}</StatusChip>,
  },
  {
    key: "confidence",
    header: "AI conf.",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink">{row.confidence}%</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <span className="text-xs font-semibold text-ink-muted">{row.status}</span>
    ),
  },
  {
    key: "raised",
    header: "Raised",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink-faint">{row.raised}</span>
    ),
  },
];

/** Severity counts for the summary rail. Derived, never hand-maintained. */
const COUNTS = SEVERITY_ORDER.map((severity) => ({
  severity,
  count: PROBLEMS.filter((problem) => problem.severity === severity).length,
}));

export default function ProblemRegisterPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="label-caps mb-2 flex items-center gap-2 text-ink-faint">
            <span>District Command</span>
            <Icon name="chevron-right" size={12} />
            <span>Problem reports</span>
          </nav>
          <h1 className="headline-xl text-ink">Statutory problem register</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            Every citizen demand that survived deduplication and panchayat
            verification, ordered by the automated vulnerability weighting.
            Sanction, reassign or return a docket from its detail view.
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon="filter" size="sm" tone="outline">
            Advanced filter
          </Button>
          <Button icon="download" size="sm" tone="outline">
            Export register (CSV)
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COUNTS.map(({ severity, count }) => (
          <div
            className="rounded-md border border-line bg-card p-4 shadow-level1"
            key={severity}
          >
            <div className="flex items-center justify-between">
              <SeverityChip severity={severity} withCode />
              <span className="mono-data text-ink-faint">
                SLA {SEVERITY[severity].sla}
              </span>
            </div>
            <p className="headline-xl mt-3 text-ink tabular-nums">{count}</p>
            <p className="mt-1 text-xs text-ink-muted">
              open dockets in this band
            </p>
          </div>
        ))}
      </section>

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <FilterBar
            active="All actionable"
            filters={[
              "All actionable",
              "Critical & high",
              "Awaiting sanction",
              "Field testing",
              "Returned",
            ]}
          />
          <span className="text-xs text-ink-faint">
            Sorted by severity weighting
          </span>
        </div>

        <DataTable
          caption="District problem register"
          columns={COLUMNS}
          rowKey={(row) => row.id}
          rows={PROBLEMS}
        />

        <div className="border-t border-line px-5 py-3 text-xs text-ink-faint">
          Showing {PROBLEMS.length} of 326 open dockets across {DOMAINS.length}{" "}
          statutory domains.
        </div>
      </Panel>
    </div>
  );
}
