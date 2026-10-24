"use client";

import { useState } from "react";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { Callout, StatusChip } from "./components";

/**
 * The officer's weekly field update.
 *
 * The one interactive surface in `/officer`, for the same reason the proposal
 * builder is the one in `/industry`: it is the job the portal exists for. The
 * progress figure may only move forward — a work cannot un-build itself, and
 * a lower number is a correction, which goes through the EE, not this form.
 *
 * There is no endpoint behind `onSubmit` yet. As with the proposal builder it
 * moves to a local "queued" state and says so; wire it to
 * services/api/app/modules/projects when the field-update route lands.
 */
export function FieldUpdateForm({
  workId,
  lastPercent,
  milestones,
}: {
  workId: string;
  lastPercent: number;
  milestones: { code: string; name: string }[];
}) {
  const [percent, setPercent] = useState(lastPercent);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState(0);
  const [onSite, setOnSite] = useState(true);
  const [queued, setQueued] = useState(false);

  const noteTooShort = note.trim().length < 20;
  const invalid = percent < lastPercent || noteTooShort || photos === 0;

  if (queued) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip icon="check-circle" tone="impact">
            Update queued
          </StatusChip>
          <span className="mono-data text-ink-faint">#{workId}</span>
        </div>
        <p className="text-sm text-ink">
          {percent}% progress with {photos} photograph{photos === 1 ? "" : "s"}
          {onSite ? ", geo-tagged on site" : ", recorded as a desk review"}.
        </p>
        <Callout title="Not yet sent" tone="community">
          The field-update service is not live in this build, so nothing has
          left this browser. The update will post against your officer
          credential once the projects API is connected.
        </Callout>
        <div>
          <Button
            icon="arrow-left"
            onClick={() => setQueued(false)}
            size="sm"
            tone="outline"
          >
            Edit the update
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!invalid) setQueued(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="label-caps text-ink-muted">Milestone</span>
          <select
            className="h-11 rounded-sm border border-line bg-card px-3 text-sm text-ink focus:border-navy focus:outline-none"
            defaultValue={milestones[0]?.code}
            name="milestone"
          >
            {milestones.length === 0 ? (
              <option value="">General progress</option>
            ) : (
              milestones.map((milestone) => (
                <option key={milestone.code} value={milestone.code}>
                  {milestone.code} · {milestone.name}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="label-caps flex items-center justify-between text-ink-muted">
            Physical progress
            <span className="mono-data text-ink">{percent}%</span>
          </span>
          <input
            aria-describedby={`${workId}-percent-note`}
            className="h-11 accent-[#10B981]"
            max={100}
            min={lastPercent}
            name="percent"
            onChange={(event) => setPercent(Number(event.target.value))}
            step={1}
            type="range"
            value={percent}
          />
          <span
            className="text-xs text-ink-faint"
            id={`${workId}-percent-note`}
          >
            Last reported {lastPercent}%. Progress can only move forward.
          </span>
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="label-caps text-ink-muted">What changed on site</span>
        <textarea
          className="min-h-28 rounded-sm border border-line bg-card p-3 text-sm text-ink placeholder:text-ink-faint focus:border-navy focus:outline-none"
          name="note"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Measurements taken, materials received, labour on site, blockers…"
          value={note}
        />
        {note.length > 0 && noteTooShort ? (
          <span className="text-xs text-danger">
            Write at least 20 characters — this note is what the citizen reads.
          </span>
        ) : null}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="label-caps text-ink-muted">Site photographs</span>
          <span className="flex h-11 items-center gap-3 rounded-sm border border-dashed border-line-strong bg-card-muted px-3 text-sm text-ink-muted">
            <Icon name="upload" size={16} />
            <input
              accept="image/*"
              capture="environment"
              className="min-w-0 flex-1 text-xs file:mr-3 file:rounded-sm file:border-0 file:bg-primary file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white"
              multiple
              name="photos"
              onChange={(event) => setPhotos(event.target.files?.length ?? 0)}
              type="file"
            />
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-sm border border-line bg-card p-3.5">
          <input
            checked={onSite}
            className="mt-0.5 size-4 shrink-0 accent-[#002147]"
            name="onSite"
            onChange={(event) => setOnSite(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="block text-sm font-semibold text-ink">
              I am on site
            </span>
            <span className="mt-0.5 block text-xs text-ink-muted">
              Attaches this device&rsquo;s GPS fix. Unticked, the update is
              recorded as a desk review and does not count toward a milestone.
            </span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={invalid} iconAfter="send" type="submit">
          Post field update
        </Button>
        {photos === 0 ? (
          <span className="text-xs text-ink-faint">
            At least one photograph is required.
          </span>
        ) : null}
      </div>
    </form>
  );
}
