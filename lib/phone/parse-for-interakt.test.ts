import { describe, expect, it } from "vitest";
import { parsePhoneForInterakt } from "@/lib/phone/parse-for-interakt";

describe("parsePhoneForInterakt", () => {
  it("parses a plain 10-digit Indian number", () => {
    expect(parsePhoneForInterakt("9876543210", "+91")).toEqual({
      countryCode: "+91",
      phoneNumber: "9876543210",
    });
  });

  it("parses +91 prefixed numbers", () => {
    expect(parsePhoneForInterakt("+919876543210", "+91")).toEqual({
      countryCode: "+91",
      phoneNumber: "9876543210",
    });
  });

  it("strips leading zero from local numbers", () => {
    expect(parsePhoneForInterakt("09876543210", "+91")).toEqual({
      countryCode: "+91",
      phoneNumber: "9876543210",
    });
  });

  it("rejects empty input", () => {
    expect(() => parsePhoneForInterakt("   ", "+91")).toThrow(
      "Phone number is required",
    );
  });

  it("rejects invalid lengths", () => {
    expect(() => parsePhoneForInterakt("12345", "+91")).toThrow(
      "Enter a valid 10-digit mobile number",
    );
  });
});
