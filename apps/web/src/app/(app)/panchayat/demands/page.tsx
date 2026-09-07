import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import {
  DataTable,
  FilterBar,
  Panel,
  SeverityChip,
  StatusChip,
  type Column,
  type Tone,
} from "@/features/gov/components";
import { BLOCK, SEVERITY_ORDER } from "@/features/gov/data";
import { DEMANDS, type Demand } from "@/features/gov/panchayat";

export const metadata: Metadata = { title: "Demand Register" };

/** Lifecycle state → chip tone. Escalated is deliberately not "done". */
const STATE_TONE: Record<Demand["state"], Tone> = {
  "Awaiting verification": "danger",
  "Verified — escalated": "community",
  Sanctioned: "navy",
  "Work in progress": "navy",
  Closed: "impact",
};

const COLUMNS: Column<Demand>[] = [
  {
    key: "severity",
    header: "Severity",
    cell: (row) => <SeverityChip severity={row.severity} />,
  },
  {
    key: "id",
    header: "Demand",
    cell: (row) => <span className="mono-data text-ink-muted">#{row.id}</span>,
  },
  {
    key: "title",
    header: "Title & category",
    className: "min-w-[20rem]",
    cell: (row) => (
      <span className="block">
        <span className="font-semibold text-ink">{row.title}</span>
        <span className="mt-0.5 block text-xs text-ink-faint">
          {row.category}
        </span>
      </span>
    ),
  },
  {
    key: "ward",
    header: "Ward",
    cell: (row) => <span className="text-sm text-ink-muted">{row.ward}</span>,
  },
  {
    key: "reporter",
    header: "Raised by",
    cell: (row) => (
      <span className="text-xs text-ink-muted">
        {row.reporter}
        <span className="mt-0.5 block text-ink-faint">
          {row.reports} reports merged
        </span>
      </span>
    ),
  },
  {
    key: "state",
    header: "Stage",
    cell: (row) => (
      <StatusChip tone={STATE_TONE[row.state]}>{row.state}</StatusChip>
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

const COUNTS = SEVERITY_ORDER.map((severity) => ({
  severity,
  count: DEMANDS.filter((demand) => demand.severity === severity).length,
}));

export default function DemandRegisterPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="label-caps mb-2 flex items-center gap-2 text-ink-faint">
            <span>{BLOCK.panchayat}</span>
            <Icon name="chevron-right" size={12} />
            <span>Demand register</span>
          </nav>
          <h1 className="headline-xl text-ink">Panchayat demand register</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            Every demand raised from within this panchayat, at whatever stage it
            has reached — from a voice note recorded this morning to a work
            already signed off by the citizens who asked for it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon="filter" size="sm" tone="outline">
            Filter by ward
          </Button>
          <Button icon="download" size="sm" tone="outline">
            Export for Gram Sabha
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COUNTS.map(({ severity, count }) => (
          <div
            className="rounded-md border border-line bg-card p-4 shadow-level1"
            key={severity}
          >
            <SeverityChip severity={severity} withCode />
            <p className="headline-xl mt-3 text-ink tabular-nums">{count}</p>
            <p className="mt-1 text-xs text-ink-muted">
              demands in this band on the register
            </p>
          </div>
        ))}
      </section>

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <FilterBar
            active="All stages"
            filters={[
              "All stages",
              "Awaiting verification",
              "Escalated",
              "Work in progress",
              "Closed",
            ]}
          />
          <span className="text-xs text-ink-faint">Newest first</span>
        </div>

        <DataTable
          caption="Panchayat demand register"
          columns={COLUMNS}
          rowKey={(row) => row.id}
          rows={DEMANDS}
        />

        <div className="border-t border-line px-5 py-3 text-xs text-ink-faint">
          {DEMANDS.length} demands across {BLOCK.wards} wards ·{" "}
          {BLOCK.households.toLocaleString("en-IN")} households served.
        </div>
      </Panel>
    </div>
  );
}
