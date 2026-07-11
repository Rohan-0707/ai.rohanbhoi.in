import { describe, expect, it } from "vitest";
import { isGeneratedPlan } from "@/lib/types/plan";

describe("isGeneratedPlan", () => {
  it("accepts valid checklist and recommendations", () => {
    expect(
      isGeneratedPlan({
        checklist: ["Item 1", "Item 2"],
        recommendations: ["Tip A"],
      }),
    ).toBe(true);
  });

  it("rejects non-string checklist entries", () => {
    expect(
      isGeneratedPlan({
        checklist: ["ok", 2],
        recommendations: ["Tip A"],
      }),
    ).toBe(false);
  });

  it("rejects missing or invalid shapes", () => {
    expect(isGeneratedPlan(null)).toBe(false);
    expect(isGeneratedPlan({ checklist: [], recommendations: "bad" })).toBe(
      false,
    );
    expect(isGeneratedPlan({ checklist: "bad", recommendations: [] })).toBe(
      false,
    );
  });
});
