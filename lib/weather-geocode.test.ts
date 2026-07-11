import { describe, expect, it } from "vitest";

const PINCODE_PATTERN = /^\d{6}$/;

describe("pincode query detection", () => {
  it("matches 6-digit Indian PIN codes", () => {
    expect(PINCODE_PATTERN.test("413105")).toBe(true);
    expect(PINCODE_PATTERN.test("560064")).toBe(true);
  });

  it("does not match place names", () => {
    expect(PINCODE_PATTERN.test("Yelahanka")).toBe(false);
    expect(PINCODE_PATTERN.test("41310")).toBe(false);
  });
});
