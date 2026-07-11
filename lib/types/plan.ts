import {
  type ChecklistPhase,
  isPhasedChecklist,
} from "@/lib/plan-checklist";
import type { PlanWeatherSummary } from "@/lib/plan-weather-context";

export type { ChecklistPhase } from "@/lib/plan-checklist";
export type { PlanWeatherSummary } from "@/lib/plan-weather-context";

export type GeneratedPlan = {
  checklist: ChecklistPhase[];
  recommendations: string[];
  travelAdvisories: string[];
};

export type PlanApiResponse = GeneratedPlan & {
  id: string;
  language?: string;
  translatedWith?: "google" | "openai";
  saved?: boolean;
  weather?: PlanWeatherSummary;
};

function isStringArray(value: unknown, minLength = 1): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= minLength &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

export function isGeneratedPlan(payload: unknown): payload is GeneratedPlan {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const plan = payload as Record<string, unknown>;

  return (
    isPhasedChecklist(plan.checklist) &&
    plan.checklist.length === 3 &&
    isStringArray(plan.recommendations, 3) &&
    isStringArray(plan.travelAdvisories, 2)
  );
}
