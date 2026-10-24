import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import {
  Callout,
  Panel,
  SeverityChip,
  StatusChip,
} from "@/features/gov/components";
import { LIFECYCLE } from "@/features/gov/data";
import { QUEUE } from "@/features/gov/panchayat";

export const metadata: Metadata = { title: "Verification Queue" };

/**
 * Stage 3 of the lifecycle, which is the panchayat's entire statutory job.
 *
 * Each card is a decision, not a report: the four checks are the conditions
 * the district will hold the panchayat to, and the two buttons are the only
 * two outcomes. Deliberately no "sanction" affordance — the panchayat cannot
 * sanction, and offering a disabled one would suggest otherwise.
 */
export default function VerificationQueuePage() {
  const stage = LIFECYCLE.find((entry) => entry.owner === "Gram Panchayat");
  const overdue = QUEUE.filter((item) => item.overdue);

  return (
    <div className="mx-auto flex max-w-[80rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps rounded-sm bg-primary px-2.5 py-1 text-white">
                Stage {stage?.n} of {LIFECYCLE.length}
              </span>
              <StatusChip icon="landmark" tone="navy">
                {stage?.name}
              </StatusChip>
            </div>
            <h1 className="headline-xl mt-4 text-ink">Verification queue</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              A demand cannot reach the district sanction desk until this
              panchayat confirms it exists on the ground. Verify what you have
              seen, return what you have not, and record the reason either way —
              your note travels with the demand.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 xl:items-end">
            <StatusChip tone="navy">{QUEUE.length} in queue</StatusChip>
            {overdue.length > 0 ? (
              <StatusChip icon="alert-circle" tone="danger">
                {overdue.length} past the 72-hour window
              </StatusChip>
            ) : null}
          </div>
        </div>
      </header>

      {overdue.length > 0 ? (
        <Callout title="Escalation notice" tone="danger">
          Demand{overdue.length > 1 ? "s" : ""}{" "}
          {overdue.map((item) => `#${item.id}`).join(", ")} passed the statutory
          72-hour verification window. The block development officer is copied
          automatically on anything still unverified at seven days.
        </Callout>
      ) : null}

      <div className="flex flex-col gap-6">
        {QUEUE.map((item) => {
          const done = item.checks.filter((check) => check.done).length;
          const ready = done === item.checks.length - 1; // the duplicate check stays unticked when it passes
          return (
            <Panel
              action={
                <div className="flex flex-col items-end gap-1">
                  <SeverityChip severity={item.severity} withCode />
                  <span
                    className={`text-xs font-semibold ${
                      item.overdue ? "text-danger" : "text-ink-faint"
                    }`}
                  >
                    Raised {item.age} ago
                  </span>
                </div>
              }
              caption={`#${item.id} · ${item.ward}`}
              key={item.id}
              title={item.title}
            >
              <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <StatusChip icon="users" tone="navy">
                      {item.reports} citizen reports merged
                    </StatusChip>
                    <StatusChip icon="bot" tone="impact">
                      {item.confidence}% AI confidence
                    </StatusChip>
                    <StatusChip icon="paperclip">
                      {item.evidence} photo{item.evidence > 1 ? "s" : ""}{" "}
                      attached
                    </StatusChip>
                  </div>

                  <div className="rounded-sm border border-line bg-card-muted p-4">
                    <p className="label-caps flex items-center gap-1.5 text-ink-faint">
                      <Icon name="volume-on" size={13} />
                      Citizen voice note
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {item.voiceNote}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: item.evidence }).map((_, index) => (
                      <div
                        className="flex aspect-[4/3] items-center justify-center rounded-sm border border-line bg-card-muted"
                        key={index}
                      >
                        <Icon
                          className="text-line-strong"
                          name="eye"
                          size={22}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-sm border border-line p-4">
                    <p className="label-caps text-ink-faint">
                      Verification checklist
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {item.checks.map((check) => (
                        <li
                          className="flex items-start gap-2.5 text-sm"
                          key={check.label}
                        >
                          <span
                            className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                              check.done
                                ? "border-impact bg-impact text-white"
                                : "border-line-strong"
                            }`}
                          >
                            {check.done ? (
                              <Icon name="check" size={11} />
                            ) : null}
                          </span>
                          <span
                            className={
                              check.done ? "text-ink" : "text-ink-muted"
                            }
                          >
                            {check.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 border-t border-line pt-3 text-xs text-ink-faint">
                      {done} of {item.checks.length} recorded
                    </p>
                  </div>

                  <div className="mt-auto space-y-2">
                    <Button
                      className="w-full"
                      icon="check-circle"
                      tone={ready ? "impact" : "primary"}
                    >
                      Verify & escalate to district
                    </Button>
                    <Button className="w-full" icon="arrow-left" tone="outline">
                      Return to ward member
                    </Button>
                    <Button className="w-full" icon="x" tone="ghost">
                      Mark as duplicate
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
