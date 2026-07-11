import { describe, expect, it } from "vitest";
import { isValidPlanLanguage, LANGUAGE_LABELS } from "@/lib/languages";

describe("languages", () => {
  it("accepts supported language codes", () => {
    expect(isValidPlanLanguage("en")).toBe(true);
    expect(isValidPlanLanguage("hi")).toBe(true);
    expect(isValidPlanLanguage("kn")).toBe(true);
  });

  it("rejects unsupported language codes", () => {
    expect(isValidPlanLanguage("fr")).toBe(false);
    expect(isValidPlanLanguage("")).toBe(false);
    expect(isValidPlanLanguage("english")).toBe(false);
  });

  it("maps language codes to display labels", () => {
    expect(LANGUAGE_LABELS.en).toBe("English");
    expect(LANGUAGE_LABELS.hi).toBe("Hindi");
    expect(LANGUAGE_LABELS.kn).toBe("Kannada");
  });
});
