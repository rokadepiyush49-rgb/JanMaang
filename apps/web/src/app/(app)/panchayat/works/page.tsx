import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import {
  BarRow,
  FilterBar,
  Panel,
  StatusChip,
} from "@/features/gov/components";
import { BLOCK, LIFECYCLE } from "@/features/gov/data";
import { FUNDS, WORKS } from "@/features/gov/panchayat";

export const metadata: Metadata = { title: "Sanctioned Works" };

/**
 * Works the district has sanctioned for this panchayat.
 *
 * The lifecycle track is rendered as a compact eight-dot rail rather than the
 * department's full cards: at panchayat scale what matters is *which* stage a
 * work has reached and whether the money has followed, not the telemetry
 * behind each stage.
 */
function StageRail({ stage }: { stage: number }) {
  return (
    <ol className="flex items-center gap-1">
      {LIFECYCLE.map((entry) => (
        <li
          className={`h-1.5 flex-1 rounded-full ${
            entry.n < stage
              ? "bg-impact"
              : entry.n === stage
                ? "bg-navy"
                : "bg-line"
          }`}
          key={entry.n}
          title={`${entry.n}. ${entry.name}`}
        />
      ))}
    </ol>
  );
}

export default function SanctionedWorksPage() {
  const totalSanctioned = WORKS.length;
  const completed = WORKS.filter((work) => work.percent === 100).length;

  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="label-caps mb-2 flex items-center gap-2 text-ink-faint">
            <span>{BLOCK.panchayat}</span>
            <Icon name="chevron-right" size={12} />
            <span>Sanctioned works</span>
          </nav>
          <h1 className="headline-xl text-ink">Sanctioned works & fund flow</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            Works the district has sanctioned against this panchayat&rsquo;s
            escalated demands, with the money actually released against each
            one. Every entry here started as a citizen demand you verified.
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon="download" size="sm" tone="outline">
            Social audit pack
          </Button>
          <Button icon="upload" size="sm" tone="outline">
            Upload progress photo
          </Button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <Panel caption="Fund position" title="Budget line FY 25-26">
          <dl className="space-y-2.5 text-sm">
            {[
              ["Allocated", FUNDS.allocated],
              ["Released to date", FUNDS.released],
              ["Utilised", FUNDS.utilised],
            ].map(([label, value]) => (
              <div className="flex justify-between gap-3" key={label}>
                <dt className="text-ink-muted">{label}</dt>
                <dd className="mono-data text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4">
            <div className="h-2.5 rounded-full bg-line">
              <div
                className="h-full rounded-full bg-impact"
                style={{ width: `${FUNDS.utilisedPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              {FUNDS.utilisedPercent}% of released funds utilised
            </p>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-sm border-l-[3px] border-l-danger bg-danger-wash p-3">
            <Icon
              className="mt-0.5 shrink-0 text-danger"
              name="alert-circle"
              size={15}
            />
            <p className="text-xs text-ink">{FUNDS.unspentDays}</p>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <p className="label-caps text-ink-faint">Work status</p>
            <div className="mt-3 space-y-3">
              <BarRow
                label="Completed"
                percent={Math.round((completed / totalSanctioned) * 100)}
                tone="impact"
                value={`${completed}`}
              />
              <BarRow
                label="In execution"
                percent={Math.round(
                  ((totalSanctioned - completed) / totalSanctioned) * 100,
                )}
                tone="navy"
                value={`${totalSanctioned - completed}`}
              />
            </div>
          </div>
        </Panel>

        <Panel
          action={
            <FilterBar
              active="All works"
              filters={["All works", "In execution", "Completed"]}
            />
          }
          bodyClassName="space-y-4"
          caption={`${totalSanctioned} sanctioned`}
          title="Works in this panchayat"
        >
          {WORKS.map((work) => (
            <article
              className="rounded-sm border border-line p-4"
              key={work.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono-data text-ink-muted">#{work.id}</span>
                    <StatusChip tone={work.percent === 100 ? "impact" : "navy"}>
                      Stage {work.stage}/8 · {work.stageLabel}
                    </StatusChip>
                  </div>
                  <h3 className="headline-md mt-2 text-ink">{work.title}</h3>
                  <p className="mt-1 text-xs text-ink-faint">
                    {work.ward} · {work.scheme} · executing agency {work.agency}
                  </p>
                </div>
                <div className="text-right">
                  <p className="headline-lg text-ink tabular-nums">
                    {work.percent}%
                  </p>
                  <p className="text-xs text-ink-faint">{work.due}</p>
                </div>
              </div>

              <div className="mt-4">
                <StageRail stage={work.stage} />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="text-ink-muted">
                    Sanctioned{" "}
                    <span className="mono-data text-ink">
                      {work.sanctioned}
                    </span>
                  </span>
                  <span className="text-ink-muted">
                    Released{" "}
                    <span className="mono-data text-impact-deep">
                      {work.released}
                    </span>
                  </span>
                  <Link
                    className="font-semibold text-navy hover:underline"
                    href="/panchayat/demands"
                  >
                    From demand #{work.demandId}
                  </Link>
                </div>
                <Button icon="clipboard" size="sm" tone="outline">
                  Progress note
                </Button>
              </div>
            </article>
          ))}
        </Panel>
      </div>
    </div>
  );
}
