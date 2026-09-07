/**
 * Presentational pieces shared by the two government portals.
 *
 * `src/components/ui.tsx` covers the citizen- and student-facing vocabulary:
 * roomy cards, pill tags, one number per tile. The administrative screens want
 * the opposite — hairline rules, uppercase micro-labels, tabular figures and
 * as many rows on screen as will fit — so the dense variants live here instead
 * of growing a second personality into the shared kit.
 *
 * Everything is a server component on purpose. The reference screens are
 * read-only telemetry, and the charts are small enough to draw as inline SVG,
 * so no page in either portal needs to ship client JavaScript to render.
 */

import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/icon";
import { PIPELINE, SEVERITY, type Severity } from "./data";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type Tone = "navy" | "impact" | "community" | "danger" | "muted";

const TONE_CHIP: Record<Tone, string> = {
  navy: "bg-navy-soft text-navy",
  impact: "bg-impact-wash text-impact-deep",
  community: "bg-community-soft text-community-deep",
  danger: "bg-danger-wash text-danger",
  muted: "bg-card-muted text-ink-muted",
};

const TONE_FILL: Record<Tone, string> = {
  navy: "bg-navy",
  impact: "bg-impact",
  community: "bg-community",
  danger: "bg-danger",
  muted: "bg-line-strong",
};

/** Hex for the SVG charts, which cannot use Tailwind colour utilities. */
const TONE_HEX: Record<Tone, string> = {
  navy: "#002147",
  impact: "#10B981",
  community: "#F97316",
  danger: "#BA1A1A",
  muted: "#C4C6CF",
};

/* --------------------------------------------------------------- panel --- */

/**
 * The workhorse container: a titled card with an optional right-hand slot.
 *
 * Deliberately not `ui.tsx`'s `Card` + `CardHeader`. That pair centres a large
 * icon badge and 20px title, which at four panels per row on a command screen
 * spends more height on chrome than on data.
 */
export function Panel({
  caption,
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  caption?: string;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cx(
        "flex flex-col overflow-hidden rounded-md border border-line bg-card shadow-level1",
        className,
      )}
    >
      {title ? (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {caption ? (
              <p className="label-caps text-ink-faint">{caption}</p>
            ) : null}
            <h2 className="headline-md mt-1 text-ink">{title}</h2>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cx("flex-1 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ---------------------------------------------------------- metric tile --- */

/**
 * The KPI card from the reference: micro-label and icon, one big tabular
 * figure, a delta line, and a footer strip carrying the secondary number the
 * headline figure always prompts you to ask for.
 */
export function MetricTile({
  label,
  value,
  unit,
  icon,
  tone = "navy",
  delta,
  footLabel,
  footValue,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: IconName;
  tone?: Tone;
  delta?: string;
  footLabel: string;
  footValue: string;
}) {
  return (
    <section className="flex flex-col justify-between overflow-hidden rounded-md border border-line bg-card shadow-level1">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="label-caps text-ink-faint">{label}</p>
          <span
            className={cx(
              "flex size-8 shrink-0 items-center justify-center rounded-sm",
              TONE_CHIP[tone],
            )}
          >
            <Icon name={icon} size={16} />
          </span>
        </div>
        <p className="headline-xl mt-3 text-ink tabular-nums">
          {value}
          {unit ? (
            <span className="ml-1 text-base font-semibold text-ink-muted">
              {unit}
            </span>
          ) : null}
        </p>
        {delta ? (
          <p
            className={cx(
              "mt-1 text-xs font-semibold",
              tone === "danger" ? "text-danger" : "text-ink-muted",
            )}
          >
            {delta}
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line bg-card-muted px-4 py-2.5">
        <span className="text-xs text-ink-faint">{footLabel}</span>
        <span className="mono-data text-ink">{footValue}</span>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- chips ----- */

const SEVERITY_TONE: Record<Severity, Tone> = {
  critical: "danger",
  high: "community",
  medium: "navy",
  routine: "muted",
};

/** Strictly rectangular, with the indicator dot the reference specifies. */
export function SeverityChip({
  severity,
  withCode = false,
}: {
  severity: Severity;
  withCode?: boolean;
}) {
  const tone = SEVERITY_TONE[severity];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold whitespace-nowrap",
        TONE_CHIP[tone],
      )}
    >
      <span className={cx("size-1.5 rounded-full", TONE_FILL[tone])} />
      {SEVERITY[severity].label}
      {withCode ? (
        <span className="opacity-70">({SEVERITY[severity].code})</span>
      ) : null}
    </span>
  );
}

/** Neutral status/metadata chip — no dot, no severity semantics. */
export function StatusChip({
  tone = "muted",
  icon,
  children,
}: {
  tone?: Tone;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold whitespace-nowrap",
        TONE_CHIP[tone],
      )}
    >
      {icon ? <Icon name={icon} size={12} /> : null}
      {children}
    </span>
  );
}

/** A labelled figure inside a panel — the reference's inner stat boxes. */
export function Readout({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-sm border border-line bg-card-muted p-3">
      <p className="label-caps text-ink-faint">{label}</p>
      <p
        className={cx(
          "headline-md mt-1.5 tabular-nums",
          tone === "danger" ? "text-danger" : "text-ink",
        )}
      >
        {value}
      </p>
      {note ? <p className="mt-1 text-xs text-ink-muted">{note}</p> : null}
    </div>
  );
}

/* --------------------------------------------------------- data table ----- */

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  className?: string;
  cell: (row: T) => ReactNode;
}

/**
 * The dense administrative table.
 *
 * Wrapped in its own horizontal scroller because these tables are wide by
 * nature and the page body must never scroll sideways. `rowHref` is optional:
 * lists that have a detail screen get a whole-row link, lists that do not stay
 * inert rather than growing a fake affordance.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[52rem] border-collapse text-left">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b-2 border-line-strong bg-card-muted">
            {columns.map((column) => (
              <th
                className={cx(
                  "label-caps px-4 py-3 text-ink-muted",
                  column.align === "right" && "text-right",
                  column.className,
                )}
                key={column.key}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              className="border-b border-line transition-colors last:border-0 hover:bg-card-muted"
              key={rowKey(row)}
            >
              {columns.map((column) => (
                <td
                  className={cx(
                    "px-4 py-3 align-middle text-sm text-ink",
                    column.align === "right" && "text-right",
                    column.className,
                  )}
                  key={column.key}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------- bar row ---- */

/** One horizontal bar with a label and a trailing figure. */
export function BarRow({
  label,
  percent,
  value,
  tone = "impact",
}: {
  label: string;
  percent: number;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="grid grid-cols-[minmax(6rem,9rem)_1fr_auto] items-center gap-3">
      <span className="truncate text-sm text-ink">{label}</span>
      <span className="relative h-5 rounded-sm bg-card-muted">
        <span
          className={cx(
            "absolute inset-y-0 left-0 rounded-sm",
            TONE_FILL[tone],
          )}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
        <span className="absolute inset-y-0 right-2 flex items-center text-[11px] font-bold text-ink-muted tabular-nums">
          {percent}%
        </span>
      </span>
      <span className="mono-data w-16 text-right text-ink-muted">{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------- charts ---- */

/**
 * Donut share chart.
 *
 * Drawn with `stroke-dasharray` on concentric arcs rather than paths: the
 * segments are a single circle each, so there is no arc maths to get wrong and
 * no dependency to load for five numbers.
 */
export function Donut({
  segments,
  centreValue,
  centreLabel,
}: {
  segments: { label: string; share: number; tone: Tone }[];
  centreValue: string;
  centreLabel: string;
}) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg
        aria-hidden="true"
        className="shrink-0"
        height="150"
        viewBox="0 0 150 150"
        width="150"
      >
        <g transform="rotate(-90 75 75)">
          {segments.map((segment) => {
            const length = (segment.share / 100) * circumference;
            const dash = `${length} ${circumference - length}`;
            const element = (
              <circle
                cx="75"
                cy="75"
                fill="none"
                key={segment.label}
                r={radius}
                stroke={TONE_HEX[segment.tone]}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeWidth="22"
              />
            );
            offset += length;
            return element;
          })}
        </g>
        <text
          className="fill-ink"
          fontSize="24"
          fontWeight="700"
          textAnchor="middle"
          x="75"
          y="72"
        >
          {centreValue}
        </text>
        <text
          className="fill-ink-faint"
          fontSize="10"
          textAnchor="middle"
          x="75"
          y="88"
        >
          {centreLabel}
        </text>
      </svg>

      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((segment) => (
          <li className="flex items-center gap-2 text-sm" key={segment.label}>
            <span
              className={cx(
                "size-2.5 shrink-0 rounded-sm",
                TONE_FILL[segment.tone],
              )}
            />
            <span className="min-w-0 flex-1 truncate text-ink-muted">
              {segment.label}
            </span>
            <span className="mono-data text-ink">{segment.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Stacked columns for the intake → deduplicated → actionable funnel.
 *
 * Each column is drawn bottom-up, so the three bands read as the shrinking
 * volume they represent rather than three unrelated series.
 */
export function FunnelChart({
  data,
}: {
  data: readonly {
    label: string;
    raw: number;
    dedup: number;
    actionable: number;
  }[];
}) {
  const max = Math.max(...data.map((d) => d.raw));
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: 168 }}>
        {data.map((d) => (
          <div
            className="flex h-full flex-1 flex-col justify-end gap-0.5"
            key={d.label}
          >
            <span
              className="w-full rounded-t-sm bg-navy-soft"
              style={{ height: `${((d.raw - d.dedup) / max) * 100}%` }}
              title={`Raw intake ${d.raw}`}
            />
            <span
              className="w-full bg-impact-soft"
              style={{ height: `${((d.dedup - d.actionable) / max) * 100}%` }}
              title={`Deduplicated ${d.dedup}`}
            />
            <span
              className="w-full rounded-b-sm bg-navy"
              style={{ height: `${(d.actionable / max) * 100}%` }}
              title={`Actionable ${d.actionable}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d) => (
          <span
            className="flex-1 text-center text-[10px] text-ink-faint"
            key={d.label}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Legend row shared by the funnel and any other multi-series chart. */
export function Legend({
  items,
}: {
  items: { label: string; tone: Tone | "soft-impact" | "soft-navy" }[];
}) {
  const fill: Record<string, string> = {
    ...TONE_FILL,
    "soft-impact": "bg-impact-soft",
    "soft-navy": "bg-navy-soft",
  };
  return (
    <ul className="flex flex-wrap items-center gap-4">
      {items.map((item) => (
        <li
          className="flex items-center gap-1.5 text-xs text-ink-muted"
          key={item.label}
        >
          <span className={cx("size-2.5 rounded-sm", fill[item.tone])} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Filled area chart for a short telemetry series.
 *
 * Points are spread across a 0-100 viewBox and the path is closed along the
 * baseline, so the same component renders any sample count without callers
 * having to know the geometry.
 */
export function AreaChart({
  series,
  tone = "impact",
  height = 120,
}: {
  series: readonly number[];
  tone?: Tone;
  height?: number;
}) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const coords = series.map((value, index) => ({
    x: (index / (series.length - 1)) * 100,
    y: 100 - ((value - min) / span) * 78 - 11,
  }));
  const line = `M${coords.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" L")}`;
  const area = `${line} L100,100 L0,100 Z`;
  const last = coords.at(-1) ?? { x: 0, y: 50 };

  return (
    <svg
      aria-hidden="true"
      className="w-full"
      height={height}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path d={area} fill={TONE_HEX[tone]} opacity="0.12" />
      <path
        d={line}
        fill="none"
        stroke={TONE_HEX[tone]}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={last.x}
        cy={last.y}
        fill={TONE_HEX[tone]}
        r="1.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Ring progress used for a single headline percentage. */
export function ProgressRing({
  percent,
  label,
  tone = "impact",
}: {
  percent: number;
  label: string;
  tone?: Tone;
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;
  return (
    <div className="flex items-center gap-3">
      <svg aria-hidden="true" height="76" viewBox="0 0 76 76" width="76">
        <circle
          cx="38"
          cy="38"
          fill="none"
          r={radius}
          stroke="#E2E8F0"
          strokeWidth="8"
        />
        <circle
          cx="38"
          cy="38"
          fill="none"
          r={radius}
          stroke={TONE_HEX[tone]}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          strokeWidth="8"
          transform="rotate(-90 38 38)"
        />
        <text
          className="fill-ink"
          fontSize="16"
          fontWeight="700"
          textAnchor="middle"
          x="38"
          y="43"
        >
          {percent}%
        </text>
      </svg>
      <span className="label-caps text-ink-faint">{label}</span>
    </div>
  );
}

/* ----------------------------------------------------------- lifecycle ---- */

/**
 * The eight-stage execution track.
 *
 * Horizontally scrollable rather than wrapped: the stages are ordered and a
 * wrapped grid breaks the left-to-right reading that makes the order legible.
 */
export function LifecycleTrack({
  stages,
}: {
  stages: readonly {
    n: string;
    name: string;
    note: string;
    date: string;
    state: "done" | "active" | "todo";
  }[];
}) {
  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-[56rem] gap-2">
        {stages.map((stage) => {
          const active = stage.state === "active";
          const done = stage.state === "done";
          return (
            <li
              className={cx(
                "flex flex-1 flex-col gap-2 rounded-sm border p-3",
                active
                  ? "border-impact bg-impact-wash"
                  : done
                    ? "border-line bg-card"
                    : "border-dashed border-line bg-card-muted",
              )}
              key={stage.n}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cx(
                    "label-caps",
                    active ? "text-impact-deep" : "text-ink-faint",
                  )}
                >
                  {active ? `${stage.n} active` : stage.n}
                </span>
                {done ? (
                  <Icon
                    className="text-impact-deep"
                    name="check-circle"
                    size={15}
                  />
                ) : active ? (
                  <span className="size-2.5 rounded-full bg-impact" />
                ) : (
                  <span className="size-2.5 rounded-full border border-line-strong" />
                )}
              </div>
              <p className="text-sm leading-snug font-semibold text-ink">
                {stage.name}
              </p>
              <p className="text-xs text-ink-muted">{stage.note}</p>
              <p
                className={cx(
                  "mono-data mt-auto",
                  active ? "text-impact-deep" : "text-ink-faint",
                )}
              >
                {stage.date}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* --------------------------------------------------------- pipeline ------ */

/**
 * The six-node quad-helix strip, rendered on a dark ground.
 *
 * `youAt` is the node title this portal occupies. Passing the title rather
 * than an index means a reordering of the pipeline cannot silently move the
 * marker onto the wrong node.
 */
export function PipelineStrip({
  youAt,
  heading,
  className,
}: {
  youAt: string;
  heading: string;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "overflow-hidden rounded-md border border-line bg-primary p-6 shadow-level1",
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps rounded-sm bg-impact px-2.5 py-1 text-white">
            Quad-helix workflow
          </span>
          <h2 className="headline-lg mt-3 text-white">{heading}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/70">
          <span className="flex items-center gap-1.5">
            <Icon name="zap" size={14} /> Fully automated ML triage
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="gauge" size={14} /> Live throughput 42.8 ops/sec
          </span>
        </div>
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {PIPELINE.map((node) => {
          const here = node.title === youAt;
          return (
            <li
              className={cx(
                "flex flex-col rounded-sm border p-4",
                here
                  ? "border-impact bg-impact/15"
                  : "border-white/10 bg-white/5",
              )}
              key={node.n}
            >
              <div className="flex items-center justify-between">
                <span className="label-caps text-white/55">
                  {here ? `${node.n} · you are here` : node.n}
                </span>
                <Icon className="text-white/70" name={node.icon} size={16} />
              </div>
              <p className="headline-md mt-3 text-white">{node.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                {node.body}
              </p>
              <div className="mt-4 flex items-end justify-between gap-2 border-t border-white/10 pt-3">
                <span className="text-[11px] text-white/50">
                  {node.statLabel}
                </span>
                <span className="mono-data text-white">{node.statValue}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------- filter bar ---- */

/**
 * The filter strip above every list.
 *
 * Rendered as static chips: filtering is a server concern and there is no
 * endpoint to filter against yet, so these show the vocabulary the API will
 * take rather than pretending to be wired up.
 */
export function FilterBar({
  filters,
  active,
}: {
  filters: string[];
  active: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <span
          className={cx(
            "rounded-sm border px-3 py-1.5 text-xs font-semibold",
            filter === active
              ? "border-primary bg-primary text-white"
              : "border-line bg-card text-ink-muted",
          )}
          key={filter}
        >
          {filter}
        </span>
      ))}
    </div>
  );
}

/** Small left-accent callout for a directive or advisory. */
export function Callout({
  tone = "navy",
  title,
  children,
}: {
  tone?: Tone;
  title: string;
  children: ReactNode;
}) {
  const accent: Record<Tone, string> = {
    navy: "border-l-navy bg-navy-soft/35",
    impact: "border-l-impact bg-impact-wash",
    community: "border-l-community bg-community-soft/40",
    danger: "border-l-danger bg-danger-wash",
    muted: "border-l-line-strong bg-card-muted",
  };
  return (
    <div className={cx("rounded-sm border-l-[3px] p-4", accent[tone])}>
      <p className="label-caps text-ink-muted">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-ink">{children}</div>
    </div>
  );
}
