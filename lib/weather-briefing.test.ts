import { describe, expect, it } from "vitest";
import { isWeatherBriefing } from "@/lib/weather-briefing";

const validBriefing = {
  headline: "Rain likely across Yelahanka this evening",
  riskLevel: "moderate",
  riskSummary: "Moderate rain may stress local drains.",
  monsoonOutlook: {
    next24Hours: "Intermittent showers with heavier bursts after sunset.",
    peakConcern: "Waterlogging near low-lying junctions",
    floodRisk: "moderate",
  },
  travelGuidance: [
    "Avoid the underpass on Bellary Road",
    "Use elevated service roads near the airport",
  ],
  preparednessActions: ["Charge power banks", "Move valuables above floor level"],
  watchFor: ["Rising water near storm drains", "Sudden thunder alerts"],
};

describe("isWeatherBriefing", () => {
  it("accepts a valid AI weather briefing payload", () => {
    expect(isWeatherBriefing(validBriefing)).toBe(true);
  });

  it("rejects invalid risk levels and missing arrays", () => {
    expect(
      isWeatherBriefing({
        ...validBriefing,
        riskLevel: "extreme",
      }),
    ).toBe(false);

    expect(
      isWeatherBriefing({
        ...validBriefing,
        travelGuidance: ["only one"],
      }),
    ).toBe(false);
  });
});
