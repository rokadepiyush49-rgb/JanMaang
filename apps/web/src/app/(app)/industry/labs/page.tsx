import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Avatar, Button, ButtonLink } from "@/components/ui";
import { Panel, StatusChip } from "@/features/gov/components";
import { DISTRICT } from "@/features/gov/data";
import { LABS, PARTNER } from "@/features/industry/data";

export const metadata: Metadata = { title: "University Labs" };

/**
 * The academic partner network.
 *
 * Ordered by how much of this partner's money each institution is already
 * carrying: a sponsor scanning this page is deciding where to place the next
 * standing sponsorship, and the labs they have never funded are the ones that
 * need to be legible at a glance.
 */
export default function UniversityLabsPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="label-caps text-navy">
              JanMaang academic partner network
            </p>
            <h1 className="headline-xl mt-3 text-ink">
              Empowered university laboratories
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Faculty and student engineering cohorts across {DISTRICT.state}{" "}
              cleared for technology sponsorship. A standing sponsorship gives{" "}
              {PARTNER.name} first review on every newly sanctioned docket
              routed to that department.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusChip icon="graduation" tone="navy">
              6 institutions · 142 researchers
            </StatusChip>
            <Button icon="plus">Sponsor a new lab</Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {LABS.map((lab) => (
          <article
            className="flex flex-col rounded-md border border-line bg-card p-5 shadow-level1"
            key={lab.name}
          >
            <div className="flex items-start gap-4">
              <Avatar
                name={lab.short}
                size={52}
                tone={lab.sponsored ? "impact" : "navy"}
              />
              <div className="min-w-0 flex-1">
                <h2 className="headline-md text-ink">{lab.name}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Icon className="text-ink-faint" name="map-pin" size={13} />
                  {lab.place}
                </p>
              </div>
              {lab.sponsored ? (
                <StatusChip icon="check-circle" tone="impact">
                  Sponsored
                </StatusChip>
              ) : null}
            </div>

            <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Focus</dt>
                <dd className="text-right font-semibold text-ink">
                  {lab.focus}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Active cohort</dt>
                <dd className="mono-data text-ink">{lab.cohort}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">JanMaang rating</dt>
                <dd className="flex items-center gap-1 font-semibold text-ink">
                  <Icon className="text-community" name="star" size={14} />
                  {lab.rating}
                </dd>
              </div>
            </dl>

            <div className="mt-auto flex gap-2 pt-5">
              <ButtonLink
                className="flex-1"
                href="/industry/discover"
                size="sm"
                tone="outline"
              >
                View {lab.projects} project{lab.projects === 1 ? "" : "s"}
              </ButtonLink>
              <Button size="sm" tone={lab.sponsored ? "ghost" : "primary"}>
                {lab.sponsored ? "Manage sponsorship" : "Sponsor lab"}
              </Button>
            </div>
          </article>
        ))}
      </section>

      <Panel
        caption="How allocation works"
        title="What a standing lab sponsorship commits you to"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "banknote" as const,
              title: "An annual envelope, not a cheque",
              body: "You set a ceiling for the year; the district draws against it docket by docket, and every draw is stamped against a sanction order.",
            },
            {
              icon: "eye" as const,
              title: "First review, not first refusal",
              body: "New problems in your domain reach you before the open marketplace. Declining one costs nothing and does not affect the envelope.",
            },
            {
              icon: "award" as const,
              title: "Named on the outcome",
              body: "The lab's filings, the asset plaque and the citizen sign-off record all carry the sponsor, which is what the CSR audit reads.",
            },
          ].map((item) => (
            <div
              className="rounded-sm border border-line bg-card-muted p-4"
              key={item.title}
            >
              <Icon className="text-navy" name={item.icon} size={18} />
              <p className="mt-3 text-sm font-semibold text-ink">
                {item.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
