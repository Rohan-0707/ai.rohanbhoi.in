import { describe, expect, it } from "vitest";
import {
  normalizeChecklist,
  reassemblePhasedChecklist,
} from "@/lib/plan-checklist";

describe("plan-checklist helpers", () => {
  it("normalizes legacy flat checklist arrays", () => {
    expect(normalizeChecklist(["A", "B"])).toEqual([
      { phase: "Checklist", items: ["A", "B"] },
    ]);
  });

  it("preserves phased checklist arrays", () => {
    const phased = [
      { phase: "Before the storm", items: ["A"] },
      { phase: "During the storm", items: ["B"] },
      { phase: "After the storm", items: ["C"] },
    ];

    expect(normalizeChecklist(phased)).toEqual(phased);
  });

  it("reassembles translated phased checklist text", () => {
    const phases = [
      { phase: "Before the storm", items: ["A", "B"] },
      { phase: "During the storm", items: ["C"] },
    ];

    expect(
      reassemblePhasedChecklist(phases, [
        "पहले",
        "एक",
        "दो",
        "दौरान",
        "तीन",
      ]),
    ).toEqual([
      { phase: "पहले", items: ["एक", "दो"] },
      { phase: "दौरान", items: ["तीन"] },
    ]);
  });
});
