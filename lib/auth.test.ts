import { describe, expect, it, vi, afterEach } from "vitest";
import {
  generateOtpCode,
  getOtpExpiry,
  getSessionCookieOptions,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
} from "@/lib/auth";

describe("auth helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a 6-digit OTP code", () => {
    const code = generateOtpCode();
    expect(code).toMatch(/^\d{6}$/);
    expect(Number(code)).toBeGreaterThanOrEqual(100000);
    expect(Number(code)).toBeLessThanOrEqual(999999);
  });

  it("sets OTP expiry based on configured minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T12:00:00Z"));

    const expiry = getOtpExpiry();
    expect(expiry.getTime()).toBe(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    vi.useRealTimers();
  });

  it("exposes secure session cookie defaults", () => {
    const options = getSessionCookieOptions();

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.maxAge).toBeGreaterThan(0);
  });

  it("documents OTP attempt limits", () => {
    expect(OTP_MAX_ATTEMPTS).toBe(5);
  });
});
