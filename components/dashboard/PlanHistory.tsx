"use client";

import { useCallback, useEffect, useState } from "react";
import { IconLocation } from "@/components/dashboard/CitizenIcons";
import { Modal } from "@/components/ui/Modal";
import { normalizeChecklist } from "@/lib/plan-checklist";

type HistoryPlan = {
  id: string;
  location: string;
  familySize: number;
  housingType: string;
  checklist: unknown;
  safetyRecommendations: string[];
  travelAdvisories?: string[];
  summary: string | null;
  createdAt: string;
};

const HOUSING_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "Independent House",
  GROUND_FLOOR: "Ground Floor",
  TEMPORARY: "Temporary",
  VEHICLE: "Vehicle",
};

function formatHousingType(value: string): string {
  return HOUSING_LABELS[value] ?? value;
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

type PlanHistoryProps = {
  refreshKey?: number;
};

export function PlanHistory({ refreshKey = 0 }: PlanHistoryProps) {
  const [plans, setPlans] = useState<HistoryPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<HistoryPlan | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/history");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load plans");
      }

      setPlans(Array.isArray(data.plans) ? data.plans : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load plans",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory, refreshKey]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="citizen-card animate-pulse">
            <div className="h-10 w-10 rounded-2xl bg-slate-100" />
            <div className="mt-4 h-5 w-2/3 rounded bg-slate-100" />
            <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="citizen-card">
        <p className="text-sm text-orange-600">{error}</p>
        <button
          type="button"
          onClick={() => void loadHistory()}
          className="monsoon-btn-primary mt-4 rounded-2xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="citizen-card text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <IconLocation className="h-7 w-7" />
        </div>
        <h3 className="citizen-heading mt-4 text-lg">No saved plans yet</h3>
        <p className="citizen-subtext mt-2">
          Create your first family plan from the home screen to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.id} className="citizen-card flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-monsoon-secondary">
                <IconLocation className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {formatHousingType(plan.housingType)}
              </span>
            </div>

            <h3 className="citizen-heading mt-4 line-clamp-2 text-base leading-snug">
              {plan.location}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="tabular-nums">{formatRelativeTime(plan.createdAt)}</span>
              <span aria-hidden>·</span>
              <span className="tabular-nums">{plan.familySize} people</span>
            </div>

            <button
              type="button"
              onClick={() => setActivePlan(plan)}
              className="monsoon-btn-primary mt-5 w-full rounded-2xl"
            >
              View Plan
            </button>
          </article>
        ))}
      </div>

      {activePlan && (
        <AnalysisModal plan={activePlan} onClose={() => setActivePlan(null)} />
      )}
    </>
  );
}

function AnalysisModal({
  plan,
  onClose,
}: {
  plan: HistoryPlan;
  onClose: () => void;
}) {
  const checklistPhases = normalizeChecklist(plan.checklist);
  const travelAdvisories = plan.travelAdvisories ?? [];

  return (
    <Modal open onClose={onClose} titleId="plan-modal-title">
      <div className="flex max-h-[min(90vh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
        <header className="shrink-0 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                id="plan-modal-title"
                className="citizen-heading text-xl sm:text-2xl"
              >
                {plan.location}
              </h2>
              <p className="citizen-subtext mt-2 tabular-nums">
                {formatRelativeTime(plan.createdAt)} · {plan.familySize} people ·{" "}
                {formatHousingType(plan.housingType)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="monsoon-touch-target shrink-0 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-monsoon-primary"
            >
              Close
            </button>
          </div>
        </header>

        <div className="monsoon-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-monsoon-secondary">
                Timeline Checklist
              </h3>
              <div className="mt-3 space-y-5">
                {checklistPhases.map((phase, phaseIndex) => (
                  <div key={`${plan.id}-phase-${phaseIndex}`}>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {phase.phase}
                    </h4>
                    <ol className="mt-2 space-y-2">
                      {phase.items.map((item, index) => (
                        <li
                          key={`${plan.id}-c-${phaseIndex}-${index}`}
                          className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                        >
                          {index + 1}. {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-monsoon-secondary">
                Safety Tips
              </h3>
              <ul className="mt-3 space-y-2">
                {plan.safetyRecommendations.map((item, index) => (
                  <li
                    key={`${plan.id}-r-${index}`}
                    className="rounded-2xl border-l-4 border-monsoon-secondary bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {travelAdvisories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-monsoon-secondary">
                  Travel &amp; Evacuation Advisories
                </h3>
                <ul className="mt-3 space-y-2">
                  {travelAdvisories.map((item, index) => (
                    <li
                      key={`${plan.id}-t-${index}`}
                      className="rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-slate-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
