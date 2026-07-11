export const LANGUAGE_OPTIONS = [
  { label: "English (Default)", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Kannada", value: "kn" },
] as const;

export type PlanLanguage = (typeof LANGUAGE_OPTIONS)[number]["value"];

export const LANGUAGE_LABELS: Record<PlanLanguage, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
};

export function isValidPlanLanguage(value: string): value is PlanLanguage {
  return value === "en" || value === "hi" || value === "kn";
}
