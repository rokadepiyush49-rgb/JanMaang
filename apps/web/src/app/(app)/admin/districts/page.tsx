import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import {
  BarRow,
  DataTable,
  FilterBar,
  Panel,
  Readout,
  StatusChip,
  type Column,
} from "@/features/gov/components";
import { inr } from "@/features/gov/data";
import {
  DISTRICTS,
  DIVISIONS,
  STATE,
  type District,
} from "@/features/gov/admin";

export const metadata: Metadata = { title: "Districts" };

const TREND = {
  up: { icon: "trending-up", label: "Improving", tone: "impact" },
  down: { icon: "trending-down", label: "Slipping", tone: "danger" },
  flat: { icon: "minus", label: "Steady", tone: "muted" },
} as const;

const COLUMNS: Column<District>[] = [
  {
    key: "name",
    header: "District",
    className: "min-w-[12rem]",
    cell: (row) => (
      <span>
        <span className="font-semibold text-ink">{row.name}</span>
        <span className="block text-xs text-ink-faint">{row.division}</span>
      </span>
    ),
  },
  {
    key: "demands",
    header: "Demands",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink">{inr(row.demands)}</span>
    ),
  },
  {
    key: "resolved",
    header: "Resolved",
    className: "min-w-[9rem]",
    cell: (row) => (
      <div>
        <span className="mono-data text-ink">{row.resolved}%</span>
        <div className="mt-1.5 h-1.5 rounded-full bg-line">
          <div
            className={`h-full rounded-full ${row.resolved < 50 ? "bg-danger" : "bg-impact"}`}
            style={{ width: `${row.resolved}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    key: "median",
    header: "Median days",
    align: "right",
    cell: (row) => (
      <span
        className={`mono-data ${row.medianDays > 45 ? "text-danger" : "text-ink"}`}
      >
        {row.medianDays}
      </span>
    ),
  },
  {
    key: "utilisation",
    header: "Fund use",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink">{row.utilisation}%</span>
    ),
  },
  {
    key: "breaches",
    header: "SLA breaches",
    align: "right",
    cell: (row) => (
      <StatusChip tone={row.breaches >= 80 ? "danger" : "muted"}>
        {row.breaches}
      </StatusChip>
    ),
  },
  {
    key: "projects",
    header: "Live projects",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink">{row.liveProjects}</span>
    ),
  },
  {
    key: "trend",
    header: "Quarter",
    cell: (row) => {
      const trend = TREND[row.trend];
      return (
        <StatusChip icon={trend.icon} tone={trend.tone}>
          {trend.label}
        </StatusChip>
      );
    },
  },
];

/**
 * Every district on the same ruler.
 *
 * Sorted by resolution rate because that is the figure the citizen feels;
 * the division roll-up underneath stops a single large district (Ranchi,
 * Dhanbad) from hiding the division it sits in.
 */
export default function DistrictsPage() {
  const rows = [...DISTRICTS].sort((a, b) => b.resolved - a.resolved);
  const total = DISTRICTS.reduce((sum, d) => sum + d.demands, 0);
  const breaches = DISTRICTS.reduce((sum, d) => sum + d.breaches, 0);
  const weighted = Math.round(
    DISTRICTS.reduce((sum, d) => sum + d.resolved * d.demands, 0) / total,
  );
  const divisions = DIVISIONS.map((division) => {
    const members = DISTRICTS.filter((d) => d.division === division);
    const demands = members.reduce((sum, d) => sum + d.demands, 0);
    return {
      division,
      districts: members.length,
      resolved: Math.round(
        members.reduce((sum, d) => sum + d.resolved * d.demands, 0) / demands,
      ),
    };
  });

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="label-caps mb-2 flex items-center gap-2 text-ink-faint">
            <span>State Command</span>
            <Icon name="chevron-right" size={12} />
            <span>Districts</span>
          </nav>
          <h1 className="headline-xl text-ink">District performance</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            All {STATE.districts} districts of {STATE.name} on intake,
            resolution, speed and fund use. Red marks a district below 50%
            resolution or above 45 median days.
          </p>
        </div>
        <Button icon="download" size="sm" tone="outline">
          Export (CSV)
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Readout label="Demands, all districts" value={inr(total)} />
        <Readout
          label="Resolved (weighted)"
          note="Weighted by each district's intake"
          value={`${weighted}%`}
        />
        <Readout label="SLA breaches" tone="danger" value={inr(breaches)} />
        <Readout
          label="Districts slipping"
          note="Resolution down on last quarter"
          value={`${DISTRICTS.filter((d) => d.trend === "down").length}`}
        />
      </section>

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <FilterBar
            active="All divisions"
            filters={["All divisions", ...DIVISIONS]}
          />
          <span className="text-xs text-ink-faint">
            Sorted by resolution rate
          </span>
        </div>
        <DataTable
          caption="District performance"
          columns={COLUMNS}
          rowKey={(row) => row.name}
          rows={rows}
        />
      </Panel>

      <Panel caption="Roll-up" title="Resolution by division">
        <div className="space-y-3">
          {divisions.map((row) => (
            <BarRow
              key={row.division}
              label={row.division}
              percent={row.resolved}
              tone={row.resolved < 55 ? "community" : "impact"}
              value={`${row.districts} dist.`}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}
