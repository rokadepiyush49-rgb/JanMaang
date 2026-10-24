import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button, ButtonLink } from "@/components/ui";
import {
  Callout,
  MetricTile,
  Panel,
  PipelineStrip,
  SeverityChip,
  StatusChip,
} from "@/features/gov/components";
import { greeting } from "@/features/gov/data";
import {
  ALERTS,
  KPIS,
  POSTING,
  TODAY,
  UPDATE_STATE,
  WORKS,
} from "@/features/gov/officer";
import { getSession } from "@/lib/auth/session.server";

export const metadata: Metadata = { title: "Field Desk" };

/**
 * Department Officer dashboard — stage 7 of the lifecycle.
 *
 * Ordered by what the officer owes rather than what they own: overdue
 * updates first, today's route second, the full portfolio last. A district EE
 * reads the same works as red or green on their own screen, so the order here
 * is the order in which this desk changes that colour.
 */
export default async function OfficerHomePage() {
  const session = await getSession();
  const open = WORKS.filter((work) => work.updateState !== "closed");
  const owed = open
    .filter(
      (work) => work.updateState === "overdue" || work.updateState === "due",
    )
    .sort((a, b) =>
      a.updateState === b.updateState
        ? 0
        : a.updateState === "overdue"
          ? -1
          : 1,
    );

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      {/* --------------------------------------------------------- banner -- */}
      <section className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps rounded-sm bg-primary px-2.5 py-1 text-white">
                Stage 07 · Field Execution
              </span>
              <StatusChip icon="map-pin" tone="navy">
                {POSTING.subdivision}
              </StatusChip>
              <span className="mono-data text-ink-faint">{POSTING.badge}</span>
            </div>

            {/* As on the panchayat desk: greet the signed-in user, caption the
                posting. A department head opening this view is not "AE". */}
            <h1 className="headline-xl mt-4 text-ink">
              {greeting()}, {session?.name ?? POSTING.name}
            </h1>
            <p className="headline-md mt-1 text-ink-muted">
              {POSTING.designation} · reports to {POSTING.reportsTo}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Works sanctioned by the district and released to you for
              execution. Every update you post is geo-tagged, shown to the
              citizen who raised the demand, and unlocks the next fund tranche
              once its milestone is witnessed.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 xl:items-end">
            <StatusChip icon="calendar" tone="muted">
              {TODAY.date}
            </StatusChip>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/officer/visits" icon="map-pin" size="sm">
                Today&rsquo;s route
              </ButtonLink>
              <Button icon="download" size="sm" tone="outline">
                Measurement book (PDF)
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

      {/* ----------------------------------------------- owed + alerts ---- */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          action={
            <ButtonLink
              href="/officer/works"
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              All works
            </ButtonLink>
          }
          bodyClassName="space-y-3"
          caption="Your desk"
          title="Updates owed"
        >
          {owed.map((work) => (
            <article
              className={`rounded-sm border p-4 ${
                work.updateState === "overdue"
                  ? "border-danger/40 bg-danger-wash"
                  : "border-line"
              }`}
              key={work.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="mono-data text-ink-muted">#{work.id}</span>
                  <SeverityChip severity={work.severity} />
                </div>
                <StatusChip tone={UPDATE_STATE[work.updateState].tone}>
                  {UPDATE_STATE[work.updateState].label} · {work.nextUpdate}
                </StatusChip>
              </div>
              <h3 className="mt-2 text-sm font-bold text-ink">{work.title}</h3>
              <p className="mt-1 text-xs text-ink-faint">
                {work.panchayat} · {work.block} block · {work.agency}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-impact"
                  style={{ width: `${work.percent}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <span className="text-xs text-ink-muted">
                  {work.percent}% · {work.stageLabel} · last update{" "}
                  {work.lastUpdate}
                </span>
                <ButtonLink
                  href={`/officer/works/${work.id}#update`}
                  size="sm"
                  tone="outline"
                >
                  Post update
                </ButtonLink>
              </div>
            </article>
          ))}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel caption="SLA watch" title="Alerts" bodyClassName="space-y-3">
            {ALERTS.map((alert) => (
              <Callout key={alert.title} title={alert.title} tone={alert.tone}>
                <p>{alert.body}</p>
                <Link
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy hover:underline"
                  href={`/officer/works/${alert.workId}`}
                >
                  Open docket <Icon name="arrow-right" size={12} />
                </Link>
              </Callout>
            ))}
          </Panel>

          <Panel
            action={
              <ButtonLink
                href="/officer/visits"
                iconAfter="arrow-right"
                size="sm"
                tone="outline"
              >
                Week
              </ButtonLink>
            }
            caption={TODAY.date}
            title="Today's site visits"
          >
            <ol className="space-y-3">
              {TODAY.visits.map((visit) => (
                <li
                  className={`rounded-sm border-l-[3px] p-3 ${
                    visit.state === "next"
                      ? "border-l-impact bg-impact-wash"
                      : visit.state === "done"
                        ? "border-l-line-strong bg-card-muted"
                        : "border-l-navy bg-navy-soft/30"
                  }`}
                  key={visit.time}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="mono-data text-ink">{visit.time}</span>
                    <span className="mono-data text-ink-faint">
                      #{visit.workId} · {visit.distance}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {visit.site}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {visit.purpose}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      <PipelineStrip
        heading="Where this desk sits in the demand chain"
        youAt="Ground Audit"
      />

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-line bg-card p-5 shadow-level1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-navy-soft text-navy">
          <Icon name="shield" size={20} />
        </span>
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-ink-muted">
          {open.length} works are open against your posting. Field updates are
          signed with your officer credential and written to the audit log the
          state oversight desk reads — they cannot be edited once posted, only
          superseded.
        </p>
        <Link
          className="text-xs font-semibold text-navy hover:underline"
          href="/officer/works"
        >
          Open works register
        </Link>
      </div>
    </div>
  );
}
