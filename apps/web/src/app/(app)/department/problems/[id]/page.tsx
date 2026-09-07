import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon";
import { Button, ButtonLink, EmptyNote } from "@/components/ui";
import {
  Callout,
  Panel,
  Readout,
  SeverityChip,
  StatusChip,
} from "@/features/gov/components";
import { SEVERITY } from "@/features/gov/data";
import {
  CLUSTERS,
  MAP_PINS,
  PROBLEMS,
  PROBLEM_DETAIL,
} from "@/features/gov/department";

/**
 * The evidence docket for one problem.
 *
 * Only P-1024 carries a full field bundle in the fixtures — photographs, the
 * Mukhiya's voice note, the AI synthesis. Rather than inventing the same
 * bundle for every other row, the other dockets render the same frame with
 * the panels they genuinely have (register row + AI cluster) and an explicit
 * empty state where evidence has not been uploaded. That is a real state a
 * docket sits in for days, so the screen has to handle it anyway.
 */
export function generateStaticParams() {
  return PROBLEMS.map((problem) => ({ id: problem.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const problem = PROBLEMS.find((entry) => entry.id === id);
  return { title: problem ? `#${problem.id} · ${problem.title}` : "Docket" };
}

const PIN_TONE = {
  problem: "bg-danger",
  university: "bg-navy",
  industry: "bg-impact",
} as const;

function GeoPanel({ focusId }: { focusId: string }) {
  return (
    <Panel
      caption="Geospatial intelligence"
      title="Resource proximity radar"
      action={
        <StatusChip icon="map-pin" tone="navy">
          Cadastral survey · Ranchi–Angara corridor
        </StatusChip>
      }
    >
      {/* A schematic, not a basemap. MapLibre is already a dependency for the
          citizen map; wiring it here needs real coordinates and a tile key, so
          the docket shows relative proximity until those exist. */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-line bg-primary">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full opacity-25"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {[20, 40, 60, 80].map((v) => (
            <line
              key={`h${v}`}
              stroke="#7988b0"
              strokeWidth="0.2"
              x1="0"
              x2="100"
              y1={v}
              y2={v}
            />
          ))}
          {[20, 40, 60, 80].map((v) => (
            <line
              key={`v${v}`}
              stroke="#7988b0"
              strokeWidth="0.2"
              x1={v}
              x2={v}
              y1="0"
              y2="100"
            />
          ))}
          <path
            d="M0,58 C25,48 45,66 70,52 C85,44 94,48 100,44"
            fill="none"
            stroke="#6CF8BB"
            strokeWidth="0.7"
          />
        </svg>

        {MAP_PINS.map((pin) => {
          const focused = pin.id === focusId;
          return (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              key={pin.id}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <span
                className={`block rounded-full ${PIN_TONE[pin.kind]} ${
                  focused ? "size-4 ring-4 ring-danger/30" : "size-2.5"
                }`}
              />
              {focused ? (
                <span className="absolute top-6 left-1/2 w-max max-w-[13rem] -translate-x-1/2 rounded-sm bg-card px-2 py-1 text-[11px] font-semibold text-ink shadow-level2">
                  {pin.label}
                  <span className="block font-normal text-ink-muted">
                    {pin.sub}
                  </span>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {(
          [
            ["problem", "P0/P1 AI cluster"],
            ["university", "University partner"],
            ["industry", "Industry CSR node"],
          ] as const
        ).map(([kind, label]) => (
          <span
            className="flex items-center gap-1.5 text-xs text-ink-muted"
            key={kind}
          >
            <span className={`size-2.5 rounded-full ${PIN_TONE[kind]}`} />
            {label}
          </span>
        ))}
        <span className="mono-data ml-auto text-ink-faint">
          EPSG:3857 · district centroid 23.3441° N, 85.3096° E
        </span>
      </div>
    </Panel>
  );
}

export default async function ProblemDocketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = PROBLEMS.find((entry) => entry.id === id);
  if (!problem) notFound();

  const cluster = CLUSTERS.find((entry) => entry.id === problem.cluster);
  const detail = problem.id === PROBLEM_DETAIL.id ? PROBLEM_DETAIL : null;

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      {/* ------------------------------------------------------- heading -- */}
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <nav className="label-caps flex flex-wrap items-center gap-2 text-ink-faint">
          <span>Problems</span>
          <Icon name="chevron-right" size={12} />
          <span>{problem.category}</span>
          <Icon name="chevron-right" size={12} />
          <span className="text-navy">Docket #{problem.id}</span>
        </nav>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="headline-xl text-ink">{problem.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SeverityChip severity={problem.severity} withCode />
              <StatusChip>{problem.status}</StatusChip>
              <StatusChip icon="zap" tone="impact">
                Fast-track eligible
              </StatusChip>
              <span className="text-xs text-ink-faint">
                {problem.village}, {problem.block} block · raised{" "}
                {problem.raised}
              </span>
            </div>
          </div>

          <div className="flex gap-6">
            <div>
              <p className="label-caps text-ink-faint">Clustered submissions</p>
              <p className="headline-lg mt-1 text-ink tabular-nums">
                {problem.reports}
                <span className="ml-1.5 text-xs font-normal text-ink-muted">
                  telemetry reports
                </span>
              </p>
            </div>
            <div>
              <p className="label-caps text-ink-faint">
                SLA countdown ({SEVERITY[problem.severity].sla})
              </p>
              <p className="headline-lg mt-1 text-danger tabular-nums">
                {detail ? detail.slaRemaining : "—"}
                <span className="ml-1.5 text-xs font-normal text-ink-muted">
                  remaining
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 2xl:grid-cols-[1.7fr_1fr]">
        {/* --------------------------------------------------- left rail -- */}
        <div className="flex flex-col gap-6">
          <Panel
            action={
              detail ? (
                <StatusChip icon="shield" tone="impact">
                  Hash check SHA-256 passed
                </StatusChip>
              ) : null
            }
            caption="Field evidence"
            title="Verified citizen submissions"
          >
            {detail ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {detail.evidence.map((shot) => (
                  <figure
                    className="overflow-hidden rounded-sm border border-line"
                    key={shot.cam}
                  >
                    {/* Geotagged uploads live in object storage; until that
                        bucket is wired the tile shows the metadata that makes
                        the photograph admissible rather than a stock image. */}
                    <div className="relative flex aspect-[4/3] items-center justify-center bg-card-muted">
                      <Icon className="text-line-strong" name="eye" size={28} />
                      <span className="label-caps absolute top-2 left-2 rounded-sm bg-primary px-2 py-1 text-white">
                        {shot.cam}
                      </span>
                    </div>
                    <figcaption className="border-t border-line p-3">
                      <p className="text-sm font-semibold text-ink">
                        {shot.caption}
                      </p>
                      <p className="mono-data mt-1 text-ink-muted">
                        {shot.coords}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-faint">
                        {shot.place}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <EmptyNote icon="upload">
                No field photographs have been uploaded against this docket yet.
                The block engineer is notified when the SLA window opens.
              </EmptyNote>
            )}
          </Panel>

          {detail ? (
            <Panel
              action={
                <StatusChip icon="check-circle" tone="impact">
                  Voiceprint authenticated (98.4%)
                </StatusChip>
              }
              caption="Citizen voice intelligence"
              title="Acoustic verification & translation"
            >
              <div className="flex flex-wrap items-center gap-4 rounded-sm border border-line bg-card-muted p-4">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary text-white">
                  <Icon name="volume-on" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    Audio memo · {detail.voice.speaker}
                  </p>
                  <div className="mt-2 flex h-6 items-end gap-0.5">
                    {[
                      5, 9, 14, 8, 18, 22, 12, 20, 16, 9, 13, 21, 24, 15, 10, 7,
                      12, 18, 11, 6,
                    ].map((height, index) => (
                      <span
                        className={`w-1 rounded-full ${index < 9 ? "bg-impact" : "bg-line-strong"}`}
                        key={index}
                        style={{ height }}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="mono-data text-ink-muted">
                    00:38 / {detail.voice.duration}
                  </p>
                  <p className="label-caps mt-1 text-danger">
                    {detail.voice.urgency}% urgency
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-sm border border-line bg-card-muted p-4">
                  <div className="flex items-center justify-between">
                    <p className="label-caps text-navy">Hindi original</p>
                    <span className="text-[11px] text-ink-faint">
                      Whisper-v3
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink">
                    {detail.voice.original}
                  </p>
                </div>
                <div className="rounded-sm border border-line bg-card-muted p-4">
                  <div className="flex items-center justify-between">
                    <p className="label-caps text-navy">
                      English operational synthesis
                    </p>
                    <span className="text-[11px] text-ink-faint">
                      Auto-verified
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink">
                    {detail.voice.translated}
                  </p>
                </div>
              </div>
            </Panel>
          ) : null}

          <GeoPanel focusId={problem.cluster} />
        </div>

        {/* -------------------------------------------------- right rail -- */}
        <div className="flex flex-col gap-6">
          <Panel
            action={
              detail ? (
                <StatusChip tone="impact">
                  Confidence {detail.confidence}%
                </StatusChip>
              ) : (
                <StatusChip tone="navy">
                  Confidence {problem.confidence}%
                </StatusChip>
              )
            }
            bodyClassName="space-y-4"
            caption="District AI core"
            title="Automated synthesis"
          >
            {detail ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Readout
                    label="Classification"
                    note={detail.synthesis.classification}
                    value="Major breach"
                  />
                  <Readout
                    label="Estimated loss"
                    note={detail.synthesis.lossNote}
                    tone="danger"
                    value={detail.synthesis.loss}
                  />
                  <Readout
                    label="Report aggregation"
                    note={detail.synthesis.aggregationNote}
                    value={detail.synthesis.aggregation}
                  />
                  <Readout
                    label="Hydraulic flow rate"
                    note={detail.synthesis.flowNote}
                    value={detail.synthesis.flow}
                  />
                </div>
                <Callout title="Synthesised tactical directive" tone="navy">
                  {detail.synthesis.directive}
                </Callout>
              </>
            ) : cluster ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Readout
                    label="Impact footprint"
                    note={cluster.population}
                    value={cluster.footprint}
                  />
                  <Readout
                    label="Asset risk"
                    note="Estimated exposure"
                    tone="danger"
                    value={cluster.assetRisk}
                  />
                </div>
                <Callout title="Cluster summary" tone="navy">
                  {cluster.body}
                </Callout>
              </>
            ) : (
              <EmptyNote icon="bot">
                This docket has not been merged into a cluster yet, so no
                synthesis is available.
              </EmptyNote>
            )}
          </Panel>

          <Panel
            action={
              <StatusChip tone="impact">
                {detail ? detail.academic.match : 90}% AI match
              </StatusChip>
            }
            bodyClassName="space-y-3"
            caption="Academic execution partner"
            title={
              detail ? detail.academic.name : (cluster?.partner ?? "Unassigned")
            }
          >
            {detail ? (
              <>
                <p className="text-sm text-ink-muted">{detail.academic.dept}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Readout label="Distance" value={detail.academic.distance} />
                  <Readout
                    label="Teams available"
                    note={`Team ${detail.academic.team}`}
                    value={String(detail.academic.teams)}
                  />
                </div>
                <p className="text-sm text-ink-muted">
                  Faculty lead: {detail.academic.lead}
                </p>
                <StatusChip icon="check-circle" tone="impact">
                  {detail.academic.ready}
                </StatusChip>
              </>
            ) : (
              <p className="text-sm text-ink-muted">
                Candidate partner suggested by the clustering pass. Confirm the
                allotment from the sanction desk below.
              </p>
            )}
          </Panel>

          <Panel
            action={
              <StatusChip tone="impact">
                {detail ? detail.industry.match : 88}% AI match
              </StatusChip>
            }
            bodyClassName="space-y-3"
            caption="Industry CSR & tech partner"
            title={
              detail ? detail.industry.name : (cluster?.sponsor ?? "Unassigned")
            }
          >
            {detail ? (
              <>
                <p className="text-sm text-ink-muted">
                  {detail.industry.location} · {detail.industry.speciality}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip icon="banknote" tone="community">
                    CSR grant {detail.industry.grant}
                  </StatusChip>
                  <StatusChip tone="impact">
                    {detail.industry.grantStatus}
                  </StatusChip>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {detail.industry.body}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-muted">
                CSR sponsor shortlisted from the district panel. No pledge has
                been executed against this docket yet.
              </p>
            )}
          </Panel>

          {/* The only place on the screen where the officer's statutory
              authority is actually exercised. Kept visually last and visually
              separate for that reason. */}
          <Panel
            bodyClassName="space-y-2"
            caption="Statutory authority"
            title="Execution desk"
          >
            <Button className="w-full" icon="check-circle">
              Sanction & assign consortium
            </Button>
            <Button className="w-full" icon="send" tone="outline">
              Dispatch block engineer
            </Button>
            <Button className="w-full" icon="file-pen" tone="outline">
              Issue official sanction order
            </Button>
            <ButtonLink
              className="w-full"
              href="/department/problems"
              icon="arrow-left"
              tone="ghost"
            >
              Back to register
            </ButtonLink>
          </Panel>
        </div>
      </div>
    </div>
  );
}
