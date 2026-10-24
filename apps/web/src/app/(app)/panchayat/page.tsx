import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button, ButtonLink } from "@/components/ui";
import {
  BarRow,
  MetricTile,
  Panel,
  PipelineStrip,
  SeverityChip,
  StatusChip,
} from "@/features/gov/components";
import { BLOCK, greeting } from "@/features/gov/data";
import {
  DEMANDS,
  FUNDS,
  KPIS,
  MUKHIYA,
  QUEUE,
  SABHA,
  WARDS,
  WORKS,
} from "@/features/gov/panchayat";
import { getSession } from "@/lib/auth/session.server";

export const metadata: Metadata = { title: "Gram Panchayat" };

export default async function PanchayatHomePage() {
  const session = await getSession();
  const overdue = QUEUE.filter((item) => item.overdue).length;

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      {/* --------------------------------------------------------- banner -- */}
      <section className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps rounded-sm bg-primary px-2.5 py-1 text-white">
                {BLOCK.panchayat}
              </span>
              <StatusChip icon="map-pin" tone="navy">
                {BLOCK.name} block · {BLOCK.district}
              </StatusChip>
              <span className="text-xs text-ink-faint">
                {BLOCK.wards} wards · {BLOCK.households.toLocaleString("en-IN")}{" "}
                households
              </span>
            </div>

            {/* The heading greets whoever is signed in; the line under it
                names the *desk* being viewed. A block officer or platform
                admin can open this portal, and captioning them "Mukhiya"
                would be a small lie on every load. */}
            <h1 className="headline-xl mt-4 text-ink">
              {greeting()}, {session?.name ?? MUKHIYA.name}
            </h1>
            <p className="headline-md mt-1 text-ink-muted">
              {MUKHIYA.designation}&rsquo;s desk · {MUKHIYA.block}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Demands raised by residents of this panchayat, clustered by the
              platform and waiting on your ground verification. A demand you
              verify goes to the district sanction desk; one you return goes
              back to the ward member with your note.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 xl:items-end">
            {overdue > 0 ? (
              <StatusChip icon="alert-circle" tone="danger">
                {overdue} demand{overdue > 1 ? "s" : ""} past the 72-hour window
              </StatusChip>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <ButtonLink
                href="/panchayat/verify"
                icon="check-circle"
                size="sm"
              >
                Open verification queue
              </ButtonLink>
              <Button icon="download" size="sm" tone="outline">
                Sabha agenda (PDF)
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

      <PipelineStrip
        heading="Where this panchayat sits in the demand chain"
        youAt="Panchayat Verification"
      />

      {/* -------------------------------------------- queue + wards + funds */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          action={
            <ButtonLink
              href="/panchayat/verify"
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              Open queue
            </ButtonLink>
          }
          bodyClassName="space-y-3"
          caption="Stage 03 · your desk"
          title="Awaiting your verification"
        >
          {QUEUE.map((item) => {
            const done = item.checks.filter((check) => check.done).length;
            return (
              <article
                className={`rounded-sm border p-4 ${
                  item.overdue
                    ? "border-danger/40 bg-danger-wash"
                    : "border-line"
                }`}
                key={item.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="mono-data text-ink-muted">#{item.id}</span>
                    <SeverityChip severity={item.severity} />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      item.overdue ? "text-danger" : "text-ink-faint"
                    }`}
                  >
                    Raised {item.age} ago
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-ink-faint">
                  {item.ward} · {item.reports} citizen reports merged ·{" "}
                  {item.confidence}% AI confidence
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <Icon name="check-circle" size={13} />
                    {done} of {item.checks.length} checks complete
                  </span>
                  <ButtonLink href="/panchayat/verify" size="sm" tone="outline">
                    Review
                  </ButtonLink>
                </div>
              </article>
            );
          })}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel caption="Ward load" title="Open demands by ward">
            <div className="space-y-3">
              {WARDS.map((ward) => (
                <BarRow
                  key={ward.name}
                  label={ward.name}
                  percent={ward.share}
                  tone="community"
                  value={`${ward.open}`}
                />
              ))}
            </div>
          </Panel>

          <Panel caption="Fund position" title="Panchayat budget line">
            <dl className="space-y-2 text-sm">
              {[
                ["Allocated (FY 25-26)", FUNDS.allocated],
                ["Released to date", FUNDS.released],
                ["Utilised", FUNDS.utilised],
              ].map(([label, value]) => (
                <div className="flex justify-between gap-3" key={label}>
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="mono-data text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 h-2 rounded-full bg-line">
              <div
                className="h-full rounded-full bg-impact"
                style={{ width: `${FUNDS.utilisedPercent}%` }}
              />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
              <Icon name="alert-circle" size={13} />
              {FUNDS.unspentDays}
            </p>
          </Panel>
        </div>
      </div>

      {/* ------------------------------------------------- sabha + works --- */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        <Panel caption="Gram Sabha" title="Statutory calendar">
          <ol className="space-y-3">
            {SABHA.map((entry) => (
              <li
                className={`rounded-sm border-l-[3px] p-3 ${
                  entry.state === "next"
                    ? "border-l-impact bg-impact-wash"
                    : entry.state === "done"
                      ? "border-l-line-strong bg-card-muted"
                      : "border-l-navy bg-navy-soft/30"
                }`}
                key={entry.date}
              >
                <p className="mono-data text-ink-faint">{entry.date}</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {entry.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">{entry.note}</p>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel
          action={
            <ButtonLink
              href="/panchayat/works"
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              All works
            </ButtonLink>
          }
          bodyClassName="space-y-3"
          caption="Sanctioned works"
          title="Currently executing in this panchayat"
        >
          {WORKS.slice(0, 3).map((work) => (
            <article
              className="rounded-sm border border-line p-4"
              key={work.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="mono-data text-ink-muted">#{work.id}</span>
                <StatusChip tone={work.percent === 100 ? "impact" : "navy"}>
                  {work.percent}% · stage {work.stage}/8
                </StatusChip>
              </div>
              <h3 className="mt-2 text-sm font-bold text-ink">{work.title}</h3>
              <p className="mt-1 text-xs text-ink-faint">
                {work.ward} · {work.scheme}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-impact"
                  style={{ width: `${work.percent}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-ink-muted">
                  Released{" "}
                  <span className="mono-data text-ink">{work.released}</span> of{" "}
                  <span className="mono-data text-ink">{work.sanctioned}</span>
                </span>
                <span className="text-ink-faint">Due {work.due}</span>
              </div>
            </article>
          ))}
        </Panel>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-line bg-card p-5 shadow-level1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-navy-soft text-navy">
          <Icon name="landmark" size={20} />
        </span>
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-ink-muted">
          {DEMANDS.length} demands are on this panchayat&rsquo;s register this
          quarter. Every verification you record is signed against your Mukhiya
          credential and shown to the citizen who raised the demand.
        </p>
        <Link
          className="text-xs font-semibold text-navy hover:underline"
          href="/panchayat/demands"
        >
          Open demand register
        </Link>
      </div>
    </div>
  );
}
