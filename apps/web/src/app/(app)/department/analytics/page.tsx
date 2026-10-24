import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Avatar, Button } from "@/components/ui";
import {
  BarRow,
  Donut,
  FilterBar,
  FunnelChart,
  Legend,
  Panel,
  SeverityChip,
  StatusChip,
  type Tone,
} from "@/features/gov/components";
import { ANALYTICS } from "@/features/gov/department";

export const metadata: Metadata = { title: "Analytics & Reports" };

export default function AnalyticsPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps text-navy">
                Statutory periodic intelligence
              </span>
              <span className="mono-data text-ink-faint">
                ID: JH-RAN-DCS-2025-Q3
              </span>
            </div>
            <h1 className="headline-xl mt-3 text-ink">
              Grievance intelligence & ecosystem performance
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Integrated live analysis covering civic grievances, automated
              triage diagnostics, university engineering labs and corporate CSR
              capital deployment.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusChip icon="gauge" tone="impact">
              Ecosystem health 98.4% operational
            </StatusChip>
            <StatusChip icon="refresh" tone="navy">
              Data sync realtime
            </StatusChip>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <FilterBar
            active="Last 30 days"
            filters={["Last 30 days", "All 18 blocks", "All 5 domains"]}
          />
          <div className="flex gap-2">
            <Button icon="download" size="sm">
              Export dossier
            </Button>
            <Button icon="file-pen" size="sm" tone="outline">
              Print dispatch
            </Button>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------- headline row -- */}
      <section className="grid gap-4 lg:grid-cols-3">
        {ANALYTICS.headline.map((item) => (
          <article
            className="rounded-md border border-line bg-card p-5 shadow-level1"
            key={item.label}
          >
            <p className="label-caps text-ink-faint">{item.caption}</p>
            <p className="mt-1 text-sm font-semibold text-ink-muted">
              {item.label}
            </p>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span className="headline-xl text-ink tabular-nums">
                {item.value}
              </span>
              <StatusChip icon={item.deltaIcon} tone="impact">
                {item.delta}
              </StatusChip>
            </div>
            {"progress" in item && item.progress ? (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-impact"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink-faint">
                  <span>{item.foot}</span>
                  <span className="mono-data">{item.progressLabel}</span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                {item.foot}
              </p>
            )}
          </article>
        ))}
      </section>

      {/* ------------------------------------------------ domain + funnel -- */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Panel
          action={<StatusChip>N = 8,942 filings</StatusChip>}
          caption="Domain telemetry"
          title="Problems by category"
        >
          <Donut
            centreLabel="Top: Water"
            centreValue="32%"
            segments={ANALYTICS.categories.map((category) => ({
              label: category.label,
              share: category.share,
              tone: category.tone as Tone,
            }))}
          />
          <p className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">
            Primary cluster: Sikidiri canal distributary, Angara block.
          </p>
        </Panel>

        <Panel
          action={
            <StatusChip tone="impact">7,420 review hours saved</StatusChip>
          }
          caption="AI processing funnel"
          title="Raw inflow vs deduplicated vs verified"
        >
          <Legend
            items={[
              { label: "Raw intake", tone: "soft-navy" },
              { label: "Deduplicated", tone: "soft-impact" },
              { label: "Actionable validated", tone: "navy" },
            ]}
          />
          <div className="mt-4">
            <FunnelChart data={ANALYTICS.funnel} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sm bg-card-muted p-3">
            <Icon
              className="shrink-0 text-impact-deep"
              name="sparkles"
              size={16}
            />
            <p className="min-w-0 flex-1 text-xs text-ink-muted">
              NLP geo-clustering merged 42.8% of identical reports automatically
              without human review intervention.
            </p>
            <span className="mono-data text-ink">Precision 99.1%</span>
          </div>
        </Panel>
      </div>

      {/* ---------------------------------------------------- SLA + block -- */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Panel
          action={<StatusChip tone="impact">8.9× faster SLA</StatusChip>}
          caption="SLA performance"
          title="Severity matrix & turnaround"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ANALYTICS.sla.map((band) => (
              <div
                className="rounded-sm border border-line p-3"
                key={band.severity}
              >
                <SeverityChip severity={band.severity} />
                <p className="headline-lg mt-3 text-ink tabular-nums">
                  {band.count}
                </p>
                <p className="mt-2 text-[11px] text-ink-faint">
                  Resolution avg
                </p>
                <p className="mono-data text-impact-deep">{band.avg}</p>
                <p className="mt-1 text-[11px] text-ink-faint line-through">
                  legacy {band.legacy}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-sm bg-card-muted p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink">
                Critical P0 escalation trajectory (target &lt; 5.0 days)
              </span>
              <StatusChip tone="impact">Ahead of target by 19.2 hrs</StatusChip>
            </div>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full">
              <span className="w-[18%] bg-danger" />
              <span className="w-[26%] bg-community" />
              <span className="flex-1 bg-navy" />
            </div>
          </div>
        </Panel>

        <Panel
          action={<StatusChip>Top 7 mandates</StatusChip>}
          caption="Sub-district analytics"
          title="Block grievance resolution efficiency"
        >
          <div className="space-y-3">
            {ANALYTICS.blocks.map((block) => (
              <BarRow
                key={block.name}
                label={block.name}
                percent={block.percent}
                tone={block.percent >= 75 ? "impact" : "navy"}
                value={`${block.resolved}`}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-impact" />
              Leading: urban & agri-industrial zones
            </span>
            <span className="mono-data">District aggregate 79.4%</span>
          </div>
        </Panel>
      </div>

      {/* -------------------------------------------------- labs + CSR ---- */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Panel
          action={<StatusChip tone="impact">62 live solutions</StatusChip>}
          caption="Academic R&D pipeline"
          title="University participation & prototype leaderboard"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-line-strong">
                  <th
                    className="label-caps px-2 py-2.5 text-ink-muted"
                    scope="col"
                  >
                    Institution
                  </th>
                  <th
                    className="label-caps px-2 py-2.5 text-right text-ink-muted"
                    scope="col"
                  >
                    Active
                  </th>
                  <th
                    className="label-caps px-2 py-2.5 text-right text-ink-muted"
                    scope="col"
                  >
                    Patents
                  </th>
                  <th
                    className="label-caps px-2 py-2.5 text-ink-muted"
                    scope="col"
                  >
                    Readiness (TRL)
                  </th>
                </tr>
              </thead>
              <tbody>
                {ANALYTICS.institutions.map((institution) => (
                  <tr
                    className="border-b border-line last:border-0"
                    key={institution.short}
                  >
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={institution.short}
                          size={32}
                          tone="navy"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {institution.name}
                          </p>
                          <p className="truncate text-xs text-ink-faint">
                            {institution.focus}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="mono-data px-2 py-3 text-right text-ink">
                      {institution.projects}
                    </td>
                    <td className="mono-data px-2 py-3 text-right text-impact-deep">
                      {institution.patents}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-24 rounded-full bg-line">
                          <span
                            className="block h-full rounded-full bg-impact"
                            style={{ width: `${(institution.trl / 9) * 100}%` }}
                          />
                        </span>
                        <span className="mono-data text-ink-faint">
                          TRL-{institution.trl}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-xs text-ink-muted">
            <span>Total student engineering fellowships: 480 active</span>
            <span className="mono-data">Patents disclosed: 18</span>
          </div>
        </Panel>

        <Panel
          action={<StatusChip tone="community">₹12.4 Cr injected</StatusChip>}
          caption="Public–private coalition"
          title="Industry CSR & equipment allocation"
        >
          <div className="space-y-4">
            {ANALYTICS.csr.map((donor) => (
              <div key={donor.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {donor.name}
                  </span>
                  <span className="mono-data text-community-deep">
                    {donor.amount}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">{donor.scope}</p>
                <div className="mt-2 h-1.5 rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-community"
                    style={{ width: `${donor.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
            <Icon className="text-impact-deep" name="shield" size={14} />
            <span className="text-xs text-ink-muted">
              100% tax deductible · CSR 80G certified MoU registry
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
