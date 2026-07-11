import { describe, expect, it } from "vitest";
import {
  isJudgeTestAccess,
  isJudgeTestEmail,
  JUDGE_TEST_EMAIL,
  JUDGE_TEST_OTP,
} from "@/lib/auth/judge-access";

describe("judge-access", () => {
  it("recognizes the evaluator email", () => {
    expect(isJudgeTestEmail(JUDGE_TEST_EMAIL)).toBe(true);
    expect(isJudgeTestEmail("  Judge@Google.com ")).toBe(true);
    expect(isJudgeTestEmail("judge@example.com")).toBe(false);
  });

  it("validates evaluator OTP access", () => {
    expect(
      isJudgeTestAccess("email", JUDGE_TEST_EMAIL, JUDGE_TEST_OTP),
    ).toBe(true);
    expect(isJudgeTestAccess("whatsapp", JUDGE_TEST_EMAIL, JUDGE_TEST_OTP)).toBe(
      false,
    );
    expect(isJudgeTestAccess("email", JUDGE_TEST_EMAIL, "000000")).toBe(false);
  });
});
