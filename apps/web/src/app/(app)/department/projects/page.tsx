import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button, ButtonLink } from "@/components/ui";
import {
  AreaChart,
  FilterBar,
  LifecycleTrack,
  MetricTile,
  Panel,
  ProgressRing,
  StatusChip,
} from "@/features/gov/components";
import {
  PROJECTS,
  PROJECT_KPIS,
  PROJECT_SPOTLIGHT,
} from "@/features/gov/department";

export const metadata: Metadata = { title: "Projects & Tracking" };

const SPOTLIGHT = PROJECT_SPOTLIGHT;

export default function ProjectTrackingPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps rounded-sm bg-primary px-2.5 py-1 text-white">
                JH-RAN-CIVIC-CORP
              </span>
              <span className="text-xs text-ink-faint">
                Statutory public–private–academic triad tracking
              </span>
            </div>
            <h1 className="headline-xl mt-4 text-ink">
              District project implementation & student–industry tracking
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Real-time execution telemetry of university engineering cohorts
              partnered with industrial CSR sponsors to engineer tangible civic
              infrastructural remedies under district supervision.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button icon="download" size="sm" tone="outline">
              Export district audit (PDF)
            </Button>
            <Button icon="plus" size="sm">
              Sanction new project
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PROJECT_KPIS.map((kpi) => (
          <MetricTile key={kpi.label} {...kpi} />
        ))}
      </section>

      <FilterBar
        active="All projects (72)"
        filters={[
          "All projects (72)",
          "In progress (44)",
          "Field testing (18)",
          "Resolved & signed (19)",
          "Needs review (4)",
        ]}
      />

      {/* ------------------------------------------------------ spotlight -- */}
      <Panel
        action={
          <ProgressRing label="Overall progress" percent={SPOTLIGHT.percent} />
        }
        caption={`${SPOTLIGHT.id} · ${SPOTLIGHT.stageLabel}`}
        title={SPOTLIGHT.title}
      >
        <p className="text-sm text-ink-muted">
          {SPOTLIGHT.department} · resolving docket{" "}
          <Link
            className="font-semibold text-navy hover:underline"
            href={`/department/problems/${SPOTLIGHT.problemId}`}
          >
            #{SPOTLIGHT.problemId}
          </Link>
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {[
            {
              caption: "Assigned engineering cohort",
              icon: "graduation" as const,
              title: SPOTLIGHT.cohort.name,
              lines: [SPOTLIGHT.cohort.dept, SPOTLIGHT.cohort.team],
              chip: null,
            },
            {
              caption: "Industry mentor & CSR partner",
              icon: "factory" as const,
              title: SPOTLIGHT.sponsor.name,
              lines: [SPOTLIGHT.sponsor.dept, SPOTLIGHT.sponsor.scope],
              chip: SPOTLIGHT.sponsor.grant,
            },
            {
              caption: "Government sanctioning desk",
              icon: "landmark" as const,
              title: SPOTLIGHT.sanction.office,
              lines: [SPOTLIGHT.sanction.cell, SPOTLIGHT.sanction.by],
              chip: null,
            },
          ].map((card) => (
            <article
              className="rounded-sm border border-line bg-card-muted p-4"
              key={card.caption}
            >
              <p className="label-caps flex items-center gap-1.5 text-ink-faint">
                <Icon name={card.icon} size={13} />
                {card.caption}
              </p>
              <p className="mt-2 text-sm font-bold text-ink">{card.title}</p>
              {card.lines.map((line) => (
                <p className="mt-1 text-xs text-ink-muted" key={line}>
                  {line}
                </p>
              ))}
              {card.chip ? (
                <div className="mt-3">
                  <StatusChip icon="banknote" tone="impact">
                    {card.chip}
                  </StatusChip>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="headline-md flex items-center gap-2 text-ink">
              <Icon name="scale" size={18} />
              Eight-stage collaborative execution lifecycle
            </h3>
            <span className="mono-data text-ink-faint">
              Current stage 06 / 08
            </span>
          </div>
          <LifecycleTrack stages={SPOTLIGHT.stages} />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-sm border border-line p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="text-sm font-bold text-ink">
                Live flow & seepage monitoring
              </h4>
              <div className="text-right">
                <p className="mono-data text-ink">
                  {SPOTLIGHT.telemetry.stabilised}
                </p>
                <p className="text-[11px] text-ink-faint">
                  {SPOTLIGHT.telemetry.sensor} · tolerance{" "}
                  {SPOTLIGHT.telemetry.tolerance}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <p className="label-caps text-ink-faint">
                Water flow velocity (last 12 hours)
              </p>
              <AreaChart series={SPOTLIGHT.telemetry.series} tone="impact" />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {SPOTLIGHT.telemetry.readouts.map((readout) => (
                <div
                  className="rounded-sm bg-card-muted p-2.5 text-center"
                  key={readout.label}
                >
                  <p className="text-[11px] text-ink-faint">{readout.label}</p>
                  <p className="mono-data mt-1 text-ink">{readout.value}</p>
                </div>
              ))}
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
              <Icon name="refresh" size={12} />
              {SPOTLIGHT.telemetry.node}
            </p>
          </div>

          <div className="rounded-sm border border-line p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-ink">
                Field deployment evidence
              </h4>
              <span className="text-[11px] text-ink-faint">
                Updated 3 hrs ago
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                "Sluice fitting & sensor calibration",
                "CAD design #P-1024-REV3",
              ].map((caption) => (
                <figure
                  className="overflow-hidden rounded-sm border border-line"
                  key={caption}
                >
                  <div className="flex aspect-[4/3] items-center justify-center bg-card-muted">
                    <Icon className="text-line-strong" name="eye" size={24} />
                  </div>
                  <figcaption className="border-t border-line px-2 py-1.5 text-[11px] text-ink-muted">
                    {caption}
                  </figcaption>
                </figure>
              ))}
            </div>

            <ul className="mt-3 space-y-1.5">
              {SPOTLIGHT.files.map((file) => (
                <li
                  className="flex items-center gap-2 rounded-sm bg-card-muted px-3 py-2"
                  key={file.name}
                >
                  <Icon
                    className="shrink-0 text-ink-faint"
                    name={file.icon}
                    size={14}
                  />
                  <span className="min-w-0 flex-1 truncate text-xs text-ink">
                    {file.name}
                  </span>
                  <Icon
                    className="shrink-0 text-ink-faint"
                    name="download"
                    size={14}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button icon="banknote" size="sm">
                Approve tranche 2 (₹1.2 L)
              </Button>
              <Button icon="calendar" size="sm" tone="outline">
                Joint site visit
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      {/* --------------------------------------------------- other rows -- */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="headline-lg text-ink">
              Other active district projects
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Validated citizen demands paired with academic institutions and
              corporate sponsors.
            </p>
          </div>
          <span className="text-xs text-ink-faint">
            Viewing {PROJECTS.length} of 72
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <article
              className="flex flex-col rounded-md border border-line bg-card p-5 shadow-level1"
              key={project.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="label-caps rounded-sm bg-primary px-2 py-1 text-white">
                  {project.id}
                </span>
                <StatusChip tone="impact">
                  {project.percent}% complete
                </StatusChip>
              </div>

              <h3 className="headline-md mt-3 text-ink">{project.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {project.body}
              </p>

              <dl className="mt-4 space-y-1.5 rounded-sm bg-card-muted p-3 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">College cohort</dt>
                  <dd className="text-right font-semibold text-ink">
                    {project.cohort}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Industry sponsor</dt>
                  <dd className="text-right font-semibold text-ink">
                    {project.sponsor}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Current stage</dt>
                  <dd className="text-right font-semibold text-impact-deep">
                    {project.stageLabel}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 h-2 rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-impact"
                  style={{ width: `${project.percent}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
                <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                  <Icon name="clipboard" size={13} />
                  Stage {project.stage} of 8
                </span>
                <Button size="sm" tone="outline">
                  Milestone report
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-line bg-card p-5 shadow-level1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-navy-soft text-navy">
          <Icon name="shield" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">
            Government of Jharkhand academic–industrial CSR mandate (Section 135
            compliant)
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            All prototypes remain open intellectual property for panchayat and
            municipal scaling. University credits are validated by the Jharkhand
            State Board of Technical Education.
          </p>
        </div>
        <ButtonLink href="/department/analytics" size="sm" tone="outline">
          Audit registry
        </ButtonLink>
      </div>
    </div>
  );
}
