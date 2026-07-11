import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  decryptData,
  decryptOptional,
  encryptData,
  encryptOptional,
} from "@/lib/encryption";

const TEST_KEY = "01234567890123456789012345678901";

describe("encryption", () => {
  const originalKey = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    if (originalKey) {
      process.env.ENCRYPTION_KEY = originalKey;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  });

  it("encrypts and decrypts text with a unique IV each time", () => {
    const plain = "Yelahanka, Bengaluru";

    const first = encryptData(plain);
    const second = encryptData(plain);

    expect(first).not.toBe(second);
    expect(decryptData(first)).toBe(plain);
    expect(decryptData(second)).toBe(plain);
    expect(first).toMatch(/^[0-9a-f]{32}:[0-9a-f]+$/i);
  });

  it("handles optional helpers", () => {
    expect(encryptOptional(null)).toBeNull();
    expect(decryptOptional(null)).toBeNull();

    const encrypted = encryptOptional("mobility issues");
    expect(encrypted).toBeTruthy();
    expect(decryptOptional(encrypted)).toBe("mobility issues");
  });

  it("returns legacy plaintext when value is not encrypted", () => {
    expect(decryptData("Plain Yelahanka address")).toBe(
      "Plain Yelahanka address",
    );
  });

  it("requires a 32-character ENCRYPTION_KEY", () => {
    process.env.ENCRYPTION_KEY = "too-short";

    expect(() => encryptData("test")).toThrow(
      "ENCRYPTION_KEY must be exactly 32 characters",
    );
  });
});
