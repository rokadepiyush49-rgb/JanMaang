import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { Callout, Panel, StatusChip } from "@/features/gov/components";
import { TODAY, WEEK, WORKS } from "@/features/gov/officer";

export const metadata: Metadata = { title: "Site Visits" };

const VISIT_STATE = {
  done: { label: "Visited", tone: "impact" },
  next: { label: "Next stop", tone: "community" },
  later: { label: "Later today", tone: "muted" },
} as const;

/**
 * The week's field schedule.
 *
 * Today is shown as a route, not a list: the stops are in driving order and
 * each carries the checklist the officer must complete *on site* — the
 * evidence a field update is rejected without. The rest of the week is a
 * plain table, because nobody needs a checklist for Thursday on Monday.
 */
export default function SiteVisitsPage() {
  const titleOf = (id: string) =>
    WORKS.find((work) => work.id === id)?.title ?? id;

  return (
    <div className="mx-auto flex max-w-[80rem] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="label-caps mb-2 flex items-center gap-2 text-ink-faint">
            <span>Field Desk</span>
            <Icon name="chevron-right" size={12} />
            <span>Site visits</span>
          </nav>
          <h1 className="headline-xl text-ink">Site visits</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            Starting from {TODAY.start} in vehicle{" "}
            <span className="mono-data text-ink">{TODAY.vehicle}</span>. Each
            stop&rsquo;s checklist must be complete before that work&rsquo;s
            update can be posted.
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon="map" size="sm" tone="outline">
            Open route map
          </Button>
          <Button icon="download" size="sm" tone="outline">
            Tour diary (PDF)
          </Button>
        </div>
      </header>

      <Panel caption={TODAY.date} title="Today's route">
        <ol className="relative space-y-4 border-l-2 border-line pl-6">
          {TODAY.visits.map((visit) => {
            const state = VISIT_STATE[visit.state];
            const done = visit.checklist.filter((item) => item.done).length;
            return (
              <li className="relative" key={visit.time}>
                <span
                  className={`absolute top-1.5 -left-[1.95rem] size-3.5 rounded-full border-2 border-card ${
                    visit.state === "done"
                      ? "bg-impact"
                      : visit.state === "next"
                        ? "bg-community"
                        : "bg-line-strong"
                  }`}
                />
                <div className="rounded-sm border border-line p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="mono-data text-ink">{visit.time}</span>
                      <StatusChip tone={state.tone}>{state.label}</StatusChip>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                      <Icon name="map-pin" size={13} />
                      {visit.distance} from previous stop
                    </span>
                  </div>
                  <h2 className="mt-2 text-sm font-bold text-ink">
                    {visit.site}
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    <Link
                      className="mono-data text-navy hover:underline"
                      href={`/officer/works/${visit.workId}`}
                    >
                      #{visit.workId}
                    </Link>{" "}
                    · {titleOf(visit.workId)}
                  </p>
                  <p className="mt-2 text-sm text-ink">{visit.purpose}</p>

                  <ul className="mt-3 grid gap-2 border-t border-line pt-3 sm:grid-cols-3">
                    {visit.checklist.map((item) => (
                      <li
                        className="flex items-center gap-2 text-xs"
                        key={item.label}
                      >
                        <Icon
                          className={
                            item.done ? "text-impact-deep" : "text-ink-faint"
                          }
                          name={item.done ? "check-circle" : "x"}
                          size={14}
                        />
                        <span
                          className={item.done ? "text-ink" : "text-ink-muted"}
                        >
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-ink-faint">
                    {done} of {visit.checklist.length} on-site checks complete
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel bodyClassName="p-0" caption="Planned" title="Rest of the week">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <caption className="sr-only">Planned site visits</caption>
              <thead>
                <tr className="border-b-2 border-line-strong bg-card-muted">
                  {["Day", "Work", "Site", "Purpose"].map((header) => (
                    <th
                      className="label-caps px-4 py-3 text-ink-muted"
                      key={header}
                      scope="col"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEK.map((row) => (
                  <tr
                    className="border-b border-line last:border-0 hover:bg-card-muted"
                    key={`${row.day}-${row.workId}`}
                  >
                    <td className="mono-data px-4 py-3 text-ink">{row.day}</td>
                    <td className="px-4 py-3">
                      <Link
                        className="mono-data text-navy hover:underline"
                        href={`/officer/works/${row.workId}`}
                      >
                        #{row.workId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink">{row.site}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {row.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <Callout title="Tour diary rule" tone="navy">
            A visit without a geo-tagged photograph inside the work&rsquo;s
            boundary is recorded as a desk review, not a site visit, and does
            not count toward the milestone.
          </Callout>
          <Callout title="Citizen presence" tone="community">
            Sign-off visits need the Jal Sahiya or a ward member present. The
            OTP goes to the households that raised the demand, not to the
            agency.
          </Callout>
        </div>
      </div>
    </div>
  );
}
