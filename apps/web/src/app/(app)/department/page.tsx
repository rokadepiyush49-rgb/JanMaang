import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button, ButtonLink } from "@/components/ui";
import {
  Callout,
  DataTable,
  MetricTile,
  Panel,
  PipelineStrip,
  Readout,
  SeverityChip,
  StatusChip,
  type Column,
} from "@/features/gov/components";
import { DISTRICT, greeting } from "@/features/gov/data";
import {
  CLUSTERS,
  KPIS,
  OFFICER,
  PROBLEMS,
  PROBLEM_DETAIL,
  type Problem,
} from "@/features/gov/department";
import { getSession } from "@/lib/auth/session.server";

export const metadata: Metadata = { title: "District Command Centre" };

const COLUMNS: Column<Problem>[] = [
  {
    key: "severity",
    header: "Severity",
    cell: (row) => <SeverityChip severity={row.severity} />,
  },
  {
    key: "id",
    header: "ID",
    cell: (row) => <span className="mono-data text-ink-muted">#{row.id}</span>,
  },
  {
    key: "title",
    header: "Title & category",
    className: "min-w-[18rem]",
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
    key: "clustered",
    header: "Clustered",
    align: "right",
    cell: (row) => <StatusChip tone="navy">{row.reports} reports</StatusChip>,
  },
  {
    key: "confidence",
    header: "AI conf.",
    align: "right",
    cell: (row) => (
      <span className="mono-data text-ink">{row.confidence}%</span>
    ),
  },
];

export default async function DistrictCommandPage() {
  const session = await getSession();

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      {/* ------------------------------------------------ command banner -- */}
      <section className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps rounded-sm bg-primary px-2.5 py-1 text-white">
                {DISTRICT.state} State Command
              </span>
              <StatusChip icon="refresh" tone="impact">
                Telemetry synced 3 mins ago
              </StatusChip>
              <span className="text-xs text-ink-faint">
                {DISTRICT.blocks} block nodes active · {DISTRICT.panchayats}{" "}
                panchayats
              </span>
            </div>

            <h1 className="headline-xl mt-4 text-ink">
              {greeting()}, {session?.name ?? OFFICER.name}
            </h1>
            <p className="headline-md mt-1 text-ink-muted">
              {OFFICER.designation} · {OFFICER.division}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Live operational view of citizen demands: automatically triaged,
              deduplicated against every other filing in the district, and
              routed to university research labs and industrial CSR partners
              before they reach your sanction desk.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 xl:items-end">
            <div className="flex items-center gap-1 rounded-sm bg-card-muted p-1">
              {["Today", "This week", "This month", "Range"].map((period) => (
                <span
                  className={
                    period === "Today"
                      ? "rounded-sm bg-card px-3 py-1.5 text-xs font-semibold text-ink shadow-level1"
                      : "px-3 py-1.5 text-xs font-semibold text-ink-muted"
                  }
                  key={period}
                >
                  {period}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button icon="download" size="sm" tone="outline">
                Daily summary PDF
              </Button>
              <Button icon="alert-circle" size="sm" tone="danger">
                District alert
              </Button>
              <ButtonLink
                href="/department/clusters"
                icon="sparkles"
                size="sm"
                tone="impact"
              >
                Run AI cluster batch
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- KPIs -- */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {KPIS.map((kpi) => (
          <MetricTile key={kpi.label} {...kpi} />
        ))}
      </section>

      <PipelineStrip
        heading="Citizen demand to verified civic asset"
        youAt="District Sanction"
      />

      {/* -------------------------------------------- queue + live docket -- */}
      <div className="grid gap-6 2xl:grid-cols-[1.7fr_1fr]">
        <Panel
          action={
            <StatusChip icon="zap" tone="impact">
              Live feed connected
            </StatusChip>
          }
          bodyClassName="p-0"
          caption="Priority queue"
          title="Grievances & clustered incidents"
        >
          <div className="border-b border-line px-5 py-3">
            <p className="text-sm text-ink-muted">
              Ranked by automated vulnerability weighting and geographic
              severity. {PROBLEMS.length} of 326 prioritised tickets shown.
            </p>
          </div>

          <DataTable
            caption="Priority grievances"
            columns={COLUMNS}
            rowKey={(row) => row.id}
            rows={PROBLEMS}
          />

          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
            <span className="text-xs text-ink-faint">
              Showing {PROBLEMS.length} of 326 prioritised tickets
            </span>
            <ButtonLink
              href="/department/problems"
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              Open full register
            </ButtonLink>
          </div>
        </Panel>

        {/* The reference's right-hand triage docket: the single case the
            officer is most likely to act on, expanded in place. */}
        <Panel
          bodyClassName="space-y-4"
          caption="Direct officer triage"
          title={`Case docket #${PROBLEM_DETAIL.id}`}
        >
          <div className="flex flex-wrap gap-2">
            <SeverityChip severity={PROBLEM_DETAIL.severity} withCode />
            <StatusChip tone="danger">
              Severity score {PROBLEM_DETAIL.score}/100
            </StatusChip>
            <StatusChip tone="impact">
              AI confidence {PROBLEM_DETAIL.confidence}%
            </StatusChip>
          </div>

          <h3 className="headline-md text-ink">{PROBLEM_DETAIL.title}</h3>
          <p className="text-sm text-ink-muted">
            Getalsud, Angara block · Sikidiri left-bank distributary, KM 42.4.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Readout
              label="Impact radius"
              note="3 village hamlets"
              value="~2,800"
            />
            <Readout
              label="Economic threat"
              note="Kharif paddy & sugarcane"
              tone="danger"
              value={PROBLEM_DETAIL.synthesis.loss}
            />
          </div>

          <Callout title="Synthesised tactical directive" tone="navy">
            {PROBLEM_DETAIL.synthesis.directive}
          </Callout>

          <div className="space-y-2">
            <p className="label-caps text-ink-faint">
              Quad-helix auto-matched consortium
            </p>
            {[
              {
                kind: "Recommended university",
                name: PROBLEM_DETAIL.academic.name,
                note: `${PROBLEM_DETAIL.academic.distance} · ${PROBLEM_DETAIL.academic.teams} active student teams`,
                match: PROBLEM_DETAIL.academic.match,
                icon: "graduation" as const,
              },
              {
                kind: "Recommended industry partner",
                name: PROBLEM_DETAIL.industry.name,
                note: PROBLEM_DETAIL.industry.body,
                match: PROBLEM_DETAIL.industry.match,
                icon: "factory" as const,
              },
            ].map((partner) => (
              <div
                className="rounded-sm border border-line bg-card-muted p-3"
                key={partner.kind}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                    <Icon name={partner.icon} size={13} />
                    {partner.kind}
                  </span>
                  <StatusChip tone="impact">{partner.match}% match</StatusChip>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-ink">
                  {partner.name}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {partner.note}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-line pt-4">
            <ButtonLink
              className="w-full"
              href={`/department/problems/${PROBLEM_DETAIL.id}`}
              icon="clipboard"
            >
              Open full evidence docket
            </ButtonLink>
            <Button className="w-full" icon="send" tone="outline">
              Dispatch block engineer (Angara)
            </Button>
          </div>
        </Panel>
      </div>

      {/* ------------------------------------------------- cluster strip -- */}
      <Panel
        action={
          <ButtonLink
            href="/department/clusters"
            iconAfter="arrow-right"
            size="sm"
            tone="outline"
          >
            Geo intelligence
          </ButtonLink>
        }
        caption="Active geo-spatial AI clusters"
        title="184 clusters synthesised from 12,486 filings"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CLUSTERS.map((cluster) => (
            <article
              className="rounded-sm border border-line p-4"
              key={cluster.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="mono-data text-ink-muted">#{cluster.id}</span>
                <SeverityChip severity={cluster.severity} withCode />
              </div>
              <h3 className="mt-3 text-sm leading-snug font-semibold text-ink">
                {cluster.title}
              </h3>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-faint">
                <Icon name="map-pin" size={12} />
                {cluster.block} block · {cluster.footprint}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-xs text-ink-muted">
                  {cluster.reports} reports merged
                </span>
                <span className="mono-data text-impact-deep">
                  {cluster.match}% sim.
                </span>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
