import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button, ButtonLink } from "@/components/ui";
import {
  AreaChart,
  BarRow,
  Callout,
  Donut,
  MetricTile,
  Panel,
  Readout,
  StatusChip,
} from "@/features/gov/components";
import { greeting } from "@/features/gov/data";
import {
  AUDIT_EVENTS,
  DISTRICTS,
  ESCALATIONS,
  KPIS,
  PENDING_SANCTIONS,
  RELEASE_MONTHS,
  RELEASE_SERIES,
  SCHEMES,
  STATE,
} from "@/features/gov/admin";
import { getSession } from "@/lib/auth/session.server";

export const metadata: Metadata = { title: "State Command" };

/**
 * Government Admin dashboard — the whole state on one screen.
 *
 * ISOLATION RULE: nothing under (app)/admin may import from another role
 * segment. That keeps Super Admin extractable into its own deployment if a
 * government security review ever requires network isolation. Screens compose
 * from src/features/* and src/components/* only.
 *
 * The district is the unit throughout. The desk does not act on individual
 * demands — that is the district's job — it acts on districts that are
 * falling behind, sanctions above the district ceiling, and audit flags.
 */
export default async function StateCommandPage() {
  const session = await getSession();
  const byResolution = [...DISTRICTS].sort((a, b) => b.resolved - a.resolved);
  const leaders = byResolution.slice(0, 5);
  const laggards = byResolution.slice(-5).reverse();
  const flagged = AUDIT_EVENTS.filter((event) => event.flagged);
  const released = RELEASE_SERIES.reduce((sum, value) => sum + value, 0);

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      {/* --------------------------------------------------------- banner -- */}
      <section className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps rounded-sm bg-primary px-2.5 py-1 text-white">
                {STATE.desk}
              </span>
              <StatusChip icon="map" tone="navy">
                {STATE.name} · {STATE.districts} districts
              </StatusChip>
              <span className="text-xs text-ink-faint">
                {STATE.blocks} blocks ·{" "}
                {STATE.panchayats.toLocaleString("en-IN")} panchayats ·{" "}
                {STATE.villages.toLocaleString("en-IN")} villages
              </span>
            </div>
            <h1 className="headline-xl mt-4 text-ink">
              {greeting()}, {session?.name ?? STATE.department}
            </h1>
            <p className="headline-md mt-1 text-ink-muted">
              {STATE.department}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Every district&rsquo;s demand pipeline, fund position and audit
              trail in one place. Districts sanction below the ₹25 L ceiling on
              their own; anything above it, and every audit flag, lands on this
              desk.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 xl:items-end">
            <StatusChip icon="refresh" tone="muted">
              As of {STATE.asOf}
            </StatusChip>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/admin/funding" icon="banknote" size="sm">
                {PENDING_SANCTIONS.length} sanctions awaiting you
              </ButtonLink>
              <Button icon="download" size="sm" tone="outline">
                State report (PDF)
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- KPIs -- */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <MetricTile key={kpi.label} {...kpi} />
        ))}
      </section>

      {/* ------------------------------------------- league + escalations -- */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          action={
            <ButtonLink
              href="/admin/districts"
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              All districts
            </ButtonLink>
          }
          caption="Resolution rate"
          title="District league"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="label-caps mb-3 flex items-center gap-1.5 text-impact-deep">
                <Icon name="trending-up" size={14} /> Leading
              </p>
              <div className="space-y-3">
                {leaders.map((district) => (
                  <BarRow
                    key={district.name}
                    label={district.name}
                    percent={district.resolved}
                    tone="impact"
                    value={`${district.medianDays}d`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="label-caps mb-3 flex items-center gap-1.5 text-danger">
                <Icon name="trending-down" size={14} /> Needs attention
              </p>
              <div className="space-y-3">
                {laggards.map((district) => (
                  <BarRow
                    key={district.name}
                    label={district.name}
                    percent={district.resolved}
                    tone="danger"
                    value={`${district.medianDays}d`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-faint">
            Bar: share of verified demands resolved with citizen sign-off.
            Figure: median days from verification to sign-off.
          </p>
        </Panel>

        <Panel
          bodyClassName="space-y-3"
          caption="Escalated"
          title="District alerts"
        >
          {ESCALATIONS.map((item) => (
            <Callout
              key={item.district}
              title={`${item.district} · ${item.title}`}
              tone={item.tone}
            >
              {item.body}
            </Callout>
          ))}
        </Panel>
      </div>

      {/* --------------------------------------------------------- funds --- */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          action={
            <ButtonLink
              href="/admin/funding"
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              Funding
            </ButtonLink>
          }
          caption="FY 2025-26"
          title="Monthly state release"
        >
          <AreaChart height={150} series={RELEASE_SERIES} tone="navy" />
          <div className="mt-2 flex justify-between">
            {RELEASE_MONTHS.map((month) => (
              <span className="text-[10px] text-ink-faint" key={month}>
                {month}
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Readout
              label="Released Apr–Sep"
              value={`₹${released.toFixed(1)} Cr`}
            />
            <Readout
              label="September"
              note="Highest month this FY"
              value={`₹${RELEASE_SERIES.at(-1)?.toFixed(1)} Cr`}
            />
            <Readout
              label="Lapse risk"
              note="Unspent > 180 days"
              tone="danger"
              value="₹18.4 Cr"
            />
          </div>
        </Panel>

        <Panel caption="Source of funds" title="Release by scheme">
          <Donut
            centreLabel="₹ Cr released"
            centreValue={released.toFixed(0)}
            segments={SCHEMES.map((scheme) => ({
              label: scheme.name,
              share: scheme.share,
              tone: scheme.tone,
            }))}
          />
        </Panel>
      </div>

      {/* --------------------------------------------- sanctions + audit --- */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          action={
            <ButtonLink
              href="/admin/funding"
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              Review
            </ButtonLink>
          }
          bodyClassName="space-y-3"
          caption="Above ₹25 L ceiling"
          title="Sanctions awaiting state approval"
        >
          {PENDING_SANCTIONS.slice(0, 3).map((sanction) => (
            <article
              className="rounded-sm border border-line p-4"
              key={sanction.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="mono-data text-ink-muted">#{sanction.id}</span>
                <span className="mono-data text-ink">{sanction.amount}</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-ink">
                {sanction.title}
              </h3>
              <p className="mt-1 text-xs text-ink-faint">
                {sanction.district} · {sanction.department} · waiting{" "}
                {sanction.age}
              </p>
            </article>
          ))}
        </Panel>

        <Panel
          action={
            <ButtonLink
              href="/admin/audit"
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              Audit log
            </ButtonLink>
          }
          bodyClassName="space-y-3"
          caption="Automated checks"
          title="Audit flags"
        >
          {flagged.map((event) => (
            <article
              className="rounded-sm border border-danger/30 bg-danger-wash p-4"
              key={event.hash}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="mono-data text-ink-muted">
                  {event.action} · {event.record}
                </span>
                <span className="mono-data text-ink-faint">{event.at}</span>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-danger">
                <Icon className="mt-0.5 shrink-0" name="warning" size={14} />
                {event.flagged}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {event.actor} · {event.scope}
              </p>
            </article>
          ))}
        </Panel>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-line bg-card p-5 shadow-level1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-navy-soft text-navy">
          <Icon name="lock" size={20} />
        </span>
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-ink-muted">
          Every approval on this desk is written to the hash-chained audit log
          with your credential. Figures are aggregated from district returns;
          drill into a district to see the dockets behind them.
        </p>
        <Link
          className="text-xs font-semibold text-navy hover:underline"
          href="/admin/users"
        >
          Users & roles
        </Link>
      </div>
    </div>
  );
}
