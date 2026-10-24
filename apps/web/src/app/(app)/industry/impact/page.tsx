import type { Metadata } from "next";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import {
  AreaChart,
  BarRow,
  Callout,
  Donut,
  Legend,
  MetricTile,
  Panel,
  Readout,
  StatusChip,
} from "@/features/gov/components";
import { DISTRICT } from "@/features/gov/data";
import { CSR_POOL, IMPACT, PARTNER } from "@/features/industry/data";
import { FileRow } from "@/features/industry/components";

export const metadata: Metadata = { title: "CSR & Impact Ledger" };

/**
 * The audited CSR ledger.
 *
 * This is the screen a compliance officer prints, so every figure on it has to
 * reconcile to something the district can counter-sign: the domain split sums
 * to the FY26 utilisation, the partner rows sum to the same, and the Schedule
 * VII citation names the head the spend is booked under.
 */
export default function ImpactLedgerPage() {
  return (
    <div className="mx-auto flex max-w-[92rem] flex-col gap-6">
      <header className="rounded-md border border-line bg-card p-6 shadow-level1">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="label-caps text-navy">
                CSR compliance & ESG impact portal
              </p>
              <span className="mono-data text-ink-faint">
                Certificate {IMPACT.certificate}
              </span>
            </div>
            <h1 className="headline-xl mt-3 text-ink">
              Corporate impact & innovation ledger
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Audited metrics on {PARTNER.name}&rsquo;s CSR expenditure, the
              student skill it created and the citizen outcomes the{" "}
              {DISTRICT.name} Collectorate has verified against it.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 xl:items-end">
            <StatusChip icon="shield" tone="impact">
              Next audit review · {IMPACT.nextAudit}
            </StatusChip>
            <Button icon="download">Download CSR impact certificate</Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {IMPACT.headline.map((item) => (
          <MetricTile
            delta={item.note}
            footLabel="Verified by"
            footValue="Ranchi Collectorate"
            icon={item.icon}
            key={item.label}
            label={item.label}
            tone={item.tone}
            value={item.value}
          />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          action={
            <StatusChip icon="banknote" tone="community">
              {CSR_POOL.utilised} of {CSR_POOL.committed}
            </StatusChip>
          }
          caption="FY26 civic-innovation window"
          title="Resource deployment by domain"
        >
          <div className="flex flex-wrap items-center gap-8">
            <Donut
              centreLabel="deployed"
              centreValue={CSR_POOL.utilised}
              segments={IMPACT.domains.map((domain) => ({
                label: domain.label,
                share: domain.percent,
                tone: domain.tone,
              }))}
            />
            <div className="min-w-[16rem] flex-1">
              <div className="flex flex-col gap-3">
                {IMPACT.domains.map((domain) => (
                  <BarRow
                    key={domain.label}
                    label={domain.label}
                    percent={domain.percent}
                    tone={domain.tone}
                    value={domain.value}
                  />
                ))}
              </div>
              <div className="mt-5">
                <Callout title="Statutory head" tone="muted">
                  All funds are channelled under {CSR_POOL.schedule}. The{" "}
                  {CSR_POOL.committed} window is the JanMaang slice of the
                  group&rsquo;s {CSR_POOL.groupOutlay} {DISTRICT.state} CSR
                  outlay, not the whole of it.
                </Callout>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          caption="Quarterly disbursement, FY25 Q1 – FY26 Q2"
          title="Tranche release curve"
        >
          <AreaChart
            height={140}
            series={IMPACT.disbursement}
            tone="community"
          />
          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            {IMPACT.outcomes.map((outcome) => (
              <div
                className="flex items-baseline justify-between gap-3"
                key={outcome.label}
              >
                <span className="text-sm text-ink-muted">{outcome.label}</span>
                <span className="mono-data text-ink">{outcome.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          caption="Where the money went"
          title="University partner performance"
        >
          <div className="flex flex-col gap-3">
            {IMPACT.partners.map((partner) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-card-muted p-4"
                key={partner.name}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {partner.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {partner.note}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="mono-data text-ink">{partner.amount}</span>
                  <span className="relative h-2 w-28 rounded-full bg-line">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-impact"
                      style={{ width: `${partner.percent}%` }}
                    />
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Legend
              items={[
                { label: "Deployed against a sanction order", tone: "impact" },
                { label: "Committed, awaiting milestone", tone: "soft-impact" },
              ]}
            />
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel caption="For the audit file" title="Compliance artefacts">
            <div className="flex flex-col gap-2">
              <FileRow
                icon="file-pen"
                meta="PDF"
                name="CSR_Impact_Certificate_FY26.pdf"
              />
              <FileRow
                icon="shield"
                meta="PDF"
                name="Collectorate_Tranche_Verifications.pdf"
              />
              <FileRow
                icon="bar-chart"
                meta="CSV"
                name="Beneficiary_Outcome_Register.csv"
              />
              <FileRow
                icon="award"
                meta="PDF"
                name="Joint_IP_Filings_FY26.pdf"
              />
            </div>
          </Panel>

          <Panel
            caption="Independent verification"
            title="What the district signs"
          >
            <div className="grid gap-3">
              <Readout
                label="Tranches counter-signed"
                note="Every release matched to a sanction order"
                value="11 of 11"
              />
              <Readout
                label="Citizen sign-offs recorded"
                note="OTP audit at asset handover"
                value="19"
              />
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
              <Icon
                className="mt-0.5 shrink-0 text-ink-faint"
                name="lock"
                size={13}
              />
              Figures are drawn from the district ledger, not from partner
              self-reporting. A tranche the Collectorate has not counter-signed
              does not appear on this page.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
