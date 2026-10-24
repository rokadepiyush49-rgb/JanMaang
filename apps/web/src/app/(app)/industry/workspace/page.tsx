import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Avatar, Button, ButtonLink } from "@/components/ui";
import { Callout, Panel, Readout, StatusChip } from "@/features/gov/components";
import { PROJECT_SPOTLIGHT } from "@/features/gov/department";
import { PARTNER, WORKSPACE } from "@/features/industry/data";
import { FileRow, MilestoneRail } from "@/features/industry/components";

export const metadata: Metadata = { title: "Active Workspace" };

const STATUS_TONE = {
  danger: "bg-danger-wash text-danger",
  community: "bg-community-soft text-community-deep",
  impact: "bg-impact-wash text-impact-deep",
} as const;

/**
 * The co-development workspace for a live contract.
 *
 * Everything on this screen is shared with the cohort and the district — the
 * telemetry table is the same stream `/department` renders as an area chart,
 * read here row by row because a sponsor debugging their own hardware wants
 * the timestamps, not the trend.
 */
export default function WorkspacePage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip icon="refresh" tone="impact">
                Active co-development
              </StatusChip>
              <span className="mono-data text-ink-faint">
                {WORKSPACE.projectId} · Contract {WORKSPACE.contract}
              </span>
            </div>
            <h1 className="headline-xl mt-4 text-ink">{WORKSPACE.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {WORKSPACE.body}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button icon="calendar" tone="outline">
              Schedule mentorship call
            </Button>
            <Button icon="upload">Upload telemetry spec</Button>
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <p className="label-caps mb-3 text-ink-faint">
            Milestone progression
          </p>
          <MilestoneRail steps={WORKSPACE.milestones} />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* ----------------------------------------------- live stream -- */}
          <Panel
            action={
              <StatusChip icon="gauge" tone="impact">
                Signal {WORKSPACE.stream.signal}
              </StatusChip>
            }
            bodyClassName="p-0"
            caption={`Live field sensor stream · ${WORKSPACE.stream.node}`}
            title="Canal telemetry"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left">
                <caption className="sr-only">
                  Latest flow and bank pressure readings from the canal node
                </caption>
                <thead>
                  <tr className="border-b-2 border-line-strong bg-card-muted">
                    {[
                      "Timestamp",
                      "Flow velocity",
                      "Bank pressure",
                      "Status",
                    ].map((header, index) => (
                      <th
                        className={[
                          "label-caps px-4 py-3 text-ink-muted",
                          index === 3 ? "text-right" : "",
                        ].join(" ")}
                        key={header}
                        scope="col"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WORKSPACE.stream.rows.map((row) => (
                    <tr
                      className="border-b border-line last:border-0"
                      key={row.time}
                    >
                      <td className="mono-data px-4 py-3 text-ink-muted">
                        {row.time}
                      </td>
                      <td className="mono-data px-4 py-3 text-ink">
                        {row.flow}
                      </td>
                      <td className="mono-data px-4 py-3 text-ink">
                        {row.pressure}
                        {row.spike ? (
                          <span className="ml-2 text-xs font-bold text-danger">
                            spike
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={[
                            "inline-flex rounded-sm px-2 py-1 text-xs font-semibold",
                            STATUS_TONE[row.tone],
                          ].join(" ")}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
              <p className="text-xs text-ink-muted">{WORKSPACE.stream.sink}</p>
              <Button icon="refresh" size="sm" tone="ghost">
                Refresh telemetry
              </Button>
            </div>
          </Panel>

          {/* ---------------------------------------------- field updates -- */}
          <Panel
            action={
              <Button icon="send" size="sm" tone="outline">
                Post an update
              </Button>
            }
            caption="Shared with the cohort, the faculty lead and the block officer"
            title="Field engineering updates"
          >
            <ol className="flex flex-col gap-4">
              {WORKSPACE.updates.map((update) => (
                <li className="flex gap-3" key={update.when}>
                  <Avatar name={update.author} size={40} tone="navy" />
                  <div className="min-w-0 flex-1 rounded-sm border border-line bg-card-muted p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">
                        {update.author}
                        <span className="ml-2 text-xs font-medium text-ink-muted">
                          {update.role}
                        </span>
                      </p>
                      <span className="text-xs text-ink-faint">
                        {update.when}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {update.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <aside className="flex flex-col gap-6">
          <Panel caption="Contract position" title="Where the money stands">
            <div className="flex flex-col gap-3">
              <Readout
                label="Grant committed"
                note={PROJECT_SPOTLIGHT.sponsor.scope}
                value={PROJECT_SPOTLIGHT.sponsor.grant}
              />
              <Readout
                label="Tranche 1 released"
                note="Verified by the Collectorate on 21 Sep 2025"
                value="₹1,25,000"
              />
              <Readout
                label="Tranche 2 on milestone"
                note="Releases on field sluice installation"
                value="₹1,25,000"
              />
            </div>
          </Panel>

          <Panel caption="Shared documents" title="Working repository">
            <div className="flex flex-col gap-2">
              {WORKSPACE.documents.map((doc) => (
                <FileRow icon={doc.icon} key={doc.name} name={doc.name} />
              ))}
            </div>
            <Button
              className="mt-4 w-full"
              icon="paperclip"
              size="sm"
              tone="outline"
            >
              Attach a document
            </Button>
          </Panel>

          <Panel caption="Site access" title="Field clearance">
            <Callout title="Need field access clearance?" tone="navy">
              Raise a district liaison pass so {PARTNER.name} technicians can
              accompany the student team onto the canal bank. The block officer
              countersigns it and it is valid for the sanction window.
            </Callout>
            <Button className="mt-4 w-full" icon="shield" size="sm">
              Generate collector field pass
            </Button>
          </Panel>

          <Panel caption="Next" title="Handover checklist">
            <ul className="flex flex-col gap-2 text-sm text-ink-muted">
              {[
                "Second LoRaWAN gateway commissioned",
                "Sluice actuator dry-run signed by the cohort",
                "Citizen OTP audit scheduled with the panchayat",
              ].map((item) => (
                <li className="flex items-start gap-2" key={item}>
                  <Icon
                    className="mt-0.5 shrink-0 text-ink-faint"
                    name="check"
                    size={15}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink
              className="mt-4 w-full"
              href={`/industry/projects/${WORKSPACE.projectId}`}
              iconAfter="arrow-right"
              size="sm"
              tone="outline"
            >
              Open the dossier
            </ButtonLink>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
