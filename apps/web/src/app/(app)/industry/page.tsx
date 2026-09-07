import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button, ButtonLink } from "@/components/ui";
import {
  Callout,
  DataTable,
  FilterBar,
  MetricTile,
  Panel,
  SeverityChip,
  StatusChip,
  type Column,
} from "@/features/gov/components";
import { DISTRICT, greeting } from "@/features/gov/data";
import {
  CSR_POOL,
  KPIS,
  OPPORTUNITIES,
  OPPORTUNITY_FILTERS,
  PARTNER,
  TOP_MATCH,
  type Opportunity,
} from "@/features/industry/data";
import {
  FactRow,
  MatchBar,
  PartnerChain,
} from "@/features/industry/components";
import { getSession } from "@/lib/auth/session.server";

export const metadata: Metadata = { title: "Collaboration Hub" };

/**
 * Industry / CSR collaboration hub.
 *
 * The sponsor's counterpart to `/department`: the same triaged demands, ranked
 * by how well they fit this partner's catalogue rather than by which desk owes
 * a sanction. Screens compose from src/features/*, which mirror the backend
 * modules one-for-one.
 */
const COLUMNS: Column<Opportunity>[] = [
  {
    key: "severity",
    header: "Severity",
    cell: (row) => <SeverityChip severity={row.severity} />,
  },
  {
    key: "problem",
    header: "Problem & code",
    className: "min-w-[18rem]",
    cell: (row) => (
      <div>
        <span className="font-semibold text-ink">{row.title}</span>
        <span className="mt-0.5 block text-xs text-ink-faint">
          <span className="mono-data">#{row.problemId}</span> · {row.category}
        </span>
      </div>
    ),
  },
  {
    key: "location",
    header: "Location",
    cell: (row) => (
      <span className="text-sm text-ink-muted">
        {row.block}
        <span className="block text-xs text-ink-faint">{row.place}</span>
      </span>
    ),
  },
  {
    key: "reports",
    header: "Citizen reports",
    align: "right",
    cell: (row) => <StatusChip tone="navy">{row.reports} reports</StatusChip>,
  },
  {
    key: "match",
    header: "AI priority & fit",
    align: "right",
    cell: (row) => (
      <span className="inline-flex flex-col items-end">
        <span className="mono-data text-ink">{row.match}% fit</span>
        <span className="text-xs text-ink-faint">
          {row.confidence}% confidence
        </span>
      </span>
    ),
  },
  {
    key: "lab",
    header: "Matched lab",
    cell: (row) => <span className="text-sm text-ink-muted">{row.lab}</span>,
  },
  {
    key: "action",
    header: "Action",
    align: "right",
    cell: (row) =>
      row.projectId ? (
        <ButtonLink
          href={`/industry/projects/${row.projectId}`}
          size="sm"
          tone="outline"
        >
          {row.cta}
        </ButtonLink>
      ) : (
        <ButtonLink href="/industry/discover" size="sm" tone="ghost">
          {row.cta}
        </ButtonLink>
      ),
  },
];

export default async function IndustryCollaborationHub() {
  const session = await getSession();

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      {/* ------------------------------------------------ partner banner -- */}
      <section className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps rounded-sm bg-primary px-2.5 py-1 text-white">
                {DISTRICT.state} industry network
              </span>
              <StatusChip icon="check-circle" tone="impact">
                CSR compliance verified
              </StatusChip>
              <span className="text-xs text-ink-faint">
                {PARTNER.node} · {PARTNER.fit}% domain fit
              </span>
            </div>

            <h1 className="headline-xl mt-4 text-ink">
              {greeting()}, {session?.name ?? PARTNER.name}
            </h1>
            <p className="headline-md mt-1 text-ink-muted">
              {PARTNER.division} · {PARTNER.hq}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              JanMaang clusters real citizen grievances out of the district
              intake, puts them past a sanction desk, and matches your water
              engineering catalogue to the university teams already prototyping
              against them. Every rupee below is tied to a sanctioned docket.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 xl:items-end">
            <div className="rounded-sm border border-line bg-card-muted px-4 py-3 text-right">
              <p className="label-caps text-ink-faint">Active CSR pool</p>
              <p className="headline-md mt-1 text-ink tabular-nums">
                {CSR_POOL.utilised}{" "}
                <span className="text-sm font-medium text-ink-muted">
                  of {CSR_POOL.committed}
                </span>
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {CSR_POOL.utilisedPercent}% deployed across{" "}
                {CSR_POOL.initiatives} initiatives
              </p>
            </div>
            <ButtonLink href="/industry/discover" icon="search">
              Explore opportunities
            </ButtonLink>
          </div>
        </div>
      </section>

      <PartnerChain heading="Where Usha Martin sits in the civic chain" />

      {/* --------------------------------------------------------- KPIs -- */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {KPIS.map((kpi) => (
          <MetricTile key={kpi.label} {...kpi} />
        ))}
      </section>

      {/* ---------------------------------------------------- top match -- */}
      <Panel
        action={
          <StatusChip icon="sparkles" tone="impact">
            Top AI match · {TOP_MATCH.match}%
          </StatusChip>
        }
        caption={TOP_MATCH.queue}
        title={`Incident #${TOP_MATCH.problemId} — highest fit open to sponsorship`}
      >
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityChip severity={TOP_MATCH.severity} withCode />
              <StatusChip icon="shield" tone="navy">
                Sanctioned for action
              </StatusChip>
              <span className="mono-data text-ink-faint">
                Cluster {TOP_MATCH.clusterId} · {TOP_MATCH.projectId}
              </span>
            </div>

            <h3 className="headline-lg mt-3 text-ink">{TOP_MATCH.title}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
              <Icon className="text-ink-faint" name="map-pin" size={14} />
              {TOP_MATCH.place}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {TOP_MATCH.body}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {TOP_MATCH.facts.map((fact) => (
                <FactRow
                  icon={fact.icon}
                  key={fact.label}
                  label={fact.label}
                  note={fact.note}
                  tone="navy"
                  value={fact.value}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink
                href={`/industry/projects/${TOP_MATCH.projectId}`}
                iconAfter="arrow-right"
              >
                View full evidence
              </ButtonLink>
              <ButtonLink
                href={`/industry/projects/${TOP_MATCH.projectId}#proposal`}
                icon="send"
                tone="outline"
              >
                Express interest
              </ButtonLink>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-sm border border-line bg-card-muted p-4">
            <div>
              <p className="label-caps text-ink-faint">
                AI confidence breakdown
              </p>
              <p className="headline-xl mt-1 text-ink tabular-nums">
                {TOP_MATCH.match}%
              </p>
              <p className="text-xs text-ink-muted">
                Match score against your catalogue
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {TOP_MATCH.breakdown.map((row) => (
                <MatchBar
                  key={row.label}
                  label={row.label}
                  percent={row.percent}
                />
              ))}
            </div>
            <Callout title="Why you are seeing this" tone="impact">
              The Collectorate flagged this breach for emergency institutional
              intervention and named a verified water engineering partner. You
              are the nearest one on the register, 18 km from the site.
            </Callout>
          </div>
        </div>
      </Panel>

      {/* -------------------------------------------------------- queue -- */}
      <Panel
        action={
          <StatusChip icon="refresh" tone="impact">
            Live feed connected
          </StatusChip>
        }
        bodyClassName="p-0"
        caption="AI-ranked by severity, citizen impact, recurrence and catalogue fit"
        title="Priority grievances & industry opportunities"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <FilterBar active="All (28)" filters={OPPORTUNITY_FILTERS} />
          <div className="flex gap-2">
            <Button icon="filter" size="sm" tone="outline">
              All domains
            </Button>
            <Button icon="download" size="sm" tone="ghost">
              Export queue
            </Button>
          </div>
        </div>
        <DataTable
          caption="Priority grievances open to industry sponsorship"
          columns={COLUMNS}
          rowKey={(row) => row.problemId}
          rows={OPPORTUNITIES}
        />
        <div className="border-t border-line px-5 py-4">
          <Link
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:underline"
            href="/industry/discover"
          >
            See all 28 matched projects
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </Panel>
    </div>
  );
}
