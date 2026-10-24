import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon";
import { Button, EmptyNote } from "@/components/ui";
import {
  LifecycleTrack,
  Panel,
  Readout,
  SeverityChip,
  StatusChip,
} from "@/features/gov/components";
import { LIFECYCLE } from "@/features/gov/data";
import { FieldUpdateForm } from "@/features/gov/field-update-form";
import { DOCKET, UPDATE_STATE, WORKS } from "@/features/gov/officer";

/**
 * One work's execution docket.
 *
 * Only W-2041 carries milestones, tranches and an update history in the
 * fixtures. The other works render the same frame with what they do have and
 * an explicit empty state for the rest — a newly released work genuinely sits
 * like that until its first update, so the screen has to handle it anyway.
 */
export function generateStaticParams() {
  return WORKS.map((work) => ({ id: work.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const work = WORKS.find((entry) => entry.id === id);
  return { title: work ? `#${work.id} · ${work.title}` : "Work docket" };
}

/** "₹5,71,200" → 571200. Fixture amounts are display strings, as the API's
 *  will be; the ratio is the only arithmetic this screen does on them. */
const rupees = (amount: string) => Number(amount.replace(/[^\d]/g, ""));

const MILESTONE_STATE = {
  done: { icon: "check-circle", className: "text-impact-deep" },
  active: { icon: "refresh", className: "text-community-deep" },
  todo: { icon: "calendar", className: "text-ink-faint" },
} as const;

const TRANCHE_STATE = {
  released: { label: "Released", tone: "impact" },
  claimable: { label: "Claimable", tone: "community" },
  locked: { label: "Locked", tone: "muted" },
} as const;

export default async function WorkDocketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = WORKS.find((entry) => entry.id === id);
  if (!work) notFound();

  const docket = DOCKET[work.id];
  const closed = work.updateState === "closed";
  const stages = LIFECYCLE.map((stage) => ({
    n: `0${stage.n}`,
    name: stage.name,
    note: stage.owner,
    date:
      stage.n < work.stage
        ? "Complete"
        : stage.n === work.stage
          ? closed
            ? "Complete"
            : work.stageLabel
          : "Pending",
    state:
      stage.n < work.stage || closed
        ? ("done" as const)
        : stage.n === work.stage
          ? ("active" as const)
          : ("todo" as const),
  }));

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <nav className="label-caps mb-3 flex items-center gap-2 text-ink-faint">
          <span>Field Desk</span>
          <Icon name="chevron-right" size={12} />
          <span>Assigned works</span>
          <Icon name="chevron-right" size={12} />
          <span>#{work.id}</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityChip severity={work.severity} withCode />
              <StatusChip tone={UPDATE_STATE[work.updateState].tone}>
                {UPDATE_STATE[work.updateState].label}
              </StatusChip>
              <StatusChip icon="clipboard" tone="muted">
                Demand #{work.demandId}
              </StatusChip>
            </div>
            <h1 className="headline-xl mt-3 text-ink">{work.title}</h1>
            <p className="mt-2 text-sm text-ink-muted">
              {work.panchayat} · {work.block} block · {work.domain}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Executing agency: {work.agency}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button icon="download" size="sm" tone="outline">
              Sanction order
            </Button>
            <Button icon="file-pen" size="sm" tone="outline">
              Measurement book
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Readout label="Sanctioned" value={work.sanctioned} />
        <Readout
          label="Released to date"
          note={`${Math.round(
            (rupees(work.released) / rupees(work.sanctioned)) * 100,
          )}% of sanction`}
          value={work.released}
        />
        <Readout
          label="Physical progress"
          note={work.stageLabel}
          value={`${work.percent}%`}
        />
        <Readout
          label="Completion due"
          note={`Last update ${work.lastUpdate}`}
          tone={work.updateState === "overdue" ? "danger" : undefined}
          value={work.due}
        />
      </section>

      <Panel caption="Eight-stage lifecycle" title="Where this work stands">
        <LifecycleTrack stages={stages} />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Panel caption="Physical" title="Milestones">
          {docket ? (
            <ol className="space-y-2">
              {docket.milestones.map((milestone) => {
                const state = MILESTONE_STATE[milestone.state];
                return (
                  <li
                    className={`flex items-center gap-3 rounded-sm border p-3 ${
                      milestone.state === "active"
                        ? "border-community/40 bg-community-soft/30"
                        : "border-line"
                    }`}
                    key={milestone.code}
                  >
                    <Icon
                      className={state.className}
                      name={state.icon}
                      size={18}
                    />
                    <span className="mono-data w-8 text-ink-muted">
                      {milestone.code}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-ink">
                      {milestone.name}
                    </span>
                    <span className="mono-data text-ink-faint">
                      {milestone.weight}%
                    </span>
                    <span className="hidden w-28 text-right text-xs text-ink-muted sm:block">
                      {milestone.date}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyNote icon="clipboard">
              Milestones for #{work.id} have not been entered against the BOQ
              yet. The EE&rsquo;s office adds them when the sanction order is
              digitised.
            </EmptyNote>
          )}
        </Panel>

        <Panel caption="Financial" title="Fund tranches">
          {docket ? (
            <ul className="space-y-3">
              {docket.tranches.map((tranche) => {
                const state = TRANCHE_STATE[tranche.state];
                return (
                  <li
                    className="rounded-sm border border-line p-3"
                    key={tranche.name}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {tranche.name}
                      </span>
                      <StatusChip tone={state.tone}>{state.label}</StatusChip>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="text-ink-muted">
                        Releases on: {tranche.condition}
                      </span>
                      <span className="mono-data text-ink">
                        {tranche.amount} · {tranche.share}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyNote icon="banknote">
              Tranche schedule not yet published for #{work.id}. Released to
              date: {work.released} of {work.sanctioned}.
            </EmptyNote>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Panel caption="History" title="Field update log">
          {docket ? (
            <ol className="space-y-4">
              {docket.updates.map((update) => (
                <li
                  className="border-l-[3px] border-l-navy pl-4"
                  key={update.date}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono-data text-ink">{update.date}</span>
                    <StatusChip tone="navy">{update.percent}%</StatusChip>
                    {update.geoVerified ? (
                      <StatusChip icon="map-pin" tone="impact">
                        Geo-verified
                      </StatusChip>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink">
                    {update.note}
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {update.author} · {update.photos} photographs
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyNote icon="message">
              No field updates on record for #{work.id} beyond {work.lastUpdate}
              . Detailed history appears here once the projects API is
              connected.
            </EmptyNote>
          )}
        </Panel>

        <section id="update">
          <Panel caption="Weekly report" title="Post a field update">
            {closed ? (
              <EmptyNote icon="check-circle">
                #{work.id} is closed with citizen sign-off. Corrections go
                through the Executive Engineer.
              </EmptyNote>
            ) : (
              <FieldUpdateForm
                lastPercent={work.percent}
                milestones={
                  docket?.milestones
                    .filter((milestone) => milestone.state !== "done")
                    .map(({ code, name }) => ({ code, name })) ?? []
                }
                workId={work.id}
              />
            )}
          </Panel>
        </section>
      </div>
    </div>
  );
}
