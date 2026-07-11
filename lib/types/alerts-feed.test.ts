import { isAlertsFeedPayload } from "@/lib/types/alerts-feed";
import { describe, expect, it } from "vitest";

describe("alerts feed types", () => {
  it("validates AI alerts feed payload", () => {
    expect(
      isAlertsFeedPayload({
        local: [
          {
            phase: "before",
            severity: "moderate",
            headline: "Rain building",
            message: "12 mm expected in 24h near your area.",
          },
          {
            phase: "during",
            severity: "high",
            headline: "Active showers",
            message: "Avoid underpasses now.",
          },
        ],
        national: [
          {
            phase: "before",
            severity: "moderate",
            headline: "Monsoon active",
            message: "Western coast belts on alert.",
          },
          {
            phase: "after",
            severity: "low",
            headline: "Recovery window",
            message: "North India clearing.",
          },
        ],
        nationalSummary: "Monsoon axis active across central and western India.",
      }),
    ).toBe(true);
  });

  it("rejects incomplete payloads", () => {
    expect(isAlertsFeedPayload({ local: [], national: [] })).toBe(false);
  });
});
