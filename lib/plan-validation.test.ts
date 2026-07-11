import { describe, expect, it } from "vitest";
import { validatePlanRequest } from "@/lib/plan-validation";

describe("validatePlanRequest", () => {
  const validBody = {
    location: "Yelahanka, Bengaluru",
    familySize: 4,
    housingType: "Apartment",
    language: "en",
    specialNeeds: "elderly parent",
  };

  it("accepts a complete valid payload", () => {
    const result = validatePlanRequest(validBody);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.location).toBe("Yelahanka, Bengaluru");
      expect(result.data.familySize).toBe(4);
      expect(result.data.language).toBe("en");
      expect(result.data.specialNeeds).toBe("elderly parent");
    }
  });

  it("requires location", () => {
    const result = validatePlanRequest({ ...validBody, location: "  " });
    expect(result).toEqual({ success: false, error: "Location is required" });
  });

  it("validates family size bounds", () => {
    expect(validatePlanRequest({ ...validBody, familySize: 0 })).toEqual({
      success: false,
      error: "Family size must be between 1 and 20",
    });
    expect(validatePlanRequest({ ...validBody, familySize: 21 })).toEqual({
      success: false,
      error: "Family size must be between 1 and 20",
    });
    expect(validatePlanRequest({ ...validBody, familySize: 2.5 })).toEqual({
      success: false,
      error: "Family size must be between 1 and 20",
    });
  });

  it("validates housing type", () => {
    const result = validatePlanRequest({
      ...validBody,
      housingType: "Treehouse",
    });
    expect(result).toEqual({ success: false, error: "Invalid housing type" });
  });

  it("validates language preference", () => {
    const result = validatePlanRequest({ ...validBody, language: "ta" });
    expect(result).toEqual({
      success: false,
      error: "Invalid language preference",
    });
  });

  it("defaults language to English when omitted", () => {
    const result = validatePlanRequest({
      location: validBody.location,
      familySize: validBody.familySize,
      housingType: validBody.housingType,
      specialNeeds: validBody.specialNeeds,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("en");
    }
  });
});
