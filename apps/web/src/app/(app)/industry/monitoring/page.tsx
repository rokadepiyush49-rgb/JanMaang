import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Button, ButtonLink, Progress } from "@/components/ui";
import {
  Callout,
  FilterBar,
  MetricTile,
  Panel,
  Readout,
  StatusChip,
} from "@/features/gov/components";
import {
  DELIVERABLES,
  MILESTONES,
  MONITORING_FILTERS,
  MONITORING_KPIS,
  PARTNER,
  SPOTLIGHT,
  TRACKED,
  type TrackedProject,
} from "@/features/industry/data";
import { FileRow, SubHeading } from "@/features/industry/components";

export const metadata: Metadata = { title: "Monitoring & Tracking" };

const HEALTH_TONE = {
  "On track": "impact",
  "At risk": "danger",
  Delayed: "community",
} as const;

/**
 * Delivery monitoring across every cohort this partner touches.
 *
 * Includes projects sponsored by *other* firms, marked as such. A sponsor
 * reading only their own rows cannot see that the block's cold-storage project
 * is stalled on an inverter they happen to stock, which is exactly the
 * introduction the platform exists to make.
 */
function ProjectCard({ project }: { project: TrackedProject }) {
  return (
    <Panel
      action={
        <StatusChip
          icon={project.health === "On track" ? "check-circle" : "alert-circle"}
          tone={HEALTH_TONE[project.health]}
        >
          {project.health}
        </StatusChip>
      }
      caption={`${project.domain} · ${project.authority}`}
      title={project.title}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-data text-ink-faint">{project.id}</span>
        <span className="text-xs text-ink-faint">
          Updated {project.updated}
        </span>
        {project.sponsor.ours ? (
          <StatusChip icon="factory" tone="impact">
            Your sponsorship
          </StatusChip>
        ) : (
          <StatusChip icon="factory" tone="muted">
            {project.sponsor.name}
          </StatusChip>
        )}
      </div>

      <div className="mt-4 rounded-sm border-l-[3px] border-l-navy bg-navy-soft/35 p-4">
        <p className="label-caps text-ink-muted">Original civic problem</p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {project.problem}
        </p>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <SubHeading icon="gauge">{project.timeline.stage}</SubHeading>
          <span className="mono-data text-ink">
            {project.percent}% complete
          </span>
        </div>
        <Progress
          className="mt-2"
          tone={project.health === "At risk" ? "community" : "impact"}
          value={project.percent}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-line bg-card-muted p-4">
          <SubHeading icon="graduation">Student team</SubHeading>
          <p className="mt-2 text-sm font-semibold text-ink">
            {project.team.name}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">{project.team.dept}</p>
          <dl className="mt-3 flex flex-col gap-1.5 text-xs">
            <div>
              <dt className="text-ink-faint">Team lead</dt>
              <dd className="text-ink">{project.team.lead}</dd>
              <dd className="mono-data text-ink-muted">
                {project.team.contact}
              </dd>
            </div>
            <div>
              <dt className="text-ink-faint">Members</dt>
              <dd className="text-ink-muted">{project.team.members}</dd>
            </div>
            <div>
              <dt className="text-ink-faint">Faculty mentor</dt>
              <dd className="text-ink">{project.team.mentor}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-sm border border-line bg-card-muted p-4">
          <SubHeading icon="factory">Industry support matrix</SubHeading>
          <p className="mt-2 text-sm font-semibold text-ink">
            {project.sponsor.name}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {project.sponsor.role}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-ink">
            {project.sponsor.note}
          </p>
        </div>

        <div className="rounded-sm border border-line bg-card-muted p-4">
          <SubHeading icon="calendar">Timeline & dispatch</SubHeading>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            <span className="text-ink-faint">Started</span>
            <span className="mono-data text-ink">
              {project.timeline.started}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-xs">
            <span className="text-ink-faint">Expected</span>
            <span className="mono-data text-ink">
              {project.timeline.expected}
            </span>
          </div>
          <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-muted">
            “{project.dispatch}”
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-4">
        <ButtonLink
          href={`/industry/projects/${project.id}`}
          iconAfter="arrow-right"
          size="sm"
          tone="outline"
        >
          Open dossier
        </ButtonLink>
        {project.sponsor.ours ? (
          <ButtonLink
            href="/industry/workspace"
            icon="briefcase"
            size="sm"
            tone="ghost"
          >
            Go to workspace
          </ButtonLink>
        ) : (
          <Button icon="send" size="sm" tone="ghost">
            Offer to co-sponsor
          </Button>
        )}
      </div>
    </Panel>
  );
}

export default function MonitoringPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="label-caps text-navy">
              Student cohort & industry delivery monitor
            </p>
            <h1 className="headline-xl mt-3 text-ink">
              Project monitoring & tracking
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Live milestone tracking, technical deliverables and the
              co-development ledger across every student engineering team
              working a sanctioned grievance in {PARTNER.name}&rsquo;s domains.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button icon="download" tone="outline">
              Export tracker
            </Button>
            <ButtonLink
              href={`/industry/projects/${SPOTLIGHT.id}`}
              icon="folder"
            >
              Featured {SPOTLIGHT.id} dossier
            </ButtonLink>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MONITORING_KPIS.map((kpi) => (
          <MetricTile key={kpi.label} {...kpi} />
        ))}
      </section>

      <div className="flex flex-col gap-3 rounded-md border border-line bg-card p-5 shadow-level1">
        {MONITORING_FILTERS.map((group) => (
          <div className="flex flex-wrap items-center gap-3" key={group.label}>
            <span className="label-caps w-20 shrink-0 text-ink-faint">
              {group.label}
            </span>
            <FilterBar active={group.active} filters={group.options} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {TRACKED.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* --------------------------------------------------- deep dossier -- */}
      <Panel
        action={
          <StatusChip icon="shield" tone="navy">
            Next Collectorate audit · 18 Nov 2025
          </StatusChip>
        }
        caption="End-to-end civic trace"
        title={`${SPOTLIGHT.id} verification workflow`}
      >
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0">
            <SubHeading icon="clipboard">
              Milestones & verification proofs · 2 of 5 complete
            </SubHeading>
            <ol className="mt-3 flex flex-col gap-3">
              {MILESTONES.map((milestone) => (
                <li
                  className={[
                    "rounded-sm border p-4",
                    milestone.state === "active"
                      ? "border-impact bg-impact-wash"
                      : milestone.state === "done"
                        ? "border-line bg-card"
                        : "border-dashed border-line bg-card-muted",
                  ].join(" ")}
                  key={milestone.n}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      <span className="mono-data mr-2 text-ink-faint">
                        {milestone.n}
                      </span>
                      {milestone.name}
                    </p>
                    <StatusChip
                      tone={
                        milestone.state === "done"
                          ? "impact"
                          : milestone.state === "active"
                            ? "navy"
                            : "muted"
                      }
                    >
                      {milestone.state === "done"
                        ? "100% complete"
                        : milestone.state === "active"
                          ? `${milestone.percent}% active`
                          : milestone.note}
                    </StatusChip>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                    {milestone.body}
                  </p>
                  {milestone.state !== "todo" ? (
                    <Progress
                      className="mt-3"
                      tone={milestone.state === "done" ? "impact" : "navy"}
                      value={milestone.percent}
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="grid gap-3">
              <Readout
                label="Overall progress"
                note={SPOTLIGHT.timeline.stage}
                value={`${SPOTLIGHT.percent}%`}
              />
              <Readout
                label="Government officer"
                note="Ranchi District Agriculture & Irrigation"
                value="R. Sharma"
              />
              <Readout
                label="Economic risk mitigated"
                note="Silt and crop damage across 850 ha"
                value="₹2.4 Cr"
              />
            </div>

            <div>
              <SubHeading icon="folder">Verified deliverables</SubHeading>
              <div className="mt-3 flex flex-col gap-2">
                {DELIVERABLES.map((file) => (
                  <FileRow
                    icon={file.icon}
                    key={file.name}
                    meta={file.size}
                    name={file.name}
                  />
                ))}
              </div>
            </div>

            <Callout title="Tranche endorsement" tone="impact">
              Milestone M3 closes at eight of eight nodes. Endorsing it releases
              the second ₹1,25,000 tranche against sanction order
              JH-RAN-IRR-2025-09.
            </Callout>
            <Button icon="check-circle">Validate & endorse tranche</Button>
          </aside>
        </div>
      </Panel>

      <p className="flex items-center gap-2 text-xs text-ink-faint">
        <Icon name="lock" size={13} />
        Student contact details are visible to sponsors on an active contract
        and are logged against the sanction order on every view.
      </p>
    </div>
  );
}
