import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button, ButtonLink } from "@/components/ui";
import {
  BarRow,
  FilterBar,
  Panel,
  Readout,
  SeverityChip,
  StatusChip,
} from "@/features/gov/components";
import { CLUSTERS, HOTSPOT_BLOCKS, MAP_PINS } from "@/features/gov/department";

export const metadata: Metadata = { title: "AI Clusters & Geo Intelligence" };

const PIN_TONE = {
  problem: "bg-danger",
  university: "bg-navy",
  industry: "bg-impact",
} as const;

export default function ClustersPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip icon="bot" tone="navy">
                Operational pipeline v4.2
              </StatusChip>
              <StatusChip icon="zap" tone="impact">
                Live NLP ingestion active
              </StatusChip>
              <span className="mono-data text-ink-faint">
                Model: CivicText-BERT-Distil-IN
              </span>
            </div>
            <h1 className="headline-xl mt-4 text-ink">
              AI problem clusters & geospatial intelligence
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">12,486</span> raw citizen
              reports ingested →{" "}
              <span className="font-semibold text-danger">3,544</span> spam and
              duplicates pruned →{" "}
              <span className="font-semibold text-impact-deep">
                184 actionable clusters
              </span>{" "}
              formed across 18 blocks.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Readout
              label="Mean deduplication"
              note="reports per cluster"
              value="68"
            />
            <Readout
              label="Semantic match"
              note="high confidence"
              value="91.4%"
            />
          </div>
        </div>
      </header>

      <div className="grid gap-6 2xl:grid-cols-[1.6fr_1fr]">
        <Panel
          action={
            <FilterBar
              active="Problem beacons"
              filters={["Problem beacons", "Universities", "Industry CSR"]}
            />
          }
          caption="Layer view"
          title="District beacon map"
        >
          {/* A schematic, not a basemap. MapLibre is already a dependency for
              the citizen map; wiring it here needs real coordinates and a tile
              key, so this shows relative proximity until those exist. */}
          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-sm border border-line bg-primary">
            <svg
              aria-hidden="true"
              className="absolute inset-0 size-full opacity-25"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              {[12.5, 25, 37.5, 50, 62.5, 75, 87.5].map((v) => (
                <line
                  key={`h${v}`}
                  stroke="#7988b0"
                  strokeWidth="0.15"
                  x1="0"
                  x2="100"
                  y1={v}
                  y2={v}
                />
              ))}
              {[12.5, 25, 37.5, 50, 62.5, 75, 87.5].map((v) => (
                <line
                  key={`v${v}`}
                  stroke="#7988b0"
                  strokeWidth="0.15"
                  x1={v}
                  x2={v}
                  y1="0"
                  y2="100"
                />
              ))}
              <path
                d="M0,62 C22,52 42,70 66,55 C82,45 92,50 100,46"
                fill="none"
                stroke="#6CF8BB"
                strokeWidth="0.6"
              />
              <circle
                cx="50"
                cy="52"
                fill="none"
                r="34"
                stroke="#7988b0"
                strokeDasharray="1.5 2"
                strokeWidth="0.25"
              />
            </svg>

            {MAP_PINS.map((pin) => (
              <div
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                key={pin.id}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <span
                  className={`block size-3 rounded-full ${PIN_TONE[pin.kind]} ${
                    pin.kind === "problem" ? "ring-4 ring-danger/25" : ""
                  }`}
                />
                <span className="pointer-events-none absolute top-5 left-1/2 w-max max-w-[12rem] -translate-x-1/2 rounded-sm bg-card px-2 py-1 text-[11px] font-semibold text-ink opacity-0 shadow-level2 transition-opacity group-hover:opacity-100">
                  {pin.label}
                  <span className="block font-normal text-ink-muted">
                    {pin.sub}
                  </span>
                </span>
              </div>
            ))}

            <div className="absolute right-3 bottom-3 rounded-sm bg-card/95 px-3 py-2 shadow-level2">
              <p className="label-caps text-ink-faint">GIS projection</p>
              <p className="mono-data mt-1 text-ink">
                EPSG:3857 · 23.3441° N, 85.3096° E
              </p>
            </div>
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
            <Button className="ml-auto" icon="filter" size="sm" tone="outline">
              Adjust epsilon radius
            </Button>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-sm border-l-[3px] border-l-impact bg-impact-wash p-4">
            <Icon
              className="mt-0.5 shrink-0 text-impact-deep"
              name="sparkles"
              size={18}
            />
            <div>
              <p className="text-sm font-semibold text-ink">
                Spatial density auto-clustering active
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                DBSCAN identified 14 hotspot zones with an 850 m radius at 98.2%
                location accuracy. 42.8% of identical reports merged without
                human review.
              </p>
            </div>
          </div>
        </Panel>

        <Panel
          action={<StatusChip tone="navy">184 total</StatusChip>}
          bodyClassName="space-y-4"
          caption="Live ingestion 14s ago"
          title="Actionable clusters"
        >
          <FilterBar
            active="Critical (P0) & high (P1)"
            filters={[
              "Critical (P0) & high (P1)",
              "All 18 blocks",
              "Volume >20",
            ]}
          />

          {CLUSTERS.map((cluster) => (
            <article
              className="rounded-sm border border-line p-4"
              key={cluster.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="mono-data text-ink">#{cluster.id}</span>
                  <SeverityChip severity={cluster.severity} withCode />
                </div>
                <span className="text-xs font-semibold text-impact-deep">
                  {cluster.match}% semantic match
                </span>
              </div>

              <p className="mt-1 text-xs text-ink-faint">
                {cluster.block} block · deduplicated {cluster.reports} citizen
                inputs
              </p>

              <h3 className="headline-md mt-3 text-ink">{cluster.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {cluster.body}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Readout label="Footprint" value={cluster.footprint} />
                <Readout
                  label="Aggregated"
                  note="field filings"
                  value={`${cluster.reports}`}
                />
                <Readout
                  label="Asset risk"
                  tone="danger"
                  value={cluster.assetRisk}
                />
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs">
                <div className="flex items-start gap-2">
                  <dt className="flex shrink-0 items-center gap-1.5 text-ink-faint">
                    <Icon name="graduation" size={13} /> Candidate partner
                  </dt>
                  <dd className="ml-auto text-right font-semibold text-ink">
                    {cluster.partner}
                  </dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="flex shrink-0 items-center gap-1.5 text-ink-faint">
                    <Icon name="factory" size={13} /> Potential sponsor
                  </dt>
                  <dd className="ml-auto text-right font-semibold text-impact-deep">
                    {cluster.sponsor}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button icon="check-circle" size="sm">
                  Direct assignment
                </Button>
                <Button icon="eye" size="sm" tone="outline">
                  Deep cluster review
                </Button>
              </div>
            </article>
          ))}

          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <span className="mono-data text-ink-faint">
              Audit log #JH-RAN-2025-884
            </span>
            <Link
              className="text-xs font-semibold text-navy hover:underline"
              href="/department/analytics"
            >
              Export GeoJSON data
            </Link>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel caption="Hotspot blocks" title="Cluster load by block">
          <div className="space-y-3">
            {HOTSPOT_BLOCKS.map((block) => (
              <BarRow
                key={block.name}
                label={block.name}
                percent={block.share}
                tone="danger"
                value={`${block.clusters}`}
              />
            ))}
          </div>
        </Panel>

        <Panel caption="University lab matching" title="78.4% matched">
          <p className="text-sm leading-relaxed text-ink-muted">
            144 of 184 clusters have an automated thesis or capstone match
            against an accredited engineering lab in the district catchment.
          </p>
          <div className="mt-4">
            <StatusChip icon="check-circle" tone="impact">
              24 R&amp;D MoUs activated
            </StatusChip>
          </div>
        </Panel>

        <Panel caption="CSR funding pot" title="₹14.82 Cr">
          <p className="text-sm leading-relaxed text-ink-muted">
            Direct corporate CSR pledges pre-allocated against Ranchi
            industrial-belt clusters, with 11 corporate backers on the district
            panel.
          </p>
          <div className="mt-4">
            <ButtonLink
              href="/department/projects"
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              See funded projects
            </ButtonLink>
          </div>
        </Panel>
      </div>
    </div>
  );
}
