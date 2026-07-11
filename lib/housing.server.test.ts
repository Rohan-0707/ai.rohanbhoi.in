import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { HousingType } from "@/generated/prisma/client";
import { mapHousingTypeToEnum } from "@/lib/housing.server";
import {
  isGoogleTranslateAvailable,
  translateTexts,
} from "@/lib/google-translate";

describe("mapHousingTypeToEnum", () => {
  it("maps UI housing labels to Prisma enums", () => {
    expect(mapHousingTypeToEnum("Apartment")).toBe(HousingType.APARTMENT);
    expect(mapHousingTypeToEnum("Independent House")).toBe(HousingType.HOUSE);
    expect(mapHousingTypeToEnum("Ground Floor")).toBe(
      HousingType.GROUND_FLOOR,
    );
  });

  it("falls back to apartment for unknown values", () => {
    expect(mapHousingTypeToEnum("Unknown")).toBe(HousingType.APARTMENT);
  });
});

describe("google-translate helpers", () => {
  const originalApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  beforeEach(() => {
    delete process.env.GOOGLE_TRANSLATE_API_KEY;
  });

  afterEach(() => {
    if (originalApiKey) {
      process.env.GOOGLE_TRANSLATE_API_KEY = originalApiKey;
    } else {
      delete process.env.GOOGLE_TRANSLATE_API_KEY;
    }
  });

  it("detects when Google Translate is not configured", () => {
    expect(isGoogleTranslateAvailable()).toBe(false);
  });

  it("detects when Google Translate is configured", () => {
    process.env.GOOGLE_TRANSLATE_API_KEY = "test-key";
    expect(isGoogleTranslateAvailable()).toBe(true);
  });

  it("returns the same text when source and target match", async () => {
    const texts = ["Stay indoors", "Keep emergency kit ready"];
    await expect(translateTexts(texts, "en", "en")).resolves.toEqual(texts);
  });

  it("throws when API key is missing", async () => {
    await expect(translateTexts(["Hello"], "hi")).rejects.toThrow(
      "GOOGLE_TRANSLATE_API_KEY is not configured",
    );
  });
});
