import { isValidPlanLanguage, type PlanLanguage } from "@/lib/languages";

export const VALID_HOUSING_TYPES = [
  "Apartment",
  "Independent House",
  "Ground Floor",
] as const;

export type ValidatedPlanRequest = {
  location: string;
  familySize: number;
  housingType: (typeof VALID_HOUSING_TYPES)[number];
  language: PlanLanguage;
  specialNeeds: string;
};

export function validatePlanRequest(
  body: unknown,
):
  | { success: true; data: ValidatedPlanRequest }
  | { success: false; error: string } {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid request body" };
  }

  const record = body as Record<string, unknown>;
  const location =
    typeof record.location === "string" ? record.location.trim() : "";
  const familySize = Number(record.familySize);
  const housingType =
    typeof record.housingType === "string" ? record.housingType.trim() : "";
  const language =
    typeof record.language === "string" ? record.language.trim() : "en";
  const specialNeeds =
    typeof record.specialNeeds === "string" ? record.specialNeeds.trim() : "";

  if (!location) {
    return { success: false, error: "Location is required" };
  }

  if (!Number.isInteger(familySize) || familySize < 1 || familySize > 20) {
    return { success: false, error: "Family size must be between 1 and 20" };
  }

  if (
    !VALID_HOUSING_TYPES.includes(
      housingType as (typeof VALID_HOUSING_TYPES)[number],
    )
  ) {
    return { success: false, error: "Invalid housing type" };
  }

  if (!isValidPlanLanguage(language)) {
    return { success: false, error: "Invalid language preference" };
  }

  return {
    success: true,
    data: {
      location,
      familySize,
      housingType: housingType as ValidatedPlanRequest["housingType"],
      language,
      specialNeeds,
    },
  };
}
