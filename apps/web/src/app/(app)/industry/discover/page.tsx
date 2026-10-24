import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Button, ButtonLink } from "@/components/ui";
import {
  FilterBar,
  Panel,
  SeverityChip,
  StatusChip,
} from "@/features/gov/components";
import { inr } from "@/features/gov/data";
import {
  DISCOVER,
  DISCOVER_DISCIPLINES,
  DISCOVER_SORTS,
} from "@/features/industry/data";
import { MatchBar } from "@/features/industry/components";

export const metadata: Metadata = { title: "Discover Projects" };

/**
 * The civic-academic marketplace.
 *
 * Every card here is a university team that already has a prototype and a
 * sanctioned problem behind it, so the only open question is the funding gap.
 * That is why the gap — not the match score — sits last in each card, directly
 * above the action.
 */
export default function DiscoverProjectsPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="label-caps text-navy">
              Direct civic–academic marketplace
            </p>
            <h1 className="headline-xl mt-3 text-ink">
              Discover civic technology projects
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              University teams building field prototypes against verified
              Collectorate dockets, ranked by how closely each one needs what
              your division already makes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusChip icon="check-circle" tone="impact">
              All 28 collector-verified
            </StatusChip>
            <StatusChip icon="banknote" tone="community">
              ₹41.6 L open funding gap
            </StatusChip>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <FilterBar
            active="All disciplines (28)"
            filters={DISCOVER_DISCIPLINES}
          />
          <div className="flex items-center gap-2">
            <span className="label-caps text-ink-faint">Sort by</span>
            {DISCOVER_SORTS.map((sort, index) => (
              <Button
                key={sort}
                size="sm"
                tone={index === 0 ? "outline" : "ghost"}
              >
                {sort}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {DISCOVER.map((project) => (
          <article
            className="flex flex-col overflow-hidden rounded-md border border-line bg-card shadow-level1"
            key={project.id}
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-card-muted px-5 py-3">
              <SeverityChip severity={project.severity} />
              {project.verified ? (
                <StatusChip icon="shield" tone="impact">
                  Collector verified
                </StatusChip>
              ) : (
                <StatusChip icon="alert-circle" tone="muted">
                  Verification pending
                </StatusChip>
              )}
              <span className="mono-data ml-auto text-ink-faint">
                {project.id}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h2 className="headline-md text-ink">{project.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {project.body}
              </p>

              <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <Icon
                      className="text-ink-faint"
                      name="graduation"
                      size={14}
                    />
                    University
                  </dt>
                  <dd className="font-semibold text-ink">
                    {project.university}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <Icon className="text-ink-faint" name="users" size={14} />
                    Citizens impacted
                  </dt>
                  <dd className="font-semibold text-ink">{project.citizens}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <Icon
                      className="text-ink-faint"
                      name="banknote"
                      size={14}
                    />
                    Funding gap
                  </dt>
                  <dd className="mono-data text-ink">
                    ₹{inr(project.gapAmount)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <MatchBar
                  label={`AI match · ${project.discipline}`}
                  percent={project.match}
                  tone={project.match >= 90 ? "impact" : "navy"}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2 pt-1">
                <ButtonLink
                  className="flex-1"
                  href={`/industry/projects/${project.id}`}
                  size="sm"
                  tone="outline"
                >
                  Inspect spec
                </ButtonLink>
                <ButtonLink
                  className="flex-1"
                  href={`/industry/projects/${project.id}#proposal`}
                  size="sm"
                >
                  Support project
                </ButtonLink>
              </div>
            </div>
          </article>
        ))}
      </section>

      <Panel
        caption="Not seeing your domain"
        title="Sponsor a lab instead of a project"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
            A standing lab sponsorship funds a department rather than a single
            docket: the district routes newly sanctioned problems in your domain
            straight to that cohort, and you review them before anyone else on
            the register.
          </p>
          <ButtonLink
            href="/industry/labs"
            iconAfter="arrow-right"
            tone="outline"
          >
            Browse university labs
          </ButtonLink>
        </div>
      </Panel>
    </div>
  );
}
