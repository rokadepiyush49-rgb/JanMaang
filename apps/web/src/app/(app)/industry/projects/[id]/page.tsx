import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon";
import { Avatar, Button, ButtonLink, Progress } from "@/components/ui";
import {
  Callout,
  Panel,
  Readout,
  SeverityChip,
  StatusChip,
} from "@/features/gov/components";
import { inr } from "@/features/gov/data";
import { PROBLEM_DETAIL, PROJECT_SPOTLIGHT } from "@/features/gov/department";
import {
  AUDIT_TRAIL,
  DISCOVER,
  PARTNER,
  TOP_MATCH,
} from "@/features/industry/data";
import { FactRow, MatchDial, SubHeading } from "@/features/industry/components";
import { ProposalBuilder } from "@/features/industry/proposal-builder";

/**
 * One project, seen from the sponsor's chair.
 *
 * PRJ-204 is the deep dossier: it is the docket `/department` sanctions and
 * `/panchayat` verified, so its problem record, lifecycle and telemetry are
 * imported from @/features/gov rather than restated. The other marketplace
 * entries render the same frame with the fields the register genuinely holds —
 * a real state, since a cohort files a spec long before the district uploads
 * the evidence bundle.
 */
export function generateStaticParams() {
  return DISCOVER.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = DISCOVER.find((entry) => entry.id === id);
  return { title: project ? `${project.id} · ${project.title}` : "Project" };
}

function ProposalPanel({
  projectId,
  projectTitle,
  beneficiary,
  gapAmount,
}: {
  projectId: string;
  projectTitle: string;
  beneficiary: string;
  gapAmount: number;
}) {
  return (
    // `id` lives on the wrapper so the "Express interest" links elsewhere in
    // the portal can deep-link straight to the builder; Panel is a pure
    // presentational box and does not take DOM attributes.
    <div className="scroll-mt-24" id="proposal">
      <Panel
        caption="Select the contributions to put in your formal proposal"
        title={`How ${PARTNER.name} can support ${projectId}`}
      >
        <ProposalBuilder
          beneficiary={beneficiary}
          gapAmount={gapAmount}
          officer="the Executive Engineer, PHED"
          projectId={projectId}
          projectTitle={projectTitle}
        />
      </Panel>
    </div>
  );
}

export default async function IndustryProjectDossier({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = DISCOVER.find((entry) => entry.id === id);
  if (!project) notFound();

  const deep = project.id === PROJECT_SPOTLIGHT.id;

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      {/* ------------------------------------------------------- header -- */}
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <nav className="label-caps flex flex-wrap items-center gap-2 text-ink-faint">
          <span>Opportunities</span>
          <Icon name="chevron-right" size={12} />
          <span>{project.discipline}</span>
          <Icon name="chevron-right" size={12} />
          <span className="text-ink-muted">
            Incident #{project.problemId} / {project.id}
          </span>
        </nav>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            <h1 className="headline-xl text-ink">{project.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SeverityChip severity={project.severity} withCode />
              {project.verified ? (
                <StatusChip icon="shield" tone="navy">
                  Government sanctioned
                </StatusChip>
              ) : (
                <StatusChip icon="alert-circle" tone="muted">
                  Awaiting sanction
                </StatusChip>
              )}
              <StatusChip icon="sparkles" tone="impact">
                {PARTNER.name} fit · {project.match}%
              </StatusChip>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {project.body}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 xl:items-end">
            <MatchDial percent={project.match} />
            <ButtonLink
              href={`/industry/projects/${project.id}#proposal`}
              iconAfter="arrow-right"
            >
              Submit partnership proposal
            </ButtonLink>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <Readout
            label="Affected area"
            note={
              deep
                ? "Paddy parcels across three hamlets"
                : "Block officer survey not filed yet"
            }
            value={deep ? "850 ha" : "Survey pending"}
          />
          <Readout
            label="Citizens impacted"
            note={`${project.university} field assessment`}
            value={project.citizens}
          />
          <Readout
            label="Economic risk"
            note={
              deep
                ? "Silt and crop damage at 72 hrs"
                : "District estimate pending"
            }
            tone={deep ? "danger" : undefined}
            value={deep ? "₹2.4 Cr" : "—"}
          />
          <Readout
            label="Funding gap"
            note="Sensor prototyping and commissioning"
            value={`₹${inr(project.gapAmount)}`}
          />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* --------------------------------------- government rationale -- */}
          <Panel
            caption="Why the district prioritised this"
            title="Government decision rationale"
          >
            {deep ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FactRow
                    icon="scale"
                    label="Classification"
                    note={PROBLEM_DETAIL.synthesis.classification}
                    tone="navy"
                    value="Major irrigation breach"
                  />
                  <FactRow
                    icon="droplet"
                    label="Hydraulic flow rate"
                    note={PROBLEM_DETAIL.synthesis.flowNote}
                    tone="danger"
                    value={PROBLEM_DETAIL.synthesis.flow}
                  />
                  <FactRow
                    icon="message"
                    label="Citizen signal"
                    note={PROBLEM_DETAIL.synthesis.aggregationNote}
                    tone="impact"
                    value={`${PROBLEM_DETAIL.clustered} reports across 3 villages`}
                  />
                  <FactRow
                    icon="refresh"
                    label="Recurrence"
                    note={`AI confidence ${PROBLEM_DETAIL.confidence}%`}
                    tone="community"
                    value="High recurrence in 14 days"
                  />
                </div>
                <div className="mt-4">
                  <Callout title="Government call to industry" tone="navy">
                    {PROBLEM_DETAIL.synthesis.directive} The Collectorate has
                    invited {PARTNER.name} as the verified water engineering
                    partner on this docket.
                  </Callout>
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-ink-muted">
                The evidence bundle for #{project.problemId} has not been
                published to the industry register yet. The cohort spec, the
                funding gap and the match score below are live; the field
                photographs, voice notes and AI synthesis appear here once the
                block officer uploads them.
              </p>
            )}
          </Panel>

          {/* ------------------------------------------------ student team -- */}
          <Panel
            action={
              <StatusChip icon="graduation" tone="navy">
                {deep
                  ? PROJECT_SPOTLIGHT.cohort.team
                  : `${project.university} cohort`}
              </StatusChip>
            }
            caption="Assigned university team"
            title={deep ? PROJECT_SPOTLIGHT.cohort.name : project.university}
          >
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={project.university} size={56} tone="navy" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  {deep
                    ? PROJECT_SPOTLIGHT.cohort.dept
                    : `${project.discipline} laboratory`}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {deep
                    ? "Five final-year irrigation engineers have prototyped solar-powered pressure differential sensors. To finish the 12 km field deployment they need industrial LoRaWAN gateways and the ₹2,50,000 hardware sponsorship."
                    : `The cohort holds a working bench prototype and has filed a ₹${inr(project.gapAmount)} gap for field deployment. Contact details and the full team roster unlock once a proposal is accepted.`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusChip icon="user" tone="muted">
                    {deep
                      ? PROBLEM_DETAIL.academic.lead
                      : "Faculty mentor assigned"}
                  </StatusChip>
                  <StatusChip icon="users" tone="muted">
                    {deep
                      ? PROJECT_SPOTLIGHT.cohort.team
                      : `${project.university} lab`}
                  </StatusChip>
                  <StatusChip icon="map-pin" tone="muted">
                    {deep
                      ? PROBLEM_DETAIL.academic.distance
                      : "Within the district"}
                  </StatusChip>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <SubHeading icon="gauge">
                  Project maturity ·{" "}
                  {deep ? PROJECT_SPOTLIGHT.stageLabel : "Lab prototype"}
                </SubHeading>
                <span className="mono-data text-ink">
                  {deep ? PROJECT_SPOTLIGHT.percent : 40}%
                </span>
              </div>
              <Progress
                className="mt-2"
                tone="impact"
                value={deep ? PROJECT_SPOTLIGHT.percent : 40}
              />
            </div>
          </Panel>

          {/* --------------------------------------------------- proposal -- */}
          <ProposalPanel
            beneficiary={project.university}
            gapAmount={project.gapAmount}
            projectId={project.id}
            projectTitle={project.title}
          />
        </div>

        {/* --------------------------------------------------- side rail -- */}
        <aside className="flex flex-col gap-6">
          <Panel
            caption="District authority audit"
            title="Chain of verification"
          >
            <ol className="flex flex-col gap-3">
              {AUDIT_TRAIL.map((entry) => (
                <li className="flex items-start gap-3" key={entry.title}>
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm bg-impact-wash text-impact-deep">
                    <Icon name={entry.icon} size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {entry.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                      {entry.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Button
              className="mt-4 w-full"
              icon="download"
              size="sm"
              tone="outline"
            >
              Download sanction order
            </Button>
          </Panel>

          <Panel caption="Stakeholder alignment" title="Recommended partners">
            <div className="flex flex-col gap-3">
              <div className="rounded-sm border border-line bg-card-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {project.university}
                  </p>
                  <span className="mono-data text-impact-deep">
                    {project.match}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  University · field assessment and student delivery
                </p>
              </div>
              <div className="rounded-sm border border-impact bg-impact-wash p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {PARTNER.name}
                  </p>
                  <StatusChip tone="impact">Your firm</StatusChip>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Industry · {PARTNER.sector}, 18 km from site
                </p>
              </div>
            </div>
          </Panel>

          <Panel caption="Civic-to-career" title="Talent on this docket">
            <div className="flex flex-col gap-3">
              <Readout
                label="Open to internships"
                note="Final-year engineers on sanctioned dockets"
                value="86 students"
              />
              <Readout
                label="Faculty available for review"
                note="Across 3 project areas in your domain"
                value="12 faculty"
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              Pre-placement offers made through JanMaang are logged against the
              sanction order, so the district can report skill creation
              alongside the asset it funded.
            </p>
          </Panel>

          {!deep ? (
            <Callout title="Fixture note" tone="muted">
              The deep evidence bundle currently exists for{" "}
              {PROJECT_SPOTLIGHT.id} only — open{" "}
              <a
                className="font-semibold text-navy underline"
                href={`/industry/projects/${TOP_MATCH.projectId}`}
              >
                {TOP_MATCH.projectId}
              </a>{" "}
              to see every panel populated.
            </Callout>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
