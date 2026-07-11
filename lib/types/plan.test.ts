import { describe, expect, it } from "vitest";
import { isGeneratedPlan } from "@/lib/types/plan";

const validPlan = {
  checklist: [
    { phase: "Before the storm", items: ["Stock water", "Charge devices"] },
    { phase: "During the storm", items: ["Stay indoors", "Avoid flooded roads"] },
    { phase: "After the storm", items: ["Inspect home", "Report outages"] },
  ],
  recommendations: ["Tip A", "Tip B", "Tip C"],
  travelAdvisories: [
    "Avoid the underpass on X Road",
    "Use elevated Route Y if Z floods",
  ],
};

describe("isGeneratedPlan", () => {
  it("accepts phased checklist, recommendations, and travel advisories", () => {
    expect(isGeneratedPlan(validPlan)).toBe(true);
  });

  it("rejects legacy flat checklist arrays", () => {
    expect(
      isGeneratedPlan({
        checklist: ["Item 1", "Item 2"],
        recommendations: ["Tip A", "Tip B", "Tip C"],
        travelAdvisories: ["Avoid X Road"],
      }),
    ).toBe(false);
  });

  it("rejects missing travel advisories or wrong phase count", () => {
    expect(
      isGeneratedPlan({
        checklist: validPlan.checklist.slice(0, 2),
        recommendations: ["Tip A", "Tip B", "Tip C"],
        travelAdvisories: ["Avoid X Road", "Use Y Route"],
      }),
    ).toBe(false);

    expect(
      isGeneratedPlan({
        ...validPlan,
        travelAdvisories: ["Only one"],
      }),
    ).toBe(false);
  });

  it("rejects missing or invalid shapes", () => {
    expect(isGeneratedPlan(null)).toBe(false);
    expect(
      isGeneratedPlan({
        checklist: validPlan.checklist,
        recommendations: "bad",
        travelAdvisories: [],
      }),
    ).toBe(false);
  });
});
