import type { PlanApiResponse } from "@/lib/types/plan";
import { LANGUAGE_LABELS, type PlanLanguage } from "@/lib/languages";

type PlanResultsProps = {
  plan: PlanApiResponse;
};

function getLanguageLabel(code?: string): string | null {
  if (!code || !(code in LANGUAGE_LABELS)) {
    return null;
  }

  return LANGUAGE_LABELS[code as PlanLanguage];
}

export function PlanResults({ plan }: PlanResultsProps) {
  const languageLabel = getLanguageLabel(plan.language);

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4">
        <p className="text-sm font-medium text-teal-800">
          Your family plan is ready. Review the checklist below — it&apos;s saved
          automatically to your account.
        </p>
        {languageLabel && (
          <p className="mt-2 text-xs text-teal-700">
            Language: {languageLabel}
            {plan.translatedWith === "google" && " · translated via Google Cloud Translation"}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="citizen-card">
          <h3 className="citizen-heading text-lg">Your Checklist</h3>
          <p className="citizen-subtext mt-1">
            5 practical steps for your household
          </p>
          <ol className="mt-5 space-y-3">
            {plan.checklist.map((item, index) => (
              <li
                key={`${plan.id}-check-${index}`}
                className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-monsoon-secondary text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-700">{item}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="citizen-card">
          <h3 className="citizen-heading text-lg">Safety Tips</h3>
          <p className="citizen-subtext mt-1">
            Broader guidance to keep your family safe
          </p>
          <ul className="mt-5 space-y-3">
            {plan.recommendations.map((item, index) => (
              <li
                key={`${plan.id}-rec-${index}`}
                className="rounded-2xl border-l-4 border-monsoon-secondary bg-slate-50 px-4 py-3"
              >
                <p className="text-sm leading-relaxed text-slate-700">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
