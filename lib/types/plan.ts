export type GeneratedPlan = {
  checklist: string[];
  recommendations: string[];
};

export type PlanApiResponse = GeneratedPlan & {
  id: string;
  language?: string;
  translatedWith?: "google" | "openai";
};

export function isGeneratedPlan(payload: unknown): payload is GeneratedPlan {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const plan = payload as Record<string, unknown>;

  return (
    Array.isArray(plan.checklist) &&
    plan.checklist.every((item) => typeof item === "string") &&
    Array.isArray(plan.recommendations) &&
    plan.recommendations.every((item) => typeof item === "string")
  );
}
