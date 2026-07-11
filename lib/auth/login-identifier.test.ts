import { describe, expect, it } from "vitest";
import {
  maskPhone,
  resolveChannel,
  resolveLoginIdentifier,
  whatsappPlaceholderEmail,
} from "@/lib/auth/login-identifier";

describe("resolveChannel", () => {
  it("normalizes whatsapp aliases", () => {
    expect(resolveChannel("whatsapp")).toBe("whatsapp");
    expect(resolveChannel("WA")).toBe("whatsapp");
  });

  it("defaults to email for unknown values", () => {
    expect(resolveChannel("sms")).toBe("email");
    expect(resolveChannel(undefined)).toBe("email");
  });
});

describe("whatsappPlaceholderEmail", () => {
  it("builds a stable placeholder email", () => {
    expect(whatsappPlaceholderEmail("+91", "9876543210")).toBe(
      "919876543210@whatsapp.jalvayu",
    );
  });
});

describe("maskPhone", () => {
  it("masks all but the last four digits", () => {
    expect(maskPhone("+91", "9876543210")).toBe("+91 ******3210");
  });
});

describe("resolveLoginIdentifier", () => {
  it("resolves a valid email login", () => {
    const result = resolveLoginIdentifier("email", "User@Example.com", "");

    expect(result).toMatchObject({
      channel: "email",
      email: "user@example.com",
      displayLabel: "user@example.com",
    });
  });

  it("rejects invalid email addresses", () => {
    expect(() => resolveLoginIdentifier("email", "not-an-email", "")).toThrow(
      "Enter a valid email address",
    );
  });

  it("resolves a valid whatsapp login", () => {
    const result = resolveLoginIdentifier("whatsapp", "", "9876543210");

    expect(result.channel).toBe("whatsapp");
    expect(result.phone).toBe("9876543210");
    expect(result.displayLabel).toBe("+91 ******3210");
  });

  it("requires a phone number for whatsapp", () => {
    expect(() => resolveLoginIdentifier("whatsapp", "", "")).toThrow(
      "Enter your WhatsApp number",
    );
  });
});
