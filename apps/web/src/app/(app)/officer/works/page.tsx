import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import {
  DataTable,
  FilterBar,
  Panel,
  Readout,
  SeverityChip,
  StatusChip,
  type Column,
} from "@/features/gov/components";
import { LIFECYCLE } from "@/features/gov/data";
import {
  POSTING,
  UPDATE_STATE,
  WORKS,
  type OfficerWork,
} from "@/features/gov/officer";

export const metadata: Metadata = { title: "Assigned Works" };

const COLUMNS: Column<OfficerWork>[] = [
  {
    key: "severity",
    header: "Severity",
    cell: (row) => <SeverityChip severity={row.severity} />,
  },
  {
    key: "id",
    header: "Work",
    cell: (row) => (
      <Link
        className="mono-data text-navy hover:underline"
        href={`/officer/works/${row.id}`}
      >
        #{row.id}
      </Link>
    ),
  },
  {
    key: "title",
    header: "Title & agency",
    className: "min-w-[20rem]",
    cell: (row) => (
      <Link className="group block" href={`/officer/works/${row.id}`}>
        <span className="font-semibold text-ink group-hover:underline">
          {row.title}
        </span>
        <span className="mt-0.5 block text-xs text-ink-faint">
          {row.agency}
        </span>
      </Link>
    ),
  },
  {
    key: "location",
    header: "Panchayat / block",
    cell: (row) => (
      <span className="text-sm text-ink-muted">
        {row.panchayat}
        <span className="block text-xs text-ink-faint">{row.block} block</span>
      </span>
    ),
  },
  {
    key: "progress",
    header: "Progress",
    className: "min-w-[10rem]",
    cell: (row) => (
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted">Stage {row.stage}/8</span>
          <span className="mono-data text-ink">{row.percent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-line">
          <div
            className="h-full rounded-full bg-impact"
            style={{ width: `${row.percent}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    key: "funds",
    header: "Released / sanctioned",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink">
        {row.released}
        <span className="block text-xs text-ink-faint">{row.sanctioned}</span>
      </span>
    ),
  },
  {
    key: "update",
    header: "Next update",
    cell: (row) => (
      <StatusChip tone={UPDATE_STATE[row.updateState].tone}>
        {UPDATE_STATE[row.updateState].label}
      </StatusChip>
    ),
  },
  {
    key: "due",
    header: "Due",
    align: "right",
    cell: (row) => <span className="mono-data text-ink-faint">{row.due}</span>,
  },
];

/** Summary figures, derived from the register rather than kept alongside it. */
const open = WORKS.filter((work) => work.updateState !== "closed");
const overdue = WORKS.filter((work) => work.updateState === "overdue").length;
const avgProgress = Math.round(
  open.reduce((sum, work) => sum + work.percent, 0) / open.length,
);
const executionStage = LIFECYCLE.find((stage) => stage.owner === "Officer");

export default function AssignedWorksPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="label-caps mb-2 flex items-center gap-2 text-ink-faint">
            <span>Field Desk</span>
            <Icon name="chevron-right" size={12} />
            <span>Assigned works</span>
          </nav>
          <h1 className="headline-xl text-ink">Assigned works register</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            Every work the district has released to {POSTING.badge} for
            execution. Open a work to see its milestones and fund tranches, and
            to post the field update the next tranche depends on.
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

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Readout
          label="Open works"
          note={`Stage ${executionStage?.n} · ${executionStage?.name}`}
          value={`${open.length}`}
        />
        <Readout
          label="Updates overdue"
          note="Past the weekly window"
          tone={overdue > 0 ? "danger" : undefined}
          value={`${overdue}`}
        />
        <Readout
          label="Average progress"
          note="Across open works"
          value={`${avgProgress}%`}
        />
        <Readout
          label="Closed this FY"
          note="With citizen OTP sign-off"
          value="11"
        />
      </section>

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <FilterBar
            active="All assigned"
            filters={[
              "All assigned",
              "Update overdue",
              "Field execution",
              "Awaiting sign-off",
              "Closed",
            ]}
          />
          <span className="text-xs text-ink-faint">Sorted by work number</span>
        </div>

        <DataTable
          caption="Works assigned to this officer"
          columns={COLUMNS}
          rowKey={(row) => row.id}
          rows={WORKS}
        />

        <div className="border-t border-line px-5 py-3 text-xs text-ink-faint">
          Showing {WORKS.length} works across{" "}
          {new Set(WORKS.map((work) => work.block)).size} blocks.
        </div>
      </Panel>
    </div>
  );
}
