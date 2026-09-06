import { ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icon";

/**
 * The public landing page. No session, no API calls — this has to render for a
 * visitor who has never signed in, and it is the only route the proxy lets
 * through unconditionally.
 */

const PIPELINE = [
  { label: "Speak", icon: "message" as const },
  { label: "Analyse", icon: "sparkles" as const },
  { label: "Cluster", icon: "map" as const },
  { label: "Prioritise", icon: "bar-chart" as const },
  { label: "Fund", icon: "banknote" as const },
  { label: "Execute", icon: "rocket" as const },
  { label: "Verify", icon: "check-circle" as const },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-16">
      <span className="label-caps text-ink-faint">
        Jharkhand&rsquo;s Societal Innovation OS
      </span>
      <h1 className="headline-xl mt-3 text-ink sm:text-5xl">JanMaang</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        A citizen reports a local need. It gets structured, clustered with
        identical reports, ranked on five published factors, funded down the
        list — and verified by the people who asked for it.
      </p>

      <ol className="mt-10 flex flex-wrap gap-2">
        {PIPELINE.map((step, index) => (
          <li
            className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-ink-muted"
            key={step.label}
          >
            <Icon className="text-navy-tint" name={step.icon} size={16} />
            {step.label}
            {index < PIPELINE.length - 1 ? (
              <Icon
                aria-hidden
                className="text-ink-faint"
                name="chevron-right"
                size={14}
              />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/login" iconAfter="arrow-right" size="lg">
          Sign in
        </ButtonLink>
      </div>

      <p className="mt-10 text-sm text-ink-faint">
        Citizens report from the mobile app. Students, faculty, panchayats,
        departments and CSR partners work here.
      </p>
    </main>
  );
}
