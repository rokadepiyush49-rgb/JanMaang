"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { Callout, StatusChip } from "@/features/gov/components";
import { SUPPORT_OPTIONS } from "./data";

/**
 * The partnership proposal builder.
 *
 * The one interactive surface in `/industry`: everything else in the segment
 * is read-only telemetry and renders on the server. A sponsor ticks the
 * commitments they are willing to make, the funding line adds itself up, and
 * the docket goes to the district and the faculty head together — which is the
 * whole point of the portal, so it is worth the client bundle.
 *
 * There is no endpoint behind `onSubmit` yet. Rather than fake a network call,
 * it moves to a local "queued" state and says so on screen; wire it to
 * services/api/app/modules/funding when the proposals route lands.
 */

const PRESET = new Set(
  SUPPORT_OPTIONS.filter((option) => option.preset).map((option) => option.id),
);

function inr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function ProposalBuilder({
  projectId,
  projectTitle,
  beneficiary,
  officer,
  gapAmount,
}: {
  projectId: string;
  projectTitle: string;
  beneficiary: string;
  officer: string;
  gapAmount: number;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(PRESET));
  const [message, setMessage] = useState("");
  const [queued, setQueued] = useState(false);

  /** The grant line is worth whatever this docket is short by; every other
   *  line carries its own catalogue price. */
  const options = useMemo(
    () =>
      SUPPORT_OPTIONS.map((option) => ({
        ...option,
        amount: option.fillsGap ? gapAmount : option.amount,
      })),
    [gapAmount],
  );

  const total = useMemo(
    () =>
      options
        .filter((option) => selected.has(option.id))
        .reduce((sum, option) => sum + option.amount, 0),
    [options, selected],
  );

  const inKind = useMemo(
    () =>
      options.filter((option) => selected.has(option.id) && option.amount === 0)
        .length,
    [options, selected],
  );

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (queued) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-sm border border-impact bg-impact-wash p-6">
        <StatusChip icon="check-circle" tone="impact">
          Proposal queued for dispatch
        </StatusChip>
        <div>
          <p className="headline-md text-ink">
            {projectTitle} ({projectId})
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {selected.size} commitment{selected.size === 1 ? "" : "s"} totalling{" "}
            <span className="font-semibold text-ink">{inr(total)}</span> in
            funding
            {inKind > 0
              ? ` plus ${inKind} in-kind commitment${inKind === 1 ? "" : "s"}`
              : ""}
            . Dispatched to {officer} and the {beneficiary} faculty head
            together.
          </p>
          <p className="mt-3 text-xs text-ink-faint">
            Held locally — the proposals endpoint is not live yet, so nothing
            has left this browser.
          </p>
        </div>
        <Button
          icon="arrow-left"
          onClick={() => setQueued(false)}
          size="sm"
          tone="outline"
        >
          Edit the draft
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setQueued(true);
      }}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Commitments for the student cohort</legend>
        {options.map((option) => {
          const checked = selected.has(option.id);
          return (
            <label
              className={[
                "flex cursor-pointer items-start gap-3 rounded-sm border p-3.5 transition-colors",
                checked
                  ? "border-impact bg-impact-wash"
                  : "border-line bg-card hover:bg-card-muted",
              ].join(" ")}
              key={option.id}
            >
              <input
                checked={checked}
                className="mt-0.5 size-4 shrink-0 accent-[#10B981]"
                name="commitments"
                onChange={() => toggle(option.id)}
                type="checkbox"
                value={option.id}
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <Icon
                    className="text-ink-muted"
                    name={option.icon}
                    size={15}
                  />
                  <span className="text-sm font-semibold text-ink">
                    {option.label}
                  </span>
                  <span className="mono-data text-ink-faint">
                    {option.amount > 0 ? inr(option.amount) : "In kind"}
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                  {option.body}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-card-muted p-4">
        <div>
          <p className="label-caps text-ink-faint">
            Proposed funding allocation
          </p>
          <p className="headline-lg mt-1 text-ink tabular-nums">{inr(total)}</p>
        </div>
        <p className="max-w-xs text-xs leading-relaxed text-ink-muted">
          {total >= gapAmount
            ? `Covers the full ${inr(gapAmount)} gap the cohort filed for prototyping and field commissioning.`
            : `${inr(gapAmount - total)} short of the ${inr(gapAmount)} gap — the district will look for a co-sponsor.`}
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="label-caps text-ink-muted">
          Message to the district officer and faculty head
        </span>
        <textarea
          className="min-h-24 rounded-sm border border-line bg-card p-3 text-sm text-ink placeholder:text-ink-faint focus:border-navy focus:outline-none"
          name="message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Scope, site access needs, engineer availability…"
          value={message}
        />
      </label>

      <Callout title="What happens on submit" tone="navy">
        The docket goes to {officer} and the {beneficiary} faculty head at the
        same time. Neither can release a tranche without the other, and every
        tranche is stamped against the sanction order.
      </Callout>

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={selected.size === 0}
          iconAfter="arrow-right"
          type="submit"
        >
          Submit signed proposal
        </Button>
        <Button
          onClick={() => setSelected(new Set(PRESET))}
          tone="outline"
          type="button"
        >
          Reset to recommended
        </Button>
      </div>
    </form>
  );
}
