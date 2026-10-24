/**
 * Presentational pieces unique to the `/industry` portal.
 *
 * The dense administrative vocabulary — Panel, DataTable, MetricTile, the
 * charts — is imported from @/features/gov/components rather than re-grown
 * here: a sponsor and an Executive Engineer read the same telemetry, and two
 * copies of a bar row is how the two portals start looking like two products.
 *
 * What lives here is what only a sponsor sees: the partner's own link in the
 * civic chain, the AI match breakdown, and the proposal builder — the one
 * genuinely interactive surface in the segment, and so the one client
 * component in it.
 */

import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/icon";
import type { Tone } from "@/features/gov/components";
import { PARTNER_CHAIN } from "./data";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const TONE_FILL: Record<Tone, string> = {
  navy: "bg-navy",
  impact: "bg-impact",
  community: "bg-community",
  danger: "bg-danger",
  muted: "bg-line-strong",
};

/* ------------------------------------------------------- partner chain --- */

/**
 * The five-link civic chain, with the sponsor's own link marked.
 *
 * `gov/components` PipelineStrip draws the same pipeline for an officer, in
 * six administrative nodes. This is deliberately not that: a sponsor does not
 * care that deduplication is DBSCAN, they care that the demand was verified
 * before their money is asked for, and where their contribution sits between
 * the sanction and the citizen.
 */
export function PartnerChain({ heading }: { heading: string }) {
  return (
    <section className="overflow-hidden rounded-md border border-line bg-primary p-6 shadow-level1">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps rounded-sm bg-impact px-2.5 py-1 text-white">
            Verified civic innovation pipeline
          </span>
          <h2 className="headline-lg mt-3 text-white">{heading}</h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
          <Icon name="refresh" size={14} /> Live institutional sync
        </span>
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {PARTNER_CHAIN.map((link) => (
          <li
            className={cx(
              "flex flex-col rounded-sm border p-4",
              link.you
                ? "border-impact bg-impact/15"
                : "border-white/10 bg-white/5",
            )}
            key={link.n}
          >
            <div className="flex items-center justify-between">
              <span className="label-caps text-white/55">
                {link.you ? `${link.n} · you are here` : link.n}
              </span>
              <Icon className="text-white/70" name={link.icon} size={16} />
            </div>
            <p className="headline-md mt-3 text-white">{link.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              {link.body}
            </p>
            <div className="mt-4 flex items-end justify-between gap-2 border-t border-white/10 pt-3">
              <span className="text-[11px] text-white/50">
                {link.statLabel}
              </span>
              <span className="mono-data text-white">{link.statValue}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------- match score --- */

/** A single component of the match score, as a labelled meter. */
export function MatchBar({
  label,
  percent,
  tone = "impact",
}: {
  label: string;
  percent: number;
  tone?: Tone;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-ink-muted">{label}</span>
        <span className="mono-data text-ink">{percent}%</span>
      </div>
      <span className="mt-1.5 block h-1.5 rounded-full bg-card-muted">
        <span
          className={cx("block h-full rounded-full", TONE_FILL[tone])}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </span>
    </div>
  );
}

/**
 * The big circular match figure on the dossier hero.
 *
 * `gov/components` ProgressRing is the same idea at 76px with a caption beside
 * it; this one is the headline of its panel, so it carries the number inside
 * the ring and nothing else.
 */
export function MatchDial({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-28 shrink-0">
      <svg
        aria-hidden="true"
        className="size-full -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="#E2E8F0"
          strokeWidth="9"
        />
        <circle
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="#10B981"
          strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
          strokeLinecap="round"
          strokeWidth="9"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="headline-lg text-ink tabular-nums">{percent}%</span>
        <span className="label-caps text-ink-faint">match</span>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------- pieces --- */

/** A labelled fact with an icon badge — the dossier's repeated unit. */
export function FactRow({
  icon,
  label,
  value,
  note,
  tone = "navy",
}: {
  icon: IconName;
  label: string;
  value: string;
  note?: string;
  tone?: Tone;
}) {
  const chip: Record<Tone, string> = {
    navy: "bg-navy-soft text-navy",
    impact: "bg-impact-wash text-impact-deep",
    community: "bg-community-soft text-community-deep",
    danger: "bg-danger-wash text-danger",
    muted: "bg-card-muted text-ink-muted",
  };
  return (
    <div className="flex items-start gap-3 rounded-sm border border-line bg-card-muted p-3">
      <span
        className={cx(
          "flex size-9 shrink-0 items-center justify-center rounded-sm",
          chip[tone],
        )}
      >
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <p className="label-caps text-ink-faint">{label}</p>
        <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
        {note ? <p className="mt-0.5 text-xs text-ink-muted">{note}</p> : null}
      </div>
    </div>
  );
}

/** A downloadable artefact row, used by the workspace and the dossier. */
export function FileRow({
  icon,
  name,
  meta,
}: {
  icon: IconName;
  name: string;
  meta?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-line bg-card px-3 py-2.5">
      <Icon className="shrink-0 text-ink-muted" name={icon} size={16} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
        {name}
      </span>
      {meta ? <span className="mono-data text-ink-faint">{meta}</span> : null}
      <Icon className="shrink-0 text-ink-faint" name="download" size={16} />
    </div>
  );
}

/** Milestone rail used by the workspace header and the monitoring dossier. */
export function MilestoneRail({
  steps,
}: {
  steps: readonly {
    n: string;
    name: string;
    note: string;
    state: "done" | "active" | "todo";
  }[];
}) {
  return (
    <ol className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {steps.map((step) => (
        <li
          className={cx(
            "rounded-sm border p-3",
            step.state === "active"
              ? "border-impact bg-impact-wash"
              : step.state === "done"
                ? "border-line bg-card"
                : "border-dashed border-line bg-card-muted",
          )}
          key={step.n}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="label-caps text-ink-faint">{step.n}</span>
            {step.state === "done" ? (
              <Icon className="text-impact" name="check-circle" size={14} />
            ) : step.state === "active" ? (
              <span className="size-2 rounded-full bg-impact" />
            ) : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{step.name}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{step.note}</p>
        </li>
      ))}
    </ol>
  );
}

/** Section sub-heading inside a panel body. */
export function SubHeading({
  icon,
  children,
}: {
  icon: IconName;
  children: ReactNode;
}) {
  return (
    <p className="label-caps flex items-center gap-2 text-ink-muted">
      <Icon className="text-ink-faint" name={icon} size={14} />
      {children}
    </p>
  );
}
